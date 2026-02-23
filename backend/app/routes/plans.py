from flask import Blueprint, request, jsonify
import json

from ..utils import login_required, role_required, serialize_row, serialize_rows

plans_bp = Blueprint("plans", __name__)


def _get_db():
    from .. import db
    return db.get_db()


@plans_bp.route("/", methods=["GET"])
def get_plans():
    """Get all active plans (public endpoint)."""
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM plans WHERE is_active = TRUE ORDER BY sort_order ASC")
        plans = serialize_rows(cursor.fetchall())
        # Parse features JSON
        for p in plans:
            if p.get("features") and isinstance(p["features"], str):
                try:
                    p["features"] = json.loads(p["features"])
                except (json.JSONDecodeError, TypeError):
                    p["features"] = []
        return jsonify({"plans": plans})
    finally:
        cursor.close()
        conn.close()


@plans_bp.route("/all", methods=["GET"])
@role_required("admin")
def get_all_plans():
    """Admin: Get all plans including inactive ones."""
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM plans ORDER BY sort_order ASC")
        plans = serialize_rows(cursor.fetchall())
        for p in plans:
            if p.get("features") and isinstance(p["features"], str):
                try:
                    p["features"] = json.loads(p["features"])
                except (json.JSONDecodeError, TypeError):
                    p["features"] = []
        return jsonify({"plans": plans})
    finally:
        cursor.close()
        conn.close()


@plans_bp.route("/", methods=["POST"])
@role_required("admin")
def create_plan():
    """Admin: Create a new plan."""
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    price = data.get("price", 0)
    duration = data.get("duration", "").strip()
    period = data.get("period", "").strip()
    features = data.get("features", [])
    popular = data.get("popular", False)
    sort_order = data.get("sort_order", 0)

    if not name or not price:
        return jsonify({"error": "Name and price are required"}), 400

    features_json = json.dumps(features) if isinstance(features, list) else features

    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO plans (name, price, duration, period, features, popular, sort_order)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (name, price, duration, period, features_json, popular, sort_order),
        )
        conn.commit()
        return jsonify({"message": "Plan created successfully", "id": cursor.lastrowid}), 201
    finally:
        cursor.close()
        conn.close()


@plans_bp.route("/<int:plan_id>", methods=["PUT"])
@role_required("admin")
def update_plan(plan_id):
    """Admin: Update an existing plan."""
    data = request.get_json() or {}
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM plans WHERE id = %s", (plan_id,))
        plan = cursor.fetchone()
        if not plan:
            return jsonify({"error": "Plan not found"}), 404

        name = data.get("name", plan["name"])
        price = data.get("price", plan["price"])
        duration = data.get("duration", plan["duration"])
        period = data.get("period", plan["period"])
        features = data.get("features", plan["features"])
        popular = data.get("popular", plan["popular"])
        is_active = data.get("is_active", plan["is_active"])
        sort_order = data.get("sort_order", plan["sort_order"])

        if price is None:
             price = plan["price"]
        
        # Ensure price is handled correctly 
        if price == "":
            price = plan["price"]

        features_json = json.dumps(features) if isinstance(features, list) else features

        cursor.execute(
            """UPDATE plans SET name = %s, price = %s, duration = %s, period = %s,
               features = %s, popular = %s, is_active = %s, sort_order = %s
               WHERE id = %s""",
            (name, price, duration, period, features_json, popular, is_active, sort_order, plan_id),
        )
        conn.commit()
        return jsonify({"message": "Plan updated successfully"})
    finally:
        cursor.close()
        conn.close()


@plans_bp.route("/<int:plan_id>", methods=["DELETE"])
@role_required("admin")
def delete_plan(plan_id):
    """Admin: Delete a plan."""
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM plans WHERE id = %s", (plan_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Plan not found"}), 404
        return jsonify({"message": "Plan deleted successfully"})
    finally:
        cursor.close()
        conn.close()
