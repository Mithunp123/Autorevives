import os
import time
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename

from ..utils import login_required, role_required, allowed_file, serialize_row, serialize_rows

vehicles_bp = Blueprint("vehicles", __name__)


def _get_db():
    from .. import db
    return db.get_db()


@vehicles_bp.route("/", methods=["GET"])
@login_required
def get_vehicles():
    status_filter = request.args.get("status")
    search = request.args.get("search", "")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))

    conn = _get_db()
    cursor = conn.cursor()
    try:
        query = """
            SELECT p.*, u.username as office_name,
                   COALESCE(MAX(b.amount), 0) as current_bid,
                   COUNT(b.id) as bid_count
            FROM products p
            JOIN users u ON p.office_id = u.id
            LEFT JOIN bids b ON p.id = b.product_id
            WHERE 1=1
        """
        params = []

        # Office users can only see their own products
        if request.current_user.get("role") == "office":
            query += " AND p.office_id = %s"
            params.append(request.current_user["user_id"])

        if status_filter:
            query += " AND p.status = %s"
            params.append(status_filter)
        if search:
            query += " AND (p.name LIKE %s OR p.description LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])

        query += " GROUP BY p.id ORDER BY p.created_at DESC"

        # Count
        count_query = f"SELECT COUNT(*) as total FROM ({query}) as sub"
        cursor.execute(count_query, params)
        total = cursor.fetchone()["total"]

        # Paginate
        offset = (page - 1) * per_page
        query += " LIMIT %s OFFSET %s"
        params.extend([per_page, offset])
        cursor.execute(query, params)
        vehicles = serialize_rows(cursor.fetchall())

        return jsonify({
            "vehicles": vehicles,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
        })
    finally:
        cursor.close()
        conn.close()


@vehicles_bp.route("/<int:vehicle_id>", methods=["GET"])
def get_vehicle(vehicle_id):
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """SELECT p.*, u.username as office_name
               FROM products p JOIN users u ON p.office_id = u.id
               WHERE p.id = %s""",
            (vehicle_id,),
        )
        vehicle = cursor.fetchone()
        if not vehicle:
            return jsonify({"error": "Vehicle not found"}), 404

        # Get bids
        cursor.execute(
            """SELECT b.*, u.username as bidder_name
               FROM bids b JOIN users u ON b.user_id = u.id
               WHERE b.product_id = %s ORDER BY b.amount DESC""",
            (vehicle_id,),
        )
        bids = serialize_rows(cursor.fetchall())

        # Current highest bid
        current_bid = bids[0]["amount"] if bids else float(vehicle["starting_price"])

        vehicle_data = serialize_row(vehicle)
        vehicle_data["current_bid"] = current_bid
        vehicle_data["bid_count"] = len(bids)

        return jsonify({"vehicle": vehicle_data, "bids": bids})
    finally:
        cursor.close()
        conn.close()


@vehicles_bp.route("/", methods=["POST"])
@role_required("office", "admin")
def create_vehicle():
    name = request.form.get("name", "").strip()
    description = request.form.get("description", "").strip()
    category = request.form.get("category", "").strip()
    starting_price = request.form.get("starting_price", 0)
    quoted_price = request.form.get("quoted_price", "").strip() or None

    if not name or not starting_price:
        return jsonify({"error": "Name and starting price are required"}), 400

    # Handle image upload with unique filename
    image_path = None
    if "image" in request.files:
        file = request.files["image"]
        if file and file.filename and allowed_file(file.filename):
            original = secure_filename(file.filename)
            name_part, ext = os.path.splitext(original)
            filename = f"{name_part}_{int(time.time())}{ext}"
            file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], filename))
            image_path = f"uploads/{filename}"

    office_id = request.current_user["user_id"]
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO products (office_id, name, description, category, image_path, starting_price, quoted_price, status)
               VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending')""",
            (office_id, name, description, category or None, image_path, starting_price, quoted_price),
        )
        conn.commit()
        return jsonify({"message": "Vehicle added! Waiting for admin approval.", "id": cursor.lastrowid}), 201
    finally:
        cursor.close()
        conn.close()


@vehicles_bp.route("/<int:vehicle_id>", methods=["PUT"])
@login_required
def update_vehicle(vehicle_id):
    conn = _get_db()
    cursor = conn.cursor()
    try:
        # Check ownership
        cursor.execute("SELECT * FROM products WHERE id = %s", (vehicle_id,))
        vehicle = cursor.fetchone()
        if not vehicle:
            return jsonify({"error": "Vehicle not found"}), 404

        if request.current_user["role"] != "admin" and vehicle["office_id"] != request.current_user["user_id"]:
            return jsonify({"error": "Unauthorized"}), 403

        name = request.form.get("name", vehicle["name"])
        description = request.form.get("description", vehicle["description"])
        category = request.form.get("category", vehicle.get("category", ""))
        starting_price = request.form.get("starting_price", vehicle["starting_price"])
        quoted_price = request.form.get("quoted_price", vehicle.get("quoted_price"))
        if quoted_price == '':
            quoted_price = None
        image_path = vehicle["image_path"]

        # Admin can also update status
        status = vehicle["status"]
        if request.current_user["role"] == "admin":
            new_status = request.form.get("status", "")
            if new_status in ('pending', 'approved', 'rejected'):
                status = new_status

        if "image" in request.files:
            file = request.files["image"]
            if file and file.filename and allowed_file(file.filename):
                original = secure_filename(file.filename)
                name_part, ext = os.path.splitext(original)
                filename = f"{name_part}_{int(time.time())}{ext}"
                file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], filename))
                image_path = f"uploads/{filename}"

        cursor.execute(
            """UPDATE products SET name = %s, description = %s, category = %s,
               starting_price = %s, quoted_price = %s, image_path = %s, status = %s
               WHERE id = %s""",
            (name, description, category or None, starting_price, quoted_price, image_path, status, vehicle_id),
        )
        conn.commit()
        return jsonify({"message": "Vehicle updated successfully"})
    finally:
        cursor.close()
        conn.close()


@vehicles_bp.route("/<int:vehicle_id>", methods=["DELETE"])
@role_required("admin")
def delete_vehicle(vehicle_id):
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM products WHERE id = %s", (vehicle_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Vehicle not found"}), 404
        return jsonify({"message": "Vehicle deleted successfully"})
    finally:
        cursor.close()
        conn.close()


@vehicles_bp.route("/<int:vehicle_id>/approve", methods=["PATCH"])
@role_required("admin")
def approve_vehicle(vehicle_id):
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE products SET status = 'approved' WHERE id = %s", (vehicle_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Vehicle not found"}), 404
        return jsonify({"message": "Vehicle approved successfully"})
    finally:
        cursor.close()
        conn.close()


@vehicles_bp.route("/<int:vehicle_id>/reject", methods=["PATCH"])
@role_required("admin")
def reject_vehicle(vehicle_id):
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE products SET status = 'rejected' WHERE id = %s", (vehicle_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Vehicle not found"}), 404
        return jsonify({"message": "Vehicle rejected"})
    finally:
        cursor.close()
        conn.close()


@vehicles_bp.route("/<int:vehicle_id>/bid", methods=["POST"])
@role_required("user")
def place_bid(vehicle_id):
    data = request.get_json() or {}
    raw_amount = data.get("amount")
    if raw_amount is None or raw_amount == "":
        return jsonify({"error": "Bid amount is required"}), 400

    try:
        bid_amount = round(float(raw_amount), 2)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid bid amount"}), 400

    if bid_amount <= 0:
        return jsonify({"error": "Bid amount must be a positive number"}), 400

    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM products WHERE id = %s AND status = 'approved'", (vehicle_id,))
        product = cursor.fetchone()
        if not product:
            return jsonify({"error": "Vehicle not found or not available for bidding"}), 404

        cursor.execute("SELECT MAX(amount) as max_bid FROM bids WHERE product_id = %s", (vehicle_id,))
        result = cursor.fetchone()
        current_max = float(result["max_bid"]) if result["max_bid"] else float(product["starting_price"])

        if bid_amount <= current_max:
            return jsonify({"error": f"Bid must be higher than current price: ₹{current_max:,.2f}"}), 400

        cursor.execute(
            "INSERT INTO bids (product_id, user_id, amount) VALUES (%s, %s, %s)",
            (vehicle_id, request.current_user["user_id"], bid_amount),
        )
        conn.commit()
        return jsonify({"message": "Bid placed successfully!", "bid_amount": bid_amount, "amount": bid_amount}), 201
    finally:
        cursor.close()
        conn.close()
