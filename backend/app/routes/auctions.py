from flask import Blueprint, request, jsonify

from ..utils import login_required, serialize_rows

auctions_bp = Blueprint("auctions", __name__)


def _get_db():
    from .. import db
    return db.get_db()


@auctions_bp.route("/", methods=["GET"])
def get_auctions():
    """Get all approved products as auctions (public endpoint)."""
    status = request.args.get("status", "")
    search = request.args.get("search", "")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))

    conn = _get_db()
    cursor = conn.cursor()
    try:
        query = """
            SELECT p.*, u.username as office_name,
                   COALESCE(MAX(b.amount), 0) as current_bid,
                   COUNT(b.id) as total_bids,
                   p.starting_price
            FROM products p
            JOIN users u ON p.office_id = u.id
            LEFT JOIN bids b ON p.id = b.product_id
            WHERE p.status = 'approved'
        """
        params = []

        if status and status != "approved":
            # Override to allow filtering by other statuses if needed
            query = query.replace("WHERE p.status = 'approved'", "WHERE p.status = %s")
            params = [status]

        if search:
            query += " AND (p.name LIKE %s OR p.description LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])

        query += " GROUP BY p.id ORDER BY p.created_at DESC"

        count_query = f"SELECT COUNT(*) as total FROM ({query}) as sub"
        cursor.execute(count_query, params)
        total = cursor.fetchone()["total"]

        offset = (page - 1) * per_page
        query += " LIMIT %s OFFSET %s"
        params.extend([per_page, offset])
        cursor.execute(query, params)
        auctions = serialize_rows(cursor.fetchall())

        return jsonify({
            "auctions": auctions,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
        })
    finally:
        cursor.close()
        conn.close()


@auctions_bp.route("/<int:auction_id>", methods=["GET"])
def get_auction(auction_id):
    """Get single auction (product) with bids."""
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """SELECT p.*, u.username as office_name,
                      u.email as seller_email
               FROM products p
               JOIN users u ON p.office_id = u.id
               WHERE p.id = %s""",
            (auction_id,),
        )
        auction = cursor.fetchone()
        if not auction:
            return jsonify({"error": "Auction not found"}), 404

        # Get bids
        cursor.execute(
            """SELECT b.*, u.username as bidder_name
               FROM bids b JOIN users u ON b.user_id = u.id
               WHERE b.product_id = %s ORDER BY b.amount DESC""",
            (auction_id,),
        )
        bids = serialize_rows(cursor.fetchall())
        current_bid = bids[0]["amount"] if bids else float(auction["starting_price"])

        from ..utils import serialize_row
        result = serialize_row(auction)
        result["current_bid"] = current_bid
        result["total_bids"] = len(bids)
        result["bids"] = bids
        return jsonify(result)
    finally:
        cursor.close()
        conn.close()


@auctions_bp.route("/<int:auction_id>/bids", methods=["GET"])
def get_auction_bids(auction_id):
    """Get bidding history for a specific auction."""
    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """SELECT b.*, u.username as bidder_name
               FROM bids b JOIN users u ON b.user_id = u.id
               WHERE b.product_id = %s ORDER BY b.amount DESC""",
            (auction_id,),
        )
        bids = serialize_rows(cursor.fetchall())
        return jsonify({"bids": bids, "total": len(bids)})
    finally:
        cursor.close()
        conn.close()
