import jwt
import datetime
import functools
import os
from flask import request, jsonify, current_app


def generate_token(user):
    """Generate a JWT token for the given user dict."""
    payload = {
        "user_id": user["id"],
        "username": user["username"],
        "role": user["role"],
        "exp": datetime.datetime.utcnow()
        + datetime.timedelta(seconds=current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]),
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")


def decode_token(token):
    """Decode and validate a JWT token."""
    try:
        return jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def login_required(f):
    """Decorator that requires a valid JWT token."""

    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid authorization header"}), 401

        token = auth_header.split(" ", 1)[1]
        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401

        request.current_user = payload
        return f(*args, **kwargs)

    return wrapped


def role_required(*roles):
    """Decorator that requires the user to have one of the specified roles."""

    def decorator(f):
        @functools.wraps(f)
        @login_required
        def wrapped(*args, **kwargs):
            if request.current_user.get("role") not in roles:
                return jsonify({"error": "Insufficient permissions"}), 403
            return f(*args, **kwargs)

        return wrapped

    return decorator


def allowed_file(filename):
    """Check if a filename has an allowed extension."""
    allowed = current_app.config.get("ALLOWED_EXTENSIONS", {"png", "jpg", "jpeg", "gif", "webp"})
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed


def serialize_row(row):
    """Convert a database row dict to JSON-serializable format."""
    if row is None:
        return None
    result = {}
    for key, value in row.items():
        if isinstance(value, datetime.datetime):
            result[key] = value.isoformat()
        elif isinstance(value, datetime.date):
            result[key] = value.isoformat()
        elif hasattr(value, "__float__"):
            result[key] = float(value)
        else:
            result[key] = value
    # Never expose password hash
    result.pop("password_hash", None)
    return result


def serialize_rows(rows):
    """Convert a list of database rows to JSON-serializable format."""
    return [serialize_row(r) for r in rows]
