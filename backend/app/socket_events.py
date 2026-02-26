"""
socket_events.py — AutoRevive Live Bidding via WebSockets (flask-socketio)

Architecture:
  - Each auction page connects and joins a SocketIO "room" named "auction_{id}"
  - When a user places a bid (via REST POST /vehicles/:id/bid), the route
    calls `broadcast_bid_update()` which emits to everyone in that room
  - No polling. No refresh. Pure push-based real-time updates.

Room naming: "auction_{product_id}"  e.g.  "auction_42"
"""

from flask_socketio import SocketIO, join_room, leave_room, emit
from flask import request
import jwt
import os

# ────────────────────────────────────────────────────────────────────────────
# SocketIO instance — created here, attached to the Flask app in __init__.py
# cors_allowed_origins is set dynamically in __init__.py after Config is loaded
# ────────────────────────────────────────────────────────────────────────────
socketio = SocketIO()


def init_socketio(app):
    """
    Attach SocketIO to the Flask app.
    Call this inside create_app() after the app is configured.
    """
    allowed_origins = app.config.get("CORS_ORIGINS", ["http://localhost:3000"])
    socketio.init_app(
        app,
        cors_allowed_origins=allowed_origins,
        async_mode="eventlet",         # High-performance async worker
        logger=False,
        engineio_logger=False,
        ping_timeout=60,
        ping_interval=25,
    )
    return socketio


# ────────────────────────────────────────────────────────────────────────────
# Helper — broadcast a bid update to everyone watching that auction
# Called from vehicles.py after a bid is successfully saved to the DB.
# ────────────────────────────────────────────────────────────────────────────
def broadcast_bid_update(auction_id, bid_data):
    """
    Push a live bid event to all browsers watching auction `auction_id`.

    bid_data dict shape:
        {
          "auction_id":   42,
          "current_bid":  85000.0,
          "total_bids":   7,
          "bidder_name":  "Ra***sh",     # masked for privacy
          "bid_time":     "2026-02-26T08:30:00",
          "amount":       85000.0,
        }
    """
    room = f"auction_{auction_id}"
    socketio.emit("bid_update", bid_data, room=room)


# ────────────────────────────────────────────────────────────────────────────
# SocketIO event handlers
# ────────────────────────────────────────────────────────────────────────────

@socketio.on("connect")
def on_connect():
    """Client connected — acknowledge."""
    emit("connected", {"status": "ok", "message": "AutoRevive live bidding connected"})


@socketio.on("disconnect")
def on_disconnect():
    """Client disconnected — SocketIO handles room cleanup automatically."""
    pass


@socketio.on("join_auction")
def on_join_auction(data):
    """
    Client sends: { "auction_id": 42 }
    Server responds: joins the room and confirms.
    """
    auction_id = data.get("auction_id")
    if not auction_id:
        emit("error", {"message": "auction_id is required"})
        return

    room = f"auction_{auction_id}"
    join_room(room)
    emit("joined_auction", {
        "auction_id": auction_id,
        "room": room,
        "message": f"Joined live feed for auction #{auction_id}",
    })


@socketio.on("leave_auction")
def on_leave_auction(data):
    """
    Client sends: { "auction_id": 42 }
    Server responds: leaves the room.
    """
    auction_id = data.get("auction_id")
    if auction_id:
        room = f"auction_{auction_id}"
        leave_room(room)
        emit("left_auction", {"auction_id": auction_id})
