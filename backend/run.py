import eventlet
eventlet.monkey_patch()

from app import create_app
from app.socket_events import socketio

app = create_app()

if __name__ == "__main__":
    # Initialize the database on first run
    from app import db
    try:
        db.init_db()
    except Exception as e:
        print(f"DB init note: {e}")

    import os
    host = "0.0.0.0"
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") == "development"

    print(f"[AutoRevive] API starting on http://{host}:{port}  (WebSockets: enabled)")
    # socketio.run() replaces app.run() — it manages the eventlet WSGI loop
    # and handles both HTTP and WebSocket connections on the same port.
    # NOTE: use_reloader=False is REQUIRED with eventlet. Flask's stat reloader
    # spawns a child process where monkey_patch() runs too late, causing errors.
    socketio.run(app, host=host, port=port, debug=debug, use_reloader=False, log_output=True)
