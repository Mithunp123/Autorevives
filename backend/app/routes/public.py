from flask import Blueprint, request, jsonify
import json

from ..utils import serialize_rows

public_bp = Blueprint("public", __name__)


def _get_db():
    from .. import db
    return db.get_db()


@public_bp.route("/home", methods=["GET"])
def home_data():
    """Public homepage data — stats, live auctions for the landing page."""
    conn = _get_db()
    cursor = conn.cursor()
    try:
        # Approved products with bids
        cursor.execute("""
            SELECT p.*,
                   u.username as office_name,
                   COALESCE(p.state, u.state) as state,
                   COALESCE(u.location, '') as location,
                   COALESCE(bi.current_bid, 0) as current_bid,
                   COALESCE(bi.total_bids, 0) as total_bids,
                   p.starting_price
            FROM products p
            JOIN users u ON p.office_id = u.id
            LEFT JOIN (
                SELECT product_id, MAX(amount) as current_bid, COUNT(*) as total_bids
                FROM bids GROUP BY product_id
            ) bi ON p.id = bi.product_id
            WHERE p.status = 'approved'
            ORDER BY p.created_at DESC LIMIT 20
        """)
        products = serialize_rows(cursor.fetchall())

        # Stats
        cursor.execute("SELECT COUNT(*) as c FROM users WHERE role = 'user'")
        total_users = cursor.fetchone()["c"]

        cursor.execute("SELECT COUNT(*) as c FROM products WHERE status = 'approved'")
        live_auctions = cursor.fetchone()["c"]

        cursor.execute("SELECT COUNT(*) as c FROM products WHERE status = 'pending'")
        pending_auctions = cursor.fetchone()["c"]

        cursor.execute("SELECT COUNT(*) as c FROM products WHERE status = 'rejected'")
        closed_auctions = cursor.fetchone()["c"]

        # Vehicle-type counts (category column first, then broad name-matching fallback)
        cursor.execute("""
            SELECT
                COUNT(CASE WHEN category = '4W' OR (category IS NULL AND (
                    name LIKE '%%car%%' OR name LIKE '%%suv%%' OR name LIKE '%%sedan%%'
                    OR name LIKE '%%hatchback%%' OR name LIKE '%%jeep%%' OR name LIKE '%%innova%%'
                    OR name LIKE '%%swift%%' OR name LIKE '%%fortuner%%' OR name LIKE '%%creta%%'
                    OR name LIKE '%%nexon%%' OR name LIKE '%%brezza%%' OR name LIKE '%%ertiga%%'
                    OR name LIKE '%%wagon%%' OR name LIKE '%%alto%%' OR name LIKE '%%i20%%'
                    OR name LIKE '%%i10%%' OR name LIKE '%%dzire%%' OR name LIKE '%%verna%%'
                    OR name LIKE '%%city%%' OR name LIKE '%%polo%%' OR name LIKE '%%baleno%%'
                )) THEN 1 END) as four_wheeler,
                COUNT(CASE WHEN category = '3W' OR (category IS NULL AND (
                    name LIKE '%%auto%%' OR name LIKE '%%rickshaw%%'
                    OR name LIKE '%%three%%wheeler%%' OR name LIKE '%%3 wheeler%%'
                    OR name LIKE '%%ape%%' OR name LIKE '%%tuk%%'
                )) THEN 1 END) as three_wheeler,
                COUNT(CASE WHEN category = '2W' OR (category IS NULL AND (
                    name LIKE '%%bike%%' OR name LIKE '%%motorcycle%%' OR name LIKE '%%scooter%%'
                    OR name LIKE '%%bullet%%' OR name LIKE '%%activa%%' OR name LIKE '%%pulsar%%'
                    OR name LIKE '%%splendor%%' OR name LIKE '%%royal enfield%%'
                    OR name LIKE '%%yamaha%%' OR name LIKE '%%tvs%%' OR name LIKE '%%bajaj%%'
                    OR name LIKE '%%hero%%' OR name LIKE '%%ktm%%' OR name LIKE '%%duke%%'
                    OR name LIKE '%%honda%%cb%%' OR name LIKE '%%honda%%shine%%'
                    OR name LIKE '%%access%%' OR name LIKE '%%jupiter%%'
                )) THEN 1 END) as two_wheeler,
                COUNT(CASE WHEN category = 'Commercial' OR (category IS NULL AND (
                    name LIKE '%%truck%%' OR name LIKE '%%bus%%' OR name LIKE '%%tempo%%'
                    OR name LIKE '%%van%%' OR name LIKE '%%lorry%%' OR name LIKE '%%tractor%%'
                    OR name LIKE '%%tipper%%' OR name LIKE '%%commercial%%'
                    OR name LIKE '%%bolero%%pickup%%' OR name LIKE '%%dost%%'
                    OR name LIKE '%%eicher%%' OR name LIKE '%%tata ace%%'
                )) THEN 1 END) as commercial
            FROM products WHERE status = 'approved'
        """)
        vc = cursor.fetchone()

        # Total auction value
        cursor.execute("""
            SELECT COALESCE(SUM(
                CASE WHEN mb.current_bid IS NOT NULL THEN mb.current_bid ELSE p.starting_price END
            ), 0) as total_value
            FROM products p
            LEFT JOIN (SELECT product_id, MAX(amount) as current_bid FROM bids GROUP BY product_id) mb
            ON p.id = mb.product_id
            WHERE p.status = 'approved'
        """)
        total_auction_value = float(cursor.fetchone()["total_value"])

        # Recent activity
        cursor.execute("""
            SELECT p.name, b.amount, u.username, b.bid_time
            FROM bids b JOIN products p ON b.product_id = p.id JOIN users u ON b.user_id = u.id
            ORDER BY b.bid_time DESC LIMIT 10
        """)
        recent_activity = serialize_rows(cursor.fetchall())

        # Active plans for pricing section (graceful fallback if table missing)
        plans = []
        try:
            cursor.execute("SELECT * FROM plans WHERE is_active = TRUE ORDER BY sort_order ASC")
            plans_raw = serialize_rows(cursor.fetchall())
            for p in plans_raw:
                if p.get("features") and isinstance(p["features"], str):
                    try:
                        p["features"] = json.loads(p["features"])
                    except (json.JSONDecodeError, TypeError):
                        p["features"] = []
                plans.append(p)
        except Exception:
            plans = []

        return jsonify({
            "products": products,
            "stats": {
                "total_users": total_users,
                "live_auctions": live_auctions,
                "pending_auctions": pending_auctions,
                "closed_auctions": closed_auctions,
                "two_wheeler": vc["two_wheeler"],
                "three_wheeler": vc["three_wheeler"],
                "four_wheeler": vc["four_wheeler"],
                "commercial": vc["commercial"],
                "total_auction_value": total_auction_value,
            },
            "recent_activity": recent_activity,
            "plans": plans,
        })
    finally:
        cursor.close()
        conn.close()


@public_bp.route("/contact", methods=["POST"])
def submit_contact():
    """Save contact form submission."""
    data = request.get_json() or {}
    full_name = data.get("fullName", "").strip()
    email = data.get("email", "").strip()
    mobile = data.get("mobile", "")
    state = data.get("state", "")
    city = data.get("city", "")
    subject = data.get("subject", "")
    message = data.get("message", "")

    if not full_name or not email:
        return jsonify({"error": "Name and email are required"}), 400

    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO contact_messages (full_name, email, mobile, state, city, subject, message)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (full_name, email, mobile, state, city, subject, message),
        )
        conn.commit()
        return jsonify({"message": "Thank you for contacting us! We will get back to you soon."}), 201
    finally:
        cursor.close()
        conn.close()
