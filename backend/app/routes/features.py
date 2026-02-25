from flask import Blueprint, request, jsonify
import json
from ..utils import login_required, serialize_rows, serialize_row

features_bp = Blueprint("features", __name__)

def _get_db():
    from .. import db
    return db.get_db()

@features_bp.route("/wishlist", methods=["GET"])
@login_required
def get_wishlist():
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT items FROM wishlists WHERE user_id = %s", (request.current_user["user_id"],))
        row = cursor.fetchone()
        
        items = json.loads(row["items"]) if row and row["items"] else []
        
        if not items:
            return jsonify({"wishlist": []}), 200
            
        format_strings = ','.join(['%s'] * len(items))
        cursor.execute(f"SELECT * FROM products WHERE id IN ({format_strings})", tuple(items))
        products = cursor.fetchall()
        
        return jsonify({"wishlist": serialize_rows(products)}), 200
    finally:
        cursor.close()
        conn.close()

@features_bp.route("/wishlist", methods=["POST"])
@login_required
def toggle_wishlist():
    data = request.get_json() or {}
    product_id = data.get("product_id")
    
    if not product_id:
        return jsonify({"error": "Product ID is required"}), 400
        
    conn = _get_db()
    cursor = conn.cursor()
    try:
        user_id = request.current_user["user_id"]
        cursor.execute("SELECT items FROM wishlists WHERE user_id = %s", (user_id,))
        row = cursor.fetchone()
        
        items = json.loads(row["items"]) if row and row["items"] else []
        product_id = int(product_id)
        
        if product_id in items:
            items.remove(product_id)
            message = "Removed from wishlist"
        else:
            items.append(product_id)
            message = "Added to wishlist"
            
        items_json = json.dumps(items)
        
        if row:
            cursor.execute("UPDATE wishlists SET items = %s WHERE user_id = %s", (items_json, user_id))
        else:
            cursor.execute("INSERT INTO wishlists (user_id, items) VALUES (%s, %s)", (user_id, items_json))
            
        conn.commit()
        return jsonify({"message": message, "wishlist_items": items}), 200
    finally:
        cursor.close()
        conn.close()

@features_bp.route("/transactions", methods=["GET"])
@login_required
def get_transactions():
    conn = _get_db()
    cursor = conn.cursor()
    try:
        user_id = request.current_user["user_id"]
        cursor.execute("""
            SELECT t.*, p.name as product_name, p.image_path as product_image
            FROM transactions t
            JOIN products p ON t.product_id = p.id
            WHERE t.user_id = %s
            ORDER BY t.transaction_date DESC
        """, (user_id,))
        transactions = serialize_rows(cursor.fetchall())
        return jsonify({"transactions": transactions}), 200
    finally:
        cursor.close()
        conn.close()


@features_bp.route("/log-error", methods=["POST"])
def log_error():
    """
    Public endpoint — accepts a rich error payload from the frontend
    and stores it in the error_logs table.
    """
    try:
        data = request.get_json() or {}

        def _s(key, limit=None):
            val = data.get(key) or None
            if val and limit:
                val = str(val)[:limit]
            return val

        # ── Try to resolve user from JWT (optional) ──────────────────────────
        user_id = None
        username = None
        try:
            from ..utils import decode_token
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ", 1)[1]
                payload = decode_token(token)
                if payload:
                    user_id = payload.get("user_id")
                    username = payload.get("username")
        except Exception:
            pass

        # ── Resolve real client IP (handles proxies) ──────────────────────────
        ip = (
            request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
            or request.headers.get("X-Real-IP")
            or request.remote_addr
            or None
        )

        # ── occurred_at: use client-sent ISO timestamp or fallback to now ──────
        from datetime import datetime as _dt
        occurred_at_raw = data.get("occurred_at")
        try:
            occurred_at = _dt.fromisoformat(occurred_at_raw.replace("Z", "+00:00")) if occurred_at_raw else _dt.utcnow()
        except Exception:
            occurred_at = _dt.utcnow()

        conn = _get_db()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO error_logs (
                    user_id, username,
                    error_type, error_message, error_stack, component_name,
                    page_url, page_title, referrer_url,
                    device_type, device_model,
                    os_name, os_version,
                    browser_name, browser_version, user_agent,
                    screen_width, screen_height,
                    viewport_width, viewport_height,
                    language, timezone,
                    ip_address, app_version,
                    occurred_at
                ) VALUES (
                    %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s,
                    %s, %s,
                    %s, %s,
                    %s, %s, %s,
                    %s, %s,
                    %s, %s,
                    %s, %s,
                    %s, %s,
                    %s
                )
            """, (
                user_id, username,
                _s("error_type", 50) or "frontend",
                _s("error_message", 5000),
                _s("error_stack", 10000),
                _s("component_name", 255),
                _s("page_url", 1000),
                _s("page_title", 500),
                _s("referrer_url", 1000),
                _s("device_type", 50),
                _s("device_model", 255),
                _s("os_name", 100),
                _s("os_version", 100),
                _s("browser_name", 100),
                _s("browser_version", 100),
                _s("user_agent", 5000),
                data.get("screen_width"),
                data.get("screen_height"),
                data.get("viewport_width"),
                data.get("viewport_height"),
                _s("language", 20),
                _s("timezone", 100),
                ip[:45] if ip else None,
                _s("app_version", 50),
                occurred_at,
            ))
            conn.commit()
        finally:
            cursor.close()
            conn.close()

        return jsonify({"logged": True}), 200

    except Exception as e:
        print(f"[error_logs] Failed to log error: {e}")
        return jsonify({"logged": False}), 200  # Always 200 — never break the client


@features_bp.route("/log-error", methods=["GET"])
@login_required
def get_error_logs():
    """
    Admin-only endpoint to fetch error logs.
    Query params: error_type, user_id, date_from, date_to, limit (max 500)
    """
    from ..utils import role_required
    if request.current_user.get("role") != "admin":
        return jsonify({"error": "Forbidden"}), 403

    conn = _get_db()
    cursor = conn.cursor()
    try:
        filters = []
        params = []

        if request.args.get("error_type"):
            filters.append("error_type = %s")
            params.append(request.args["error_type"])

        if request.args.get("user_id"):
            filters.append("user_id = %s")
            params.append(request.args["user_id"])

        if request.args.get("date_from"):
            filters.append("occurred_at >= %s")
            params.append(request.args["date_from"])

        if request.args.get("date_to"):
            filters.append("occurred_at <= %s")
            params.append(request.args["date_to"])

        where = ("WHERE " + " AND ".join(filters)) if filters else ""
        limit = min(int(request.args.get("limit", 100)), 500)

        cursor.execute(f"""
            SELECT * FROM error_logs
            {where}
            ORDER BY occurred_at DESC
            LIMIT %s
        """, params + [limit])

        from ..utils import serialize_rows
        logs = serialize_rows(cursor.fetchall())
        return jsonify({"logs": logs, "total": len(logs)}), 200

    finally:
        cursor.close()
        conn.close()


