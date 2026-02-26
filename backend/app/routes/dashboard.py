from flask import Blueprint, jsonify, request

from ..utils import role_required, serialize_rows

dashboard_bp = Blueprint("dashboard", __name__)


def _get_db():
    from .. import db
    return db.get_db()


@dashboard_bp.route("/stats", methods=["GET"])
@role_required("admin")
def get_stats():
    """Get dashboard statistics for admin."""
    conn = _get_db()
    cursor = conn.cursor()
    try:
        # Total users
        cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'user'")
        total_users = cursor.fetchone()["count"]

        # Total offices
        cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'office' AND status = 'active'")
        total_offices = cursor.fetchone()["count"]

        # Products by status
        cursor.execute("SELECT COUNT(*) as count FROM products WHERE status = 'approved'")
        live_auctions = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM products WHERE status = 'pending'")
        pending_auctions = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM products WHERE status = 'rejected'")
        closed_auctions = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM products")
        total_products = cursor.fetchone()["count"]

        # Total bid volume
        cursor.execute("SELECT COALESCE(SUM(amount), 0) as total FROM bids")
        total_volume = float(cursor.fetchone()["total"])

        # Total auction value
        cursor.execute("""
            SELECT COALESCE(SUM(
                CASE WHEN max_bid.current_bid IS NOT NULL THEN max_bid.current_bid
                     ELSE p.starting_price END
            ), 0) as total_value
            FROM products p
            LEFT JOIN (
                SELECT product_id, MAX(amount) as current_bid FROM bids GROUP BY product_id
            ) max_bid ON p.id = max_bid.product_id
            WHERE p.status = 'approved'
        """)
        total_auction_value = float(cursor.fetchone()["total_value"])

        # Vehicle type counts
        cursor.execute("""
            SELECT
                COUNT(CASE WHEN name LIKE '%%car%%' OR name LIKE '%%suv%%' OR name LIKE '%%sedan%%' THEN 1 END) as four_wheeler,
                COUNT(CASE WHEN name LIKE '%%auto%%' OR name LIKE '%%rickshaw%%' THEN 1 END) as three_wheeler,
                COUNT(CASE WHEN name LIKE '%%bike%%' OR name LIKE '%%motorcycle%%' OR name LIKE '%%scooter%%' THEN 1 END) as two_wheeler
            FROM products WHERE status = 'approved'
        """)
        vehicle_counts = cursor.fetchone()

        # Pending approvals
        cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'office' AND status = 'pending'")
        pending_offices = cursor.fetchone()["count"]

        # Pending payments
        cursor.execute("SELECT COUNT(*) as count FROM transactions WHERE payment_status = 'verifying'")
        pending_payments = cursor.fetchone()["count"]

        # Recent activity
        cursor.execute("""
            SELECT p.name, b.amount, u.username, b.bid_time
            FROM bids b
            JOIN products p ON b.product_id = p.id
            JOIN users u ON b.user_id = u.id
            ORDER BY b.bid_time DESC LIMIT 10
        """)
        recent_activity = serialize_rows(cursor.fetchall())

        return jsonify({
            "stats": {
                "total_users": total_users,
                "total_offices": total_offices,
                "live_auctions": live_auctions,
                "pending_auctions": pending_auctions,
                "closed_auctions": closed_auctions,
                "total_products": total_products,
                "total_volume": total_volume,
                "total_auction_value": total_auction_value,
                "two_wheeler": vehicle_counts["two_wheeler"],
                "three_wheeler": vehicle_counts["three_wheeler"],
                "four_wheeler": vehicle_counts["four_wheeler"],
                "pending_offices": pending_offices,
                "pending_payments": pending_payments,
            },
            "recent_activity": recent_activity,
        })
    finally:
        cursor.close()
        conn.close()


@dashboard_bp.route("/recent-activity", methods=["GET"])
@role_required("admin")
def get_recent_activity():
    """Get recent platform activity for admin dashboard."""
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT p.name, b.amount, u.username, b.bid_time
            FROM bids b
            JOIN products p ON b.product_id = p.id
            JOIN users u ON b.user_id = u.id
            ORDER BY b.bid_time DESC LIMIT 10
        """)
        activity = serialize_rows(cursor.fetchall())
        return jsonify(activity)
    finally:
        cursor.close()
        conn.close()


@dashboard_bp.route("/vehicles-by-state", methods=["GET"])
@role_required("admin")
def get_vehicles_by_state():
    """Get vehicle counts grouped by office state, with optional state filter."""
    conn = _get_db()
    cursor = conn.cursor()
    try:
        state_filter = request.args.get("state", "").strip()

        # Get distinct states with vehicle counts
        cursor.execute("""
            SELECT COALESCE(u.state, 'Unknown') as state, COUNT(p.id) as vehicle_count
            FROM products p
            JOIN users u ON p.office_id = u.id
            GROUP BY u.state
            ORDER BY vehicle_count DESC
        """)
        states = serialize_rows(cursor.fetchall())

        # If state filter provided, get vehicles for that state
        vehicles = []
        if state_filter:
            cursor.execute("""
                SELECT p.id, p.name, p.image_path, p.starting_price, p.status, p.created_at,
                       u.finance_name as office_name,
                       COALESCE(p.state, u.state) as state,
                       COALESCE(u.location, '') as location,
                       (SELECT MAX(b.amount) FROM bids b WHERE b.product_id = p.id) as current_bid,
                       (SELECT COUNT(b.id) FROM bids b WHERE b.product_id = p.id) as bid_count
                FROM products p
                JOIN users u ON p.office_id = u.id
                WHERE COALESCE(p.state, u.state) = %s
                ORDER BY p.created_at DESC
            """, (state_filter,))
            vehicles = serialize_rows(cursor.fetchall())

        return jsonify({
            "states": states,
            "vehicles": vehicles,
        })
    finally:
        cursor.close()
        conn.close()


@dashboard_bp.route("/office-stats", methods=["GET"])
@role_required("office")
def get_office_stats():
    """Get dashboard stats for office user."""
    from flask import request as req
    user_id = req.current_user["user_id"]

    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) as count FROM products WHERE office_id = %s", (user_id,))
        total_products = cursor.fetchone()["count"]

        cursor.execute(
            "SELECT COUNT(*) as count FROM products WHERE office_id = %s AND status = 'approved'",
            (user_id,),
        )
        approved = cursor.fetchone()["count"]

        cursor.execute(
            "SELECT COUNT(*) as count FROM products WHERE office_id = %s AND status = 'pending'",
            (user_id,),
        )
        pending = cursor.fetchone()["count"]

        cursor.execute(
            """SELECT COUNT(b.id) as total_bids, COALESCE(SUM(b.amount), 0) as total_volume
               FROM bids b JOIN products p ON b.product_id = p.id
               WHERE p.office_id = %s""",
            (user_id,),
        )
        bid_stats = cursor.fetchone()

        return jsonify({
            "stats": {
                "total_products": total_products,
                "approved_products": approved,
                "pending_products": pending,
                "total_bids": bid_stats["total_bids"] or 0,
                "total_volume": float(bid_stats["total_volume"] or 0),
            }
        })
    finally:
        cursor.close()
        conn.close()
