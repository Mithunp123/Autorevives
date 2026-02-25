from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load .env BEFORE importing Config so os.getenv() picks up .env values
load_dotenv()

from .database import Database
from .config import Config

# Global database instance
db = None


class _StripTrailingSlash:
    """WSGI middleware that removes trailing slashes from every request
    path *before* Flask's router sees them. This avoids 308 redirects
    that cause the browser / HTTP-proxy to drop the Authorization header."""

    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        path = environ.get("PATH_INFO", "")
        if path != "/" and path.endswith("/"):
            environ["PATH_INFO"] = path.rstrip("/")
        return self.wsgi_app(environ, start_response)


def create_app(config_class=Config):
    """Application factory pattern."""

    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.wsgi_app = _StripTrailingSlash(app.wsgi_app)
    app.config.from_object(config_class)

    # Enable CORS for React frontend
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config.get("CORS_ORIGINS", ["http://localhost:3000"]),
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
        }
    })

    # Ensure upload directory exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Initialize database
    global db
    db = Database(app)

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.users import users_bp
    from .routes.vehicles import vehicles_bp
    from .routes.auctions import auctions_bp
    from .routes.dashboard import dashboard_bp
    from .routes.offices import offices_bp
    from .routes.public import public_bp
    from .routes.plans import plans_bp
    from .routes.forgot_password import forgot_password_bp
    from .routes.features import features_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(vehicles_bp, url_prefix="/api/vehicles")
    app.register_blueprint(auctions_bp, url_prefix="/api/auctions")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(offices_bp, url_prefix="/api/offices")
    app.register_blueprint(public_bp, url_prefix="/api/public")
    app.register_blueprint(plans_bp, url_prefix="/api/plans")
    app.register_blueprint(forgot_password_bp, url_prefix="/api/auth/password")
    app.register_blueprint(features_bp, url_prefix="/api/features")

    # Health check
    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "AutoRevive API is running"}

    # Handle request too large (413) – must include CORS headers because
    # Flask may reject the body before flask-cors processes the response.
    @app.errorhandler(413)
    def request_entity_too_large(error):
        resp = jsonify({"error": "File too large. Maximum upload size is 100 MB."})
        resp.status_code = 413
        origin = request.headers.get("Origin", "")
        allowed = app.config.get("CORS_ORIGINS", [])
        if origin in allowed:
            resp.headers["Access-Control-Allow-Origin"] = origin
            resp.headers["Access-Control-Allow-Credentials"] = "true"
        return resp

    # Serve uploaded files (supports nested paths: uploads/{mobile}/{category}/file.jpg)
    from flask import send_from_directory, make_response, send_file, abort
    import os as os_module

    @app.route("/api/uploads/<path:filename>")
    def uploaded_file(filename):
        try:
            # Normalize the path for Windows compatibility
            upload_folder = app.config["UPLOAD_FOLDER"]
            # Replace forward slashes with OS-appropriate separator
            safe_filename = filename.replace("/", os_module.sep).replace("\\", os_module.sep)
            full_path = os_module.path.join(upload_folder, safe_filename)
            
            # Security check - ensure path is within upload folder
            full_path = os_module.path.abspath(full_path)
            upload_folder_abs = os_module.path.abspath(upload_folder)
            if not full_path.startswith(upload_folder_abs):
                abort(403)
            
            # Check if file exists
            if not os_module.path.isfile(full_path):
                abort(404)
            
            response = make_response(send_file(full_path))
            # Cache uploaded images for 7 days (immutable content)
            response.headers["Cache-Control"] = "public, max-age=604800, immutable"
            # CORS headers for Cloudflare/separate frontend hosting
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type"
            return response
        except Exception as e:
            app.logger.error(f"Error serving file {filename}: {e}")
            abort(404)

    # ── Ensure CORS headers are present on EVERY response (incl. errors) ──
    @app.after_request
    def add_cors_and_cache_headers(response):
        """Guarantee CORS + cache-control + security headers on all responses."""
        # --- CORS (belt-and-suspenders alongside Flask-CORS) ---
        origin = request.headers.get("Origin", "")
        allowed_origins = app.config.get("CORS_ORIGINS", [])
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = (
                "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            )
            response.headers["Access-Control-Allow-Headers"] = (
                "Content-Type, Authorization"
            )

        # Cache static assets (JS, CSS, images, fonts) aggressively
        content_type = response.content_type or ""
        if any(ct in content_type for ct in [
            "javascript", "text/css", "image/", "font/",
            "application/font", "application/x-font",
        ]):
            response.headers.setdefault(
                "Cache-Control", "public, max-age=31536000, immutable"
            )
        # API responses: don't cache
        elif "/api/" in (getattr(response, "request_path", "") or ""):
            response.headers.setdefault("Cache-Control", "no-store")

        # Security headers
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        return response

    # Database initialization endpoint
    @app.route("/api/init-db")
    def init_db_route():
        try:
            db.init_db()
            return {"message": "Database initialized successfully! Default admin: admin/admin123"}
        except Exception as e:
            return {"error": str(e)}, 500

    return app
