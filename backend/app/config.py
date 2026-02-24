import os


class Config:
    """Application configuration from environment variables."""

    SECRET_KEY = os.getenv("SECRET_KEY", "autorevive-secret-key-change-in-production")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", os.getenv("SECRET_KEY", "jwt-secret-change-me"))
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 86400))  # 24 hours

    # MySQL
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "root")
    MYSQL_DB = os.getenv("MYSQL_DATABASE", "finance_auction_db")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))

    # File uploads
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads"))
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 50 * 1024 * 1024))  # 50 MB
    ALLOWED_EXTENSIONS = set(
        ext.strip() for ext in os.getenv("ALLOWED_EXTENSIONS", "png,jpg,jpeg,gif,webp").split(",")
    )

    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
