from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash

from ..utils import login_required, role_required, serialize_row, serialize_rows

offices_bp = Blueprint("offices", __name__)


def _get_db():
    from .. import db
    return db.get_db()


@offices_bp.route("/", methods=["GET"])
@role_required("admin")
def get_offices():
    status_filter = request.args.get("status")
    search = request.args.get("search", "")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))

    conn = _get_db()
    cursor = conn.cursor()
    try:
        query = """
            SELECT u.*, COUNT(p.id) as product_count
            FROM users u
            LEFT JOIN products p ON u.id = p.office_id
            WHERE u.role = 'office'
        """
        params = []

        if status_filter:
            query += " AND u.status = %s"
            params.append(status_filter)
        if search:
            query += " AND (u.username LIKE %s OR u.finance_name LIKE %s OR u.owner_name LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

        query += " GROUP BY u.id ORDER BY u.created_at DESC"

        count_query = f"SELECT COUNT(*) as total FROM ({query}) as sub"
        cursor.execute(count_query, params)
        total = cursor.fetchone()["total"]

        offset = (page - 1) * per_page
        query += " LIMIT %s OFFSET %s"
        params.extend([per_page, offset])
        cursor.execute(query, params)
        offices = serialize_rows(cursor.fetchall())

        return jsonify({
            "offices": offices,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
        })
    finally:
        cursor.close()
        conn.close()


@offices_bp.route("/", methods=["POST"])
@role_required("admin")
def create_office():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    finance_name = data.get("finance_name", "")
    owner_name = data.get("owner_name", "")
    mobile_number = data.get("mobile_number", "")

    if not username or not email or not password:
        return jsonify({"error": "Username, email and password are required"}), 400

    hashed = generate_password_hash(password)
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO users (username, email, mobile_number, finance_name, owner_name, password_hash, role, status)
               VALUES (%s, %s, %s, %s, %s, %s, 'office', 'active')""",
            (username, email, mobile_number, finance_name, owner_name, hashed),
        )
        conn.commit()
        return jsonify({"message": "Office created successfully", "id": cursor.lastrowid}), 201
    except Exception as e:
        err = str(e)
        if "Duplicate" in err:
            return jsonify({"error": "Username or email already exists"}), 409
        return jsonify({"error": f"Failed to create office: {err}"}), 500
    finally:
        cursor.close()
        conn.close()


@offices_bp.route("/<int:office_id>", methods=["PUT"])
@role_required("admin")
def update_office(office_id):
    data = request.get_json() or {}
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE id = %s AND role = 'office'", (office_id,))
        office = cursor.fetchone()
        if not office:
            return jsonify({"error": "Office not found"}), 404

        email = data.get("email", office["email"])
        finance_name = data.get("finance_name", office["finance_name"])
        owner_name = data.get("owner_name", office["owner_name"])
        mobile_number = data.get("mobile_number", office["mobile_number"])

        cursor.execute(
            """UPDATE users SET email = %s, finance_name = %s, owner_name = %s, mobile_number = %s
               WHERE id = %s""",
            (email, finance_name, owner_name, mobile_number, office_id),
        )
        conn.commit()
        return jsonify({"message": "Office updated successfully"})
    finally:
        cursor.close()
        conn.close()


@offices_bp.route("/<int:office_id>/approve", methods=["PATCH"])
@role_required("admin")
def approve_office(office_id):
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET status = 'active' WHERE id = %s AND role = 'office'", (office_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Office not found"}), 404
        return jsonify({"message": "Office approved successfully"})
    finally:
        cursor.close()
        conn.close()


@offices_bp.route("/<int:office_id>", methods=["DELETE"])
@role_required("admin")
def delete_office(office_id):
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE id = %s AND role = 'office'", (office_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Office not found"}), 404
        return jsonify({"message": "Office deleted successfully"})
    finally:
        cursor.close()
        conn.close()


# ── Office Details (for logged-in office users) ─────────────────────────


@offices_bp.route("/details", methods=["GET"])
@login_required
def get_office_details():
    """Get office details for the logged-in office user or admin viewing an office."""
    user_id = request.current_user["user_id"]
    role = request.current_user.get("role", "")

    # Admin can pass ?user_id=<id> to view a specific office
    target_id = request.args.get("user_id", user_id, type=int)
    if role != "admin":
        target_id = user_id  # Non-admin can only see their own

    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM office_details WHERE user_id = %s", (target_id,))
        details = cursor.fetchone()

        if details:
            return jsonify({"details": serialize_row(details)})
        else:
            return jsonify({"details": None})
    finally:
        cursor.close()
        conn.close()


@offices_bp.route("/details", methods=["PUT"])
@login_required
def update_office_details():
    """Create or update office details for the logged-in office user."""
    user_id = request.current_user["user_id"]
    role = request.current_user.get("role", "")

    # Only office or admin can update
    if role not in ("office", "admin"):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}

    fields = {
        "gst_number": data.get("gst_number", "").strip(),
        "pan_number": data.get("pan_number", "").strip(),
        "cin_number": data.get("cin_number", "").strip(),
        "company_address": data.get("company_address", "").strip(),
        "city": data.get("city", "").strip(),
        "state": data.get("state", "").strip(),
        "pincode": data.get("pincode", "").strip(),
        "bank_name": data.get("bank_name", "").strip(),
        "bank_account_number": data.get("bank_account_number", "").strip(),
        "bank_ifsc_code": data.get("bank_ifsc_code", "").strip(),
        "bank_branch": data.get("bank_branch", "").strip(),
        "authorized_person": data.get("authorized_person", "").strip(),
        "designation": data.get("designation", "").strip(),
        "website": data.get("website", "").strip(),
    }

    conn = _get_db()
    cursor = conn.cursor()
    try:
        # Check if record exists
        cursor.execute("SELECT id FROM office_details WHERE user_id = %s", (user_id,))
        existing = cursor.fetchone()

        if existing:
            set_clause = ", ".join(f"{k} = %s" for k in fields)
            values = list(fields.values()) + [user_id]
            cursor.execute(
                f"UPDATE office_details SET {set_clause} WHERE user_id = %s",
                values,
            )
        else:
            cols = ["user_id"] + list(fields.keys())
            placeholders = ", ".join(["%s"] * len(cols))
            col_names = ", ".join(cols)
            values = [user_id] + list(fields.values())
            cursor.execute(
                f"INSERT INTO office_details ({col_names}) VALUES ({placeholders})",
                values,
            )

        conn.commit()
        return jsonify({"message": "Office details updated successfully"})
    except Exception as e:
        return jsonify({"error": f"Failed to update details: {str(e)}"}), 500
    finally:
        cursor.close()
        conn.close()


@offices_bp.route("/details/<int:office_user_id>", methods=["GET"])
@role_required("admin")
def get_office_details_admin(office_user_id):
    """Admin: Get office details for a specific office user."""
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM office_details WHERE user_id = %s", (office_user_id,))
        details = cursor.fetchone()
        return jsonify({"details": serialize_row(details) if details else None})
    finally:
        cursor.close()
        conn.close()
