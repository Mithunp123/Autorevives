import MySQLdb
import MySQLdb.cursors
from werkzeug.security import generate_password_hash


class Database:
    """MySQL database wrapper with connection management."""

    def __init__(self, app=None):
        self.host = None
        self.user = None
        self.password = None
        self.db_name = None
        self.port = 3306
        if app:
            self.init_app(app)

    def init_app(self, app):
        self.host = app.config["MYSQL_HOST"]
        self.user = app.config["MYSQL_USER"]
        self.password = app.config["MYSQL_PASSWORD"]
        self.db_name = app.config["MYSQL_DB"]
        self.port = app.config.get("MYSQL_PORT", 3306)

    def get_db(self):
        """Get a new database connection with DictCursor."""
        return MySQLdb.connect(
            host=self.host,
            user=self.user,
            passwd=self.password,
            db=self.db_name,
            port=self.port,
            cursorclass=MySQLdb.cursors.DictCursor,
        )

    def init_db(self):
        """Initialize database tables and default admin user."""
        conn = MySQLdb.connect(
            host=self.host,
            user=self.user,
            passwd=self.password,
            port=self.port,
        )
        cursor = conn.cursor()

        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.db_name}")
        cursor.execute(f"USE {self.db_name}")

        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                mobile_number VARCHAR(15),
                finance_name VARCHAR(255),
                owner_name VARCHAR(255),
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('admin', 'office', 'user') NOT NULL,
                status ENUM('pending', 'active', 'blocked') DEFAULT 'active',
                state VARCHAR(100) DEFAULT NULL,
                location VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Add state/location columns if missing (for existing databases)
        for col, definition in [
            ('state', 'VARCHAR(100) DEFAULT NULL'),
            ('location', 'VARCHAR(255) DEFAULT NULL'),
        ]:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col} {definition}")
            except Exception:
                pass  # Column already exists

        # Wishlists table (one user, one row, items stored as JSON text to support older MySQL versions or directly as JSON)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS wishlists (
                user_id INT PRIMARY KEY,
                items JSON,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Products table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                office_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(50) DEFAULT NULL,
                state VARCHAR(100) DEFAULT NULL,
                image_path VARCHAR(255),
                starting_price DECIMAL(12, 2) NOT NULL,
                quoted_price DECIMAL(12, 2) DEFAULT NULL,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (office_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Add columns if they don't exist (for existing databases)
        for col, definition in [
            ('category', 'VARCHAR(50) DEFAULT NULL AFTER description'),
            ('state', 'VARCHAR(100) DEFAULT NULL AFTER category'),
            ('quoted_price', 'DECIMAL(12, 2) DEFAULT NULL AFTER starting_price'),
        ]:
            try:
                cursor.execute(f"ALTER TABLE products ADD COLUMN {col} {definition}")
            except Exception:
                pass  # Column already exists

        # Backfill category for existing products that don't have it set
        try:
            cursor.execute("""
                UPDATE products SET category = '2W'
                WHERE category IS NULL AND (
                    name LIKE '%%bike%%' OR name LIKE '%%motorcycle%%' OR name LIKE '%%scooter%%'
                    OR name LIKE '%%bullet%%' OR name LIKE '%%activa%%' OR name LIKE '%%pulsar%%'
                    OR name LIKE '%%splendor%%' OR name LIKE '%%royal enfield%%'
                    OR name LIKE '%%yamaha%%' OR name LIKE '%%tvs%%' OR name LIKE '%%bajaj%%'
                    OR name LIKE '%%hero%%' OR name LIKE '%%ktm%%' OR name LIKE '%%duke%%'
                    OR name LIKE '%%access%%' OR name LIKE '%%jupiter%%'
                )
            """)
            cursor.execute("""
                UPDATE products SET category = '3W'
                WHERE category IS NULL AND (
                    name LIKE '%%auto%%' OR name LIKE '%%rickshaw%%'
                    OR name LIKE '%%three%%wheeler%%' OR name LIKE '%%3 wheeler%%'
                    OR name LIKE '%%ape%%' OR name LIKE '%%tuk%%'
                )
            """)
            cursor.execute("""
                UPDATE products SET category = '4W'
                WHERE category IS NULL AND (
                    name LIKE '%%car%%' OR name LIKE '%%suv%%' OR name LIKE '%%sedan%%'
                    OR name LIKE '%%hatchback%%' OR name LIKE '%%jeep%%' OR name LIKE '%%innova%%'
                    OR name LIKE '%%swift%%' OR name LIKE '%%fortuner%%' OR name LIKE '%%creta%%'
                    OR name LIKE '%%nexon%%' OR name LIKE '%%brezza%%' OR name LIKE '%%ertiga%%'
                    OR name LIKE '%%wagon%%' OR name LIKE '%%alto%%' OR name LIKE '%%i20%%'
                    OR name LIKE '%%i10%%' OR name LIKE '%%dzire%%' OR name LIKE '%%verna%%'
                    OR name LIKE '%%city%%' OR name LIKE '%%polo%%' OR name LIKE '%%baleno%%'
                )
            """)
            cursor.execute("""
                UPDATE products SET category = 'Commercial'
                WHERE category IS NULL AND (
                    name LIKE '%%truck%%' OR name LIKE '%%bus%%' OR name LIKE '%%tempo%%'
                    OR name LIKE '%%van%%' OR name LIKE '%%lorry%%' OR name LIKE '%%tractor%%'
                    OR name LIKE '%%tipper%%' OR name LIKE '%%commercial%%'
                    OR name LIKE '%%eicher%%' OR name LIKE '%%tata ace%%'
                )
            """)
        except Exception:
            pass  # Non-critical migration

        # Bids table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS bids (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                user_id INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Office details table (finance office extended info)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS office_details (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                gst_number VARCHAR(20),
                pan_number VARCHAR(15),
                cin_number VARCHAR(25),
                company_address TEXT,
                city VARCHAR(100),
                state VARCHAR(100),
                pincode VARCHAR(10),
                bank_name VARCHAR(255),
                bank_account_number VARCHAR(30),
                bank_ifsc_code VARCHAR(15),
                bank_branch VARCHAR(255),
                authorized_person VARCHAR(255),
                designation VARCHAR(100),
                website VARCHAR(255),
                logo_path VARCHAR(255),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Contact messages table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(100) NOT NULL,
                mobile VARCHAR(15),
                state VARCHAR(50),
                city VARCHAR(50),
                subject VARCHAR(100),
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Transactions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                amount DECIMAL(12, 2) NOT NULL,
                status ENUM('won', 'completed', 'cancelled') DEFAULT 'won',
                transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        """)

        # Password Resets table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS password_resets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                token VARCHAR(255) NOT NULL UNIQUE,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Error Logs table — full device + browser fingerprint
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS error_logs (
                id              INT AUTO_INCREMENT PRIMARY KEY,
                user_id         INT DEFAULT NULL,
                username        VARCHAR(100) DEFAULT NULL,

                -- Error details
                error_type      VARCHAR(50)  DEFAULT 'frontend',
                error_message   TEXT,
                error_stack     TEXT,
                component_name  VARCHAR(255) DEFAULT NULL,

                -- Page context
                page_url        VARCHAR(1000) DEFAULT NULL,
                page_title      VARCHAR(500)  DEFAULT NULL,
                referrer_url    VARCHAR(1000) DEFAULT NULL,

                -- Device info (sent by client)
                device_type     VARCHAR(50)  DEFAULT NULL,
                device_model    VARCHAR(255) DEFAULT NULL,
                os_name         VARCHAR(100) DEFAULT NULL,
                os_version      VARCHAR(100) DEFAULT NULL,
                browser_name    VARCHAR(100) DEFAULT NULL,
                browser_version VARCHAR(100) DEFAULT NULL,
                user_agent      TEXT         DEFAULT NULL,

                -- Screen & locale
                screen_width    SMALLINT     DEFAULT NULL,
                screen_height   SMALLINT     DEFAULT NULL,
                viewport_width  SMALLINT     DEFAULT NULL,
                viewport_height SMALLINT     DEFAULT NULL,
                language        VARCHAR(20)  DEFAULT NULL,
                timezone        VARCHAR(100) DEFAULT NULL,

                -- Network & server
                ip_address      VARCHAR(45)  DEFAULT NULL,
                app_version     VARCHAR(50)  DEFAULT NULL,

                -- Timing
                occurred_at     DATETIME     NOT NULL,
                created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

                INDEX idx_error_type (error_type),
                INDEX idx_user_id    (user_id),
                INDEX idx_occurred_at (occurred_at)
            )
        """)


        # Subscription plans table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS plans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                duration VARCHAR(50) NOT NULL,
                period VARCHAR(50) NOT NULL,
                features TEXT,
                popular BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                sort_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)

        # Insert default plans if table is empty
        cursor.execute("SELECT COUNT(*) FROM plans")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
                INSERT INTO plans (name, price, duration, period, features, popular, sort_order) VALUES
                ('Basic', 499, '30 Days', '30 Days', '["Access all auctions","Real-time bidding","Email notifications","Standard support"]', FALSE, 1),
                ('Professional', 2799, '180 Days', '180 Days', '["Everything in Basic","Priority bidding queue","SMS & WhatsApp alerts","Dedicated manager","Early access"]', TRUE, 2),
                ('Enterprise', 4999, '365 Days', '365 Days', '["Everything in Pro","Unlimited bids","Analytics dashboard","24/7 priority support","API access"]', FALSE, 3)
            """)

        # Create default admin if not exists
        cursor.execute("SELECT * FROM users WHERE role = 'admin'")
        admin = cursor.fetchone()
        if not admin:
            hashed = generate_password_hash("admin123")
            cursor.execute(
                """INSERT INTO users (username, email, password_hash, role, status)
                   VALUES ('admin', 'admin@autorevive.com', %s, 'admin', 'active')""",
                (hashed,),
            )
            print("Default admin created: admin / admin123")

        conn.commit()
        cursor.close()
        conn.close()
        print("Database initialized successfully.")
