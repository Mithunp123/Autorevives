from flask import Flask
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

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(vehicles_bp, url_prefix="/api/vehicles")
    app.register_blueprint(auctions_bp, url_prefix="/api/auctions")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(offices_bp, url_prefix="/api/offices")
    app.register_blueprint(public_bp, url_prefix="/api/public")
    app.register_blueprint(plans_bp, url_prefix="/api/plans")

    # Health check
    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "AutoRevive API is running"}

    # Serve uploaded files
    from flask import send_from_directory, make_response

    @app.route("/api/uploads/<path:filename>")
    def uploaded_file(filename):
        response = make_response(send_from_directory(app.config["UPLOAD_FOLDER"], filename))
        # Cache uploaded images for 7 days (immutable content)
        response.headers["Cache-Control"] = "public, max-age=604800, immutable"
        return response

    # ── Static-asset caching & compression headers ──
    @app.after_request
    def add_cache_headers(response):
        """Add cache-control and security headers to all responses."""
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
