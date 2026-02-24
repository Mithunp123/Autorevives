from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from ..utils import generate_token, login_required, serialize_row

auth_bp = Blueprint("auth", __name__)


def _get_db():
    from .. import db
    return db.get_db()


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username/email and password are required"}), 400

    conn = _get_db()
    cursor = conn.cursor()
    try:
        # Allow login with username OR email
        cursor.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, username))
        user = cursor.fetchone()

        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Invalid username or password"}), 401

        if user["status"] == "pending":
            return jsonify({"error": "Your account is pending approval"}), 403

        if user["status"] == "blocked":
            return jsonify({"error": "Your account has been blocked"}), 403

        token = generate_token(user)
        user_data = serialize_row(user)

        return jsonify({
            "message": f"Welcome back, {user['username']}!",
            "token": token,
            "user": user_data,
        })
    finally:
        cursor.close()
        conn.close()


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    role = data.get("role", "user")
    mobile_number = data.get("mobile_number", "")
    finance_name = data.get("finance_name", "")
    owner_name = data.get("owner_name", "")

    if not username or not email or not password:
        return jsonify({"error": "Username, email and password are required"}), 400

    if role not in ("office", "user"):
        return jsonify({"error": "Invalid role"}), 400

    status = "active" if role == "user" else "pending"
    password_hash = generate_password_hash(password)

    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO users (username, email, mobile_number, finance_name, owner_name, password_hash, role, status)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            (username, email, mobile_number, finance_name, owner_name, password_hash, role, status),
        )
        conn.commit()

        if role == "office":
            msg = "Registration successful! Please wait for admin approval."
        else:
            msg = "Registration successful! You can now login."

        return jsonify({"message": msg}), 201
    except Exception as e:
        err = str(e)
        if "Duplicate" in err:
            if "username" in err:
                return jsonify({"error": "Username already taken"}), 409
            if "email" in err:
                return jsonify({"error": "Email already registered"}), 409
        return jsonify({"error": f"Registration failed: {err}"}), 500
    finally:
        cursor.close()
        conn.close()


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    # JWT is stateless — client simply discards the token.
    # This endpoint exists so the frontend call doesn't 404/CORS-fail.
    return jsonify({"message": "Logged out successfully"})


@auth_bp.route("/profile", methods=["GET"])
@login_required
def get_profile():
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE id = %s", (request.current_user["user_id"],))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        user_data = serialize_row(user)

        # Get additional stats
        stats = {}
        if user["role"] == "user":
            cursor.execute(
                "SELECT COUNT(*) as bid_count, COALESCE(SUM(amount), 0) as total_bids FROM bids WHERE user_id = %s",
                (user["id"],),
            )
            bid_stats = cursor.fetchone()
            stats["bid_count"] = bid_stats["bid_count"] or 0
            stats["total_bids"] = float(bid_stats["total_bids"] or 0)

            cursor.execute(
                """SELECT p.*, MAX(b.amount) as my_bid, MAX(b.bid_time) as last_bid_time
                   FROM products p JOIN bids b ON p.id = b.product_id
                   WHERE b.user_id = %s GROUP BY p.id
                   ORDER BY last_bid_time DESC LIMIT 5""",
                (user["id"],),
            )
            from ..utils import serialize_rows
            stats["recent_bids"] = serialize_rows(cursor.fetchall())

        elif user["role"] == "office":
            cursor.execute(
                "SELECT COUNT(*) as product_count FROM products WHERE office_id = %s",
                (user["id"],),
            )
            stats["product_count"] = cursor.fetchone()["product_count"] or 0

            cursor.execute(
                """SELECT COUNT(*) as total_bids, COALESCE(SUM(b.amount), 0) as bid_volume
                   FROM bids b JOIN products p ON b.product_id = p.id
                   WHERE p.office_id = %s""",
                (user["id"],),
            )
            bid_stats = cursor.fetchone()
            stats["total_bids"] = bid_stats["total_bids"] or 0
            stats["bid_volume"] = float(bid_stats["bid_volume"] or 0)

        return jsonify({"user": user_data, "stats": stats})
    finally:
        cursor.close()
        conn.close()


@auth_bp.route("/profile", methods=["PUT"])
@login_required
def update_profile():
    data = request.get_json() or {}
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE id = %s", (request.current_user["user_id"],))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Update fields
        email = data.get("email", user["email"])
        mobile_number = data.get("mobile_number", user["mobile_number"])

        cursor.execute(
            "UPDATE users SET email = %s, mobile_number = %s WHERE id = %s",
            (email, mobile_number, user["id"]),
        )

        # Update password if provided
        current_password = data.get("current_password")
        new_password = data.get("new_password")
        if current_password and new_password:
            if not check_password_hash(user["password_hash"], current_password):
                return jsonify({"error": "Current password is incorrect"}), 400
            cursor.execute(
                "UPDATE users SET password_hash = %s WHERE id = %s",
                (generate_password_hash(new_password), user["id"]),
            )

        conn.commit()
        return jsonify({"message": "Profile updated successfully"})
    finally:
        cursor.close()
        conn.close()
