import os
import time
import json
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from PIL import Image

from ..utils import login_required, role_required, allowed_file, serialize_row, serialize_rows

vehicles_bp = Blueprint("vehicles", __name__)


def _get_db():
    from .. import db
    return db.get_db()


def _convert_to_webp(file_path):
    """Convert an image file to WebP format for smaller file size.
    Returns the new file path (with .webp extension)."""
    try:
        img = Image.open(file_path)
        # Convert RGBA to RGB if needed (WebP supports RGBA but some modes cause issues)
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGBA')
        else:
            img = img.convert('RGB')
        webp_path = os.path.splitext(file_path)[0] + '.webp'
        img.save(webp_path, 'WEBP', quality=85, optimize=True)
        img.close()
        # Remove the original file if conversion succeeded and it's a different file
        if webp_path != file_path and os.path.exists(webp_path):
            os.remove(file_path)
        return webp_path
    except Exception as e:
        current_app.logger.warning(f"WebP conversion failed for {file_path}: {e}")
        return file_path  # Return original if conversion fails


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


@vehicles_bp.route("/upload-image", methods=["POST"])
@role_required("office", "admin")
def upload_single_image():
    """Upload a single image and return its path.
    Used by the frontend to upload images one-by-one before form submission."""
    category = request.form.get("category", "").strip() or "uncategorized"
    image_type = request.form.get("type", "vehicle")  # vehicle | rc | insurance
    file = request.files.get("image")

    if not file or not file.filename:
        return jsonify({"error": "No image provided"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    office_id = request.current_user["user_id"]
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT mobile_number FROM users WHERE id = %s", (office_id,))
        user_row = cursor.fetchone()
        officer_mobile = user_row["mobile_number"] if user_row and user_row.get("mobile_number") else str(office_id)
        officer_mobile = ''.join(filter(str.isdigit, officer_mobile)) or str(office_id)
    except Exception:
        officer_mobile = str(office_id)
    finally:
        cursor.close()
        conn.close()

    upload_subfolder = os.path.join(officer_mobile, category)
    upload_path = os.path.join(current_app.config["UPLOAD_FOLDER"], upload_subfolder)
    os.makedirs(upload_path, exist_ok=True)

    original = secure_filename(file.filename)
    name_part, ext = os.path.splitext(original)
    prefix = {"rc": "rc_", "insurance": "ins_"}.get(image_type, "")
    filename = f"{prefix}{name_part}_{int(time.time())}{ext}"
    saved_file_path = os.path.join(upload_path, filename)
    file.save(saved_file_path)

    # Convert to WebP for smaller file size
    if ext.lower() in ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'):
        converted_path = _convert_to_webp(saved_file_path)
        filename = os.path.basename(converted_path)

    saved_path = f"uploads/{upload_subfolder}/{filename}".replace("\\", "/")

    return jsonify({"path": saved_path}), 201


@vehicles_bp.route("/", methods=["POST"])
@role_required("office", "admin")
def create_vehicle():
    name = request.form.get("name", "").strip()
    description = request.form.get("description", "").strip()
    category = request.form.get("category", "").strip()
    state = request.form.get("state", "").strip()
    starting_price = request.form.get("starting_price", 0)
    quoted_price = request.form.get("quoted_price", "").strip() or None
    
    # New fields
    bid_end_date = request.form.get("bid_end_date", "").strip() or None
    vehicle_year = request.form.get("vehicle_year", "").strip() or None
    mileage = request.form.get("mileage", "").strip() or None
    fuel_type = request.form.get("fuel_type", "").strip() or None
    transmission = request.form.get("transmission", "").strip() or None
    owner_name = request.form.get("owner_name", "").strip() or None
    registration_number = request.form.get("registration_number", "").strip() or None

    if not name or not starting_price:
        return jsonify({"error": "Name and starting price are required"}), 400

    # RC and Insurance fields
    rc_available = request.form.get("rc_available", "false").lower() in ("true", "1", "yes")
    insurance_available = request.form.get("insurance_available", "false").lower() in ("true", "1", "yes")

    office_id = request.current_user["user_id"]
    
    # Get officer's mobile number for folder organization
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT mobile_number FROM users WHERE id = %s", (office_id,))
        user_row = cursor.fetchone()
        officer_mobile = user_row["mobile_number"] if user_row and user_row.get("mobile_number") else str(office_id)
        # Clean mobile number (remove spaces, dashes)
        officer_mobile = ''.join(filter(str.isdigit, officer_mobile)) or str(office_id)
    except:
        officer_mobile = str(office_id)
    
    # Create folder structure: uploads/{officer_mobile}/{category}/
    category_folder = category if category else "uncategorized"
    upload_subfolder = os.path.join(officer_mobile, category_folder)
    upload_path = os.path.join(current_app.config["UPLOAD_FOLDER"], upload_subfolder)
    os.makedirs(upload_path, exist_ok=True)

    # ── Image paths (pre-uploaded via /upload-image or legacy multi-upload) ──
    # Prefer pre-uploaded paths sent as JSON string
    uploaded_paths_raw = request.form.get("uploaded_image_paths", "")
    try:
        pre_uploaded = json.loads(uploaded_paths_raw) if uploaded_paths_raw else []
    except (json.JSONDecodeError, TypeError):
        pre_uploaded = []

    # Also accept legacy multi-file upload for backward compat
    image_paths = list(pre_uploaded)
    files = request.files.getlist("images")
    if not files or all(f.filename == '' for f in files):
        single_file = request.files.get("image")
        if single_file and single_file.filename:
            files = [single_file]
    for file in files[:10 - len(image_paths)]:
        if file and file.filename and allowed_file(file.filename):
            original = secure_filename(file.filename)
            name_part, ext = os.path.splitext(original)
            filename = f"{name_part}_{int(time.time())}_{len(image_paths)}{ext}"
            saved_file_path = os.path.join(upload_path, filename)
            file.save(saved_file_path)
            # Convert to WebP
            if ext.lower() in ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'):
                converted_path = _convert_to_webp(saved_file_path)
                filename = os.path.basename(converted_path)
            image_paths.append(f"uploads/{upload_subfolder}/{filename}".replace("\\", "/"))

    image_path = json.dumps(image_paths) if image_paths else None

    # ── RC image (pre-uploaded path or legacy file) ──
    rc_image_path = request.form.get("uploaded_rc_path", "").strip() or None
    if not rc_image_path and rc_available:
        rc_file = request.files.get("rc_image")
        if rc_file and rc_file.filename and allowed_file(rc_file.filename):
            original = secure_filename(rc_file.filename)
            name_part, ext = os.path.splitext(original)
            rc_filename = f"rc_{name_part}_{int(time.time())}{ext}"
            saved_file_path = os.path.join(upload_path, rc_filename)
            rc_file.save(saved_file_path)
            if ext.lower() in ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'):
                converted_path = _convert_to_webp(saved_file_path)
                rc_filename = os.path.basename(converted_path)
            rc_image_path = f"uploads/{upload_subfolder}/{rc_filename}".replace("\\", "/")

    # ── Insurance image (pre-uploaded path or legacy file) ──
    insurance_image_path = request.form.get("uploaded_insurance_path", "").strip() or None
    if not insurance_image_path and insurance_available:
        ins_file = request.files.get("insurance_image")
        if ins_file and ins_file.filename and allowed_file(ins_file.filename):
            original = secure_filename(ins_file.filename)
            name_part, ext = os.path.splitext(original)
            ins_filename = f"ins_{name_part}_{int(time.time())}{ext}"
            saved_file_path = os.path.join(upload_path, ins_filename)
            ins_file.save(saved_file_path)
            if ext.lower() in ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'):
                converted_path = _convert_to_webp(saved_file_path)
                ins_filename = os.path.basename(converted_path)
            insurance_image_path = f"uploads/{upload_subfolder}/{ins_filename}".replace("\\", "/")

    try:
        cursor.execute(
            """INSERT INTO products (office_id, name, description, category, state, image_path, starting_price, quoted_price, 
               bid_end_date, vehicle_year, mileage, fuel_type, transmission, owner_name, registration_number,
               rc_available, rc_image, insurance_available, insurance_image, status)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')""",
            (office_id, name, description, category or None, state or None, image_path, starting_price, quoted_price,
             bid_end_date, vehicle_year, mileage, fuel_type, transmission, owner_name, registration_number,
             rc_available, rc_image_path, insurance_available, insurance_image_path),
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
        state = request.form.get("state", vehicle.get("state", ""))
        starting_price = request.form.get("starting_price", vehicle["starting_price"])
        quoted_price = request.form.get("quoted_price", vehicle.get("quoted_price"))
        if quoted_price == '':
            quoted_price = None
        
        # New fields
        bid_end_date = request.form.get("bid_end_date", vehicle.get("bid_end_date"))
        vehicle_year = request.form.get("vehicle_year", vehicle.get("vehicle_year"))
        mileage = request.form.get("mileage", vehicle.get("mileage"))
        fuel_type = request.form.get("fuel_type", vehicle.get("fuel_type"))
        transmission = request.form.get("transmission", vehicle.get("transmission"))
        owner_name = request.form.get("owner_name", vehicle.get("owner_name"))
        registration_number = request.form.get("registration_number", vehicle.get("registration_number"))
        
        # RC and Insurance fields
        rc_available = request.form.get("rc_available", str(vehicle.get("rc_available", False))).lower() in ("true", "1", "yes")
        insurance_available = request.form.get("insurance_available", str(vehicle.get("insurance_available", False))).lower() in ("true", "1", "yes")
        rc_image_path = vehicle.get("rc_image")
        insurance_image_path = vehicle.get("insurance_image")
        
        image_path = vehicle["image_path"]

        # Admin can also update status
        status = vehicle["status"]
        if request.current_user["role"] == "admin":
            new_status = request.form.get("status", "")
            if new_status in ('pending', 'approved', 'rejected'):
                status = new_status

        # Get officer's mobile number for folder organization (used by multiple upload sections)
        office_id = vehicle["office_id"]
        cursor.execute("SELECT mobile_number FROM users WHERE id = %s", (office_id,))
        user_row = cursor.fetchone()
        officer_mobile = user_row["mobile_number"] if user_row and user_row.get("mobile_number") else str(office_id)
        officer_mobile = ''.join(filter(str.isdigit, officer_mobile)) or str(office_id)
        
        # Create folder structure: uploads/{officer_mobile}/{category}/
        category_folder = category if category else "uncategorized"
        upload_subfolder = os.path.join(officer_mobile, category_folder)
        upload_path = os.path.join(current_app.config["UPLOAD_FOLDER"], upload_subfolder)
        os.makedirs(upload_path, exist_ok=True)

        # ── Image paths (pre-uploaded via /upload-image or legacy multi-upload) ──
        uploaded_paths_raw = request.form.get("uploaded_image_paths", "")
        try:
            pre_uploaded = json.loads(uploaded_paths_raw) if uploaded_paths_raw else []
        except (json.JSONDecodeError, TypeError):
            pre_uploaded = []

        if pre_uploaded:
            image_path = json.dumps(pre_uploaded)
        else:
            # Legacy: accept files in the PUT body
            files = request.files.getlist("images")
            if not files or all(f.filename == '' for f in files):
                single_file = request.files.get("image")
                if single_file and single_file.filename:
                    files = [single_file]
            if files and any(f.filename for f in files):
                new_paths = []
                for file in files[:10]:
                    if file and file.filename and allowed_file(file.filename):
                        original = secure_filename(file.filename)
                        name_part, ext = os.path.splitext(original)
                        filename = f"{name_part}_{int(time.time())}_{len(new_paths)}{ext}"
                        saved_file_path = os.path.join(upload_path, filename)
                        file.save(saved_file_path)
                        if ext.lower() in ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'):
                            converted_path = _convert_to_webp(saved_file_path)
                            filename = os.path.basename(converted_path)
                        new_paths.append(f"uploads/{upload_subfolder}/{filename}".replace("\\", "/"))
                if new_paths:
                    image_path = json.dumps(new_paths)

        # ── RC image (pre-uploaded or legacy) ──
        uploaded_rc = request.form.get("uploaded_rc_path", "").strip()
        if uploaded_rc:
            rc_image_path = uploaded_rc
        elif rc_available:
            rc_file = request.files.get("rc_image")
            if rc_file and rc_file.filename and allowed_file(rc_file.filename):
                original = secure_filename(rc_file.filename)
                name_part, ext = os.path.splitext(original)
                rc_filename = f"rc_{name_part}_{int(time.time())}{ext}"
                saved_file_path = os.path.join(upload_path, rc_filename)
                rc_file.save(saved_file_path)
                if ext.lower() in ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'):
                    converted_path = _convert_to_webp(saved_file_path)
                    rc_filename = os.path.basename(converted_path)
                rc_image_path = f"uploads/{upload_subfolder}/{rc_filename}".replace("\\", "/")
        else:
            rc_image_path = None

        # ── Insurance image (pre-uploaded or legacy) ──
        uploaded_ins = request.form.get("uploaded_insurance_path", "").strip()
        if uploaded_ins:
            insurance_image_path = uploaded_ins
        elif insurance_available:
            ins_file = request.files.get("insurance_image")
            if ins_file and ins_file.filename and allowed_file(ins_file.filename):
                original = secure_filename(ins_file.filename)
                name_part, ext = os.path.splitext(original)
                ins_filename = f"ins_{name_part}_{int(time.time())}{ext}"
                saved_file_path = os.path.join(upload_path, ins_filename)
                ins_file.save(saved_file_path)
                if ext.lower() in ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'):
                    converted_path = _convert_to_webp(saved_file_path)
                    ins_filename = os.path.basename(converted_path)
                insurance_image_path = f"uploads/{upload_subfolder}/{ins_filename}".replace("\\", "/")
        else:
            insurance_image_path = None

        cursor.execute(
            """UPDATE products SET name = %s, description = %s, category = %s, state = %s,
               starting_price = %s, quoted_price = %s, image_path = %s, status = %s,
               bid_end_date = %s, vehicle_year = %s, mileage = %s, fuel_type = %s, 
               transmission = %s, owner_name = %s, registration_number = %s,
               rc_available = %s, rc_image = %s, insurance_available = %s, insurance_image = %s
               WHERE id = %s""",
            (name, description, category or None, state or None, starting_price, quoted_price, image_path, status,
             bid_end_date, vehicle_year, mileage, fuel_type, transmission, owner_name, registration_number,
             rc_available, rc_image_path, insurance_available, insurance_image_path, vehicle_id),
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

        # Enforce bid increment if set (quoted_price is used as bid increment)
        bid_increment = float(product["quoted_price"]) if product.get("quoted_price") else 0
        if bid_increment > 0:
            diff = bid_amount - current_max
            if diff % bid_increment != 0:
                return jsonify({
                    "error": f"Bid must increase in multiples of ₹{bid_increment:,.2f}. "
                             f"Valid bids: ₹{current_max + bid_increment:,.2f}, ₹{current_max + bid_increment * 2:,.2f}, etc."
                }), 400

        cursor.execute(
            "INSERT INTO bids (product_id, user_id, amount) VALUES (%s, %s, %s)",
            (vehicle_id, request.current_user["user_id"], bid_amount),
        )
        conn.commit()
        return jsonify({"message": "Bid placed successfully!", "bid_amount": bid_amount, "amount": bid_amount}), 201
    finally:
        cursor.close()
        conn.close()
