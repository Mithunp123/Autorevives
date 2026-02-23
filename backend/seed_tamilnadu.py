
import mysql.connector
from app import create_app
from app import db
import datetime

def seed_db():
    app = create_app()
    with app.app_context():
        conn = db.get_db()
        cursor = conn.cursor()

        # Disable foreign key checks to allow clearing tables
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        
        # Clear tables
        tables = ['bids', 'products', 'plans', 'users', 'auth_logs', 'notifications']
        for table in tables:
            try:
                cursor.execute(f"TRUNCATE TABLE {table}")
                print(f"Cleared {table}")
            except Exception as e:
                print(f"Error clearing {table}: {e}")
        
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

        # Insert Plans (Fixed price logic)
        plans = [
            ("Basic", 999.00, "30", "Days", '["Access to live auctions", "Limited bids (10/day)", "Email notifications"]', 0, 1),
            ("Silver", 2499.00, "90", "Days", '["Unlimited bids", "Priority support", "Access to premium inventory", "SMS alerts"]', 1, 2),
            ("Gold Dealer", 4999.00, "1", "Year", '["All Silver benefits", "Lower transaction fees", "Dedicated account manager", "Early access"]', 0, 3)
        ]
        
        cursor.executemany(
            "INSERT INTO plans (name, price, duration, period, features, popular, sort_order) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            plans
        )
        print("Inserted Plans")

        # Insert Users (Admin, Offices, Customers) in TN
        # Password hash for 'password' (bcrypt default or plain for seed if dev allows, assuming logic handles it)
        # In real app auth likely uses werkzeug.security
        from werkzeug.security import generate_password_hash
        pw_hash = generate_password_hash("password")

        users = [
            ("admin", "admin@autorevive.com", pw_hash, "9999999999", "admin", "active", "Chennai", "Tamil Nadu"),
            ("chennai_office", "chennai@finance.com", pw_hash, "9876543210", "office", "active", "Chennai", "Tamil Nadu"),
            ("madurai_office", "madurai@finance.com", pw_hash, "9876543211", "office", "active", "Madurai", "Tamil Nadu"),
            ("coimbatore_office", "kovai@finance.com", pw_hash, "9876543212", "office", "active", "Coimbatore", "Tamil Nadu"),
            ("salem_office", "salem@finance.com", pw_hash, "9876543213", "office", "active", "Salem", "Tamil Nadu"),
            ("user1", "user1@gmail.com", pw_hash, "9000000001", "user", "active", "Trichy", "Tamil Nadu"),
            ("user2", "user2@gmail.com", pw_hash, "9000000002", "user", "active", "Tirunelveli", "Tamil Nadu")
        ]

        cursor.executemany(
            "INSERT INTO users (username, email, password_hash, mobile_number, role, status, location, state) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            users
        )
        print("Inserted Users")

        # Get Office IDs
        cursor.execute("SELECT id, location FROM users WHERE role='office'")
        offices = {loc: uid for uid, loc in cursor.fetchall()}

        # Insert Products (TN Context)
        # Categories: 2W, 4W, CV, HE
        now = datetime.datetime.now()
        vehicles = [
            (offices.get("Chennai"), "Maruti Suzuki Swift VXi", "4W", "Chennai", "Tamil Nadu", 350000, 420000, "2019 model, single owner, well maintained, 45000 km", "approved", "uploads/hero-car.png"), # using stock or placeholder if image not uploaded via app
            (offices.get("Coimbatore"), "Tata Ace Gold", "CV", "Coimbatore", "Tamil Nadu", 280000, 320000, "2021 model, yellow board, running condition", "approved", "uploads/hero-truck.png"),
            (offices.get("Madurai"), "Honda Activa 6G", "2W", "Madurai", "Tamil Nadu", 45000, 55000, "2022 model, very low km, scratchless", "approved", "uploads/hero-bike.png"),
            (offices.get("Salem"), "Mahindra 575 DI Tractor", "HE", "Salem", "Tamil Nadu", 450000, 500000, "Farming use, good tyre condition, 2018", "approved", "uploads/hero-heavy.png"),
            (offices.get("Chennai"), "Hyundai Creta SX", "4W", "Chennai", "Tamil Nadu", 850000, 950000, "2020 diesel, sunroof, top end", "pending", None),
            (offices.get("Trichy"), "Royal Enfield Classic 350", "2W", "Trichy", "Tamil Nadu", 120000, 140000, "Signals edition, 2021", "approved", None)
        ]

        # Fix: handle missing offices if dict lookup fails
        vehicles = [v for v in vehicles if v[0] is not None]

        # Use None for image path in seed if actual files aren't in 'uploads/' yet. 
        # But for the hero connection, I'll set image_path to empty or placeholder.
        # Actually the frontend uses /api/uploads/, so these paths need to be valid or ignored.
        # I'll manually copy the hero images to uploads folder too or just leave null
        
        cursor.executemany(
            "INSERT INTO products (office_id, name, category, location, state, starting_price, quoted_price, description, status, image_path) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            vehicles
        )
        print("Inserted Products")

        conn.commit()
        cursor.close()
        conn.close()
        print("Database Seeded Successfully!")

if __name__ == "__main__":
    seed_db()
