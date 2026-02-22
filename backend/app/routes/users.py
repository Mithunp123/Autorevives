from flask import Blueprint, request, jsonify

from ..utils import role_required, login_required, serialize_row, serialize_rows

users_bp = Blueprint("users", __name__)


def _get_db():
    from .. import db
    return db.get_db()


@users_bp.route("/", methods=["GET"])
@role_required("admin")
def get_users():
    role_filter = request.args.get("role")
    status_filter = request.args.get("status")
    search = request.args.get("search", "")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))

    conn = _get_db()
    cursor = conn.cursor()
    try:
        query = """
            SELECT u.*,
                   COUNT(DISTINCT p.id) as product_count,
                   COUNT(DISTINCT b.id) as bid_count,
                   COALESCE(SUM(b.amount), 0) as total_bids
            FROM users u
            LEFT JOIN products p ON u.id = p.office_id
            LEFT JOIN bids b ON u.id = b.user_id
            WHERE 1=1
        """
        params = []

        if role_filter:
            query += " AND u.role = %s"
            params.append(role_filter)
        if status_filter:
            query += " AND u.status = %s"
            params.append(status_filter)
        if search:
            query += " AND (u.username LIKE %s OR u.email LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])

        query += " GROUP BY u.id ORDER BY u.created_at DESC"

        # Count query
        count_query = f"SELECT COUNT(*) as total FROM ({query}) as sub"
        cursor.execute(count_query, params)
        total = cursor.fetchone()["total"]

        # Paginate
        offset = (page - 1) * per_page
        query += " LIMIT %s OFFSET %s"
        params.extend([per_page, offset])
        cursor.execute(query, params)
        users = serialize_rows(cursor.fetchall())

        return jsonify({
            "users": users,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
        })
    finally:
        cursor.close()
        conn.close()


@users_bp.route("/<int:user_id>", methods=["GET"])
@role_required("admin")
def get_user(user_id):
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Get user's bids
        cursor.execute(
            """SELECT b.*, p.name as product_name
               FROM bids b JOIN products p ON b.product_id = p.id
               WHERE b.user_id = %s ORDER BY b.bid_time DESC LIMIT 20""",
            (user_id,),
        )
        bids = serialize_rows(cursor.fetchall())

        return jsonify({"user": serialize_row(user), "bids": bids})
    finally:
        cursor.close()
        conn.close()


@users_bp.route("/<int:user_id>/block", methods=["PATCH"])
@role_required("admin")
def block_user(user_id):
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET status = 'blocked' WHERE id = %s AND role != 'admin'", (user_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "User not found or is admin"}), 404
        return jsonify({"message": "User blocked successfully"})
    finally:
        cursor.close()
        conn.close()


@users_bp.route("/<int:user_id>/unblock", methods=["PATCH"])
@role_required("admin")
def unblock_user(user_id):
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET status = 'active' WHERE id = %s", (user_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"message": "User unblocked successfully"})
    finally:
        cursor.close()
        conn.close()


@users_bp.route("/<int:user_id>", methods=["DELETE"])
@role_required("admin")
def delete_user(user_id):
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE id = %s AND role != 'admin'", (user_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "User not found or is admin"}), 404
        return jsonify({"message": "User deleted successfully"})
    finally:
        cursor.close()
        conn.close()
