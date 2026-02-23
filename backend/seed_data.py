"""
Reset DB and seed sample data with proper password hashes and state info.
Run from backend dir:  python seed_data.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import MySQLdb
from werkzeug.security import generate_password_hash

DB_HOST = "localhost"
DB_USER = "root"
DB_PASS = "root"
DB_NAME = "finance_auction_db"

def main():
    conn = MySQLdb.connect(host=DB_HOST, user=DB_USER, passwd=DB_PASS, db=DB_NAME)
    cur = conn.cursor()

    # ── Add state column to products if missing ──
    try:
        cur.execute("ALTER TABLE products ADD COLUMN state VARCHAR(100) DEFAULT NULL AFTER category")
        print("Added 'state' column to products table")
    except Exception:
        print("'state' column already exists in products (OK)")

    # ── Clear existing data (order matters for FK) ──
    cur.execute("SET FOREIGN_KEY_CHECKS = 0")
    for tbl in ["bids", "products", "office_details", "contact_messages"]:
        cur.execute(f"DELETE FROM {tbl}")
        print(f"  Cleared {tbl}")
    cur.execute("DELETE FROM users WHERE role != 'admin'")
    print("  Cleared non-admin users")
    cur.execute("SET FOREIGN_KEY_CHECKS = 1")

    # ── Update admin state ──
    cur.execute("UPDATE users SET state='Tamil Nadu', location='Chennai' WHERE role='admin'")

    # ── Password hashes ──
    office_pw = generate_password_hash("office123")
    user_pw = generate_password_hash("user123")

    # ── Office users ──
    offices = [
        ("hdfc_tn", "hdfc.tn@autorevive.com", "9876543210", "HDFC Bank Vehicle Loans", "Rajesh Kumar", office_pw, "office", "active", "Tamil Nadu", "Chennai"),
        ("icici_ka", "icici.ka@autorevive.com", "9876543211", "ICICI Bank Auto Finance", "Suresh Menon", office_pw, "office", "active", "Karnataka", "Bengaluru"),
        ("axis_mh", "axis.mh@autorevive.com", "9876543212", "Axis Bank Fleet Finance", "Amit Patil", office_pw, "office", "active", "Maharashtra", "Mumbai"),
        ("sbi_tn", "sbi.tn@autorevive.com", "9876543213", "SBI Vehicle Auction Wing", "Karthik Raman", office_pw, "office", "active", "Tamil Nadu", "Coimbatore"),
        ("bajaj_ap", "bajaj.ap@autorevive.com", "9876543214", "Bajaj Finance Ltd", "Venkat Reddy", office_pw, "office", "active", "Andhra Pradesh", "Hyderabad"),
    ]
    for o in offices:
        cur.execute(
            """INSERT INTO users (username, email, mobile_number, finance_name, owner_name, password_hash, role, status, state, location)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", o
        )
    print(f"  Created {len(offices)} office users")

    # ── Regular users ──
    users_ = [
        ("dealer_murugan", "murugan@gmail.com", "9898989801", None, None, user_pw, "user", "active", "Tamil Nadu", "Chennai"),
        ("dealer_priya", "priya@gmail.com", "9898989802", None, None, user_pw, "user", "active", "Tamil Nadu", "Madurai"),
        ("dealer_arjun", "arjun@gmail.com", "9898989803", None, None, user_pw, "user", "active", "Karnataka", "Bengaluru"),
        ("dealer_amit", "amit@gmail.com", "9898989804", None, None, user_pw, "user", "active", "Maharashtra", "Pune"),
        ("dealer_venkat", "venkat@gmail.com", "9898989805", None, None, user_pw, "user", "active", "Andhra Pradesh", "Vijayawada"),
    ]
    for u in users_:
        cur.execute(
            """INSERT INTO users (username, email, mobile_number, finance_name, owner_name, password_hash, role, status, state, location)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", u
        )
    print(f"  Created {len(users_)} regular users")

    # ── Get office IDs ──
    cur.execute("SELECT id, username FROM users WHERE role='office'")
    office_map = {row[1]: row[0] for row in cur.fetchall()}

    hdfc = office_map["hdfc_tn"]
    icici = office_map["icici_ka"]
    axis = office_map["axis_mh"]
    sbi = office_map["sbi_tn"]
    bajaj = office_map["bajaj_ap"]

    # ── Sample products (vehicles) ──
    vehicles = [
        # Tamil Nadu - HDFC (2W)
        (hdfc, "Royal Enfield Classic 350", "2019 model, single owner, well maintained, 25000 km", "2W", "Tamil Nadu", None, 95000, 120000, "approved"),
        (hdfc, "Honda Activa 6G", "2021 model, 8000 km driven, excellent condition", "2W", "Tamil Nadu", None, 45000, 60000, "approved"),
        (hdfc, "TVS Apache RTR 200", "2020 model, ABS variant, 18000 km, first owner", "2W", "Tamil Nadu", None, 72000, 90000, "approved"),
        # Tamil Nadu - HDFC (4W)
        (hdfc, "Maruti Swift VXI 2020", "Petrol, manual, 30000 km, single owner, white color", "4W", "Tamil Nadu", None, 420000, 520000, "approved"),
        (hdfc, "Hyundai i20 Asta 2019", "Petrol, automatic, sunroof, 35000 km", "4W", "Tamil Nadu", None, 550000, 680000, "approved"),

        # Tamil Nadu - SBI (3W & CV)
        (sbi, "Bajaj RE Auto Rickshaw", "2020 model, CNG, single owner, permit valid till 2026", "3W", "Tamil Nadu", None, 85000, 110000, "approved"),
        (sbi, "Piaggio Ape City", "2019 model, diesel, good condition, all papers clear", "3W", "Tamil Nadu", None, 95000, 130000, "approved"),
        (sbi, "Tata Ace Gold", "2021 model, diesel, 40000 km, excellent load carrier", "Commercial", "Tamil Nadu", None, 280000, 350000, "approved"),

        # Karnataka - ICICI (2W)
        (icici, "Yamaha FZ-S V3", "2021 model, 12000 km, single owner, dark knight color", "2W", "Karnataka", None, 68000, 85000, "approved"),
        (icici, "Bajaj Pulsar NS200", "2020 model, ABS, 22000 km, serviced regularly", "2W", "Karnataka", None, 62000, 80000, "approved"),
        # Karnataka - ICICI (4W)
        (icici, "Tata Nexon XZ+ 2021", "Petrol turbo, 20000 km, 5-star safety, white", "4W", "Karnataka", None, 680000, 850000, "approved"),
        (icici, "Kia Seltos HTK+ 2020", "Diesel, 40000 km, fully loaded, single owner", "4W", "Karnataka", None, 820000, 1050000, "approved"),
        (icici, "Honda City V CVT 2019", "Petrol, automatic, 28000 km, well maintained", "4W", "Karnataka", None, 650000, 800000, "approved"),

        # Maharashtra - Axis (4W & CV)
        (axis, "Mahindra Thar LX 2022", "Diesel AT, hard top, 15000 km, adventure ready", "4W", "Maharashtra", None, 1200000, 1500000, "approved"),
        (axis, "Toyota Fortuner 4x2 2020", "Diesel AT, 45000 km, white, single owner", "4W", "Maharashtra", None, 2800000, 3200000, "approved"),
        (axis, "Ashok Leyland Dost", "2020 model, 50000 km, BS6 compliant, good tyres", "Commercial", "Maharashtra", None, 350000, 450000, "approved"),
        (axis, "Eicher Pro 2049", "2019 model, 80000 km, AC cabin, all India permit", "Commercial", "Maharashtra", None, 750000, 950000, "approved"),

        # Andhra Pradesh - Bajaj (2W & 3W)
        (bajaj, "KTM Duke 200", "2021 model, 10000 km, orange color, like new", "2W", "Andhra Pradesh", None, 110000, 140000, "approved"),
        (bajaj, "Hero Splendor Plus", "2022 model, 5000 km, first owner, black", "2W", "Andhra Pradesh", None, 38000, 50000, "approved"),
        (bajaj, "Bajaj RE Compact 4S", "2021 model, LPG variant, low running cost", "3W", "Andhra Pradesh", None, 90000, 120000, "approved"),

        # Pending vehicles (for admin to approve)
        (hdfc, "Maruti Ertiga VXI 2022", "7 seater, petrol, 15000 km, family used", "4W", "Tamil Nadu", None, 720000, 880000, "pending"),
        (icici, "BMW 3 Series 320d 2018", "Diesel, 60000 km, luxury sedan, well maintained", "4W", "Karnataka", None, 1800000, 2200000, "pending"),
        (bajaj, "Mahindra Bolero Pickup", "2020 model, 35000 km, single owner, good condition", "Commercial", "Andhra Pradesh", None, 420000, 550000, "pending"),
    ]

    for v in vehicles:
        cur.execute(
            """INSERT INTO products (office_id, name, description, category, state, image_path, starting_price, quoted_price, status)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""", v
        )
    print(f"  Created {len(vehicles)} sample vehicles")

    # ── Office details ──
    details = [
        (hdfc, "33AABCH1234F1Z5", "AABCH1234F", "U65923TN2000PLC012345", "123 Anna Salai, Mylapore", "Chennai", "Tamil Nadu", "600004", "HDFC Bank", "50100123456789", "HDFC0001234", "Mylapore Branch", "Rajesh Kumar", "Branch Manager", "https://www.hdfcbank.com", None),
        (icici, "29AABCI5678G2Z3", "AABCI5678G", "U65929KA1995PLC018765", "456 MG Road, Indiranagar", "Bengaluru", "Karnataka", "560038", "ICICI Bank", "60200987654321", "ICIC0005678", "MG Road Branch", "Suresh Menon", "Senior Manager", "https://www.icicibank.com", None),
        (axis, "27AABCA9012H3Z1", "AABCA9012H", "U65927MH2001PLC023456", "789 FC Road, Shivaji Nagar", "Mumbai", "Maharashtra", "400001", "Axis Bank", "91700654321098", "UTIB0009012", "Fort Branch", "Amit Patil", "VP Operations", "https://www.axisbank.com", None),
        (sbi, "33AABCS3456I4Z9", "AABCS3456I", "U65923TN1998PLC034567", "321 Avinashi Road, RS Puram", "Coimbatore", "Tamil Nadu", "641002", "SBI", "30500111222333", "SBIN0003456", "RS Puram Branch", "Karthik Raman", "Chief Manager", "https://www.onlinesbi.com", None),
        (bajaj, "37AABCB7890J5Z7", "AABCB7890J", "U65937AP2005PLC045678", "654 Jubilee Hills, Road No 36", "Hyderabad", "Andhra Pradesh", "500033", "Bajaj Finance", "20300444555666", "KKBK0007890", "Jubilee Hills", "Venkat Reddy", "Regional Head", "https://www.bajajfinserv.in", None),
    ]
    for d in details:
        cur.execute(
            """INSERT INTO office_details (user_id, gst_number, pan_number, cin_number, company_address, city, state, pincode,
               bank_name, bank_account_number, bank_ifsc_code, bank_branch, authorized_person, designation, website, logo_path)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", d
        )
    print(f"  Created {len(details)} office detail records")

    # ── Sample bids ──
    cur.execute("SELECT id, username FROM users WHERE role='user'")
    user_map = {row[1]: row[0] for row in cur.fetchall()}

    cur.execute("SELECT id, name FROM products WHERE status='approved' LIMIT 10")
    product_ids = [(row[0], row[1]) for row in cur.fetchall()]

    murugan = user_map.get("dealer_murugan")
    priya = user_map.get("dealer_priya")
    arjun = user_map.get("dealer_arjun")

    if murugan and priya and arjun and len(product_ids) >= 5:
        bids = [
            (product_ids[0][0], murugan, 100000),
            (product_ids[0][0], priya, 105000),
            (product_ids[1][0], arjun, 50000),
            (product_ids[2][0], murugan, 78000),
            (product_ids[3][0], priya, 450000),
            (product_ids[3][0], arjun, 470000),
            (product_ids[4][0], murugan, 580000),
        ]
        for b in bids:
            cur.execute("INSERT INTO bids (product_id, user_id, amount) VALUES (%s,%s,%s)", b)
        print(f"  Created {len(bids)} sample bids")

    conn.commit()
    cur.close()
    conn.close()

    print("\n✅ Database reset complete!")
    print("   Offices: hdfc_tn / icici_ka / axis_mh / sbi_tn / bajaj_ap  (password: office123)")
    print("   Users:   dealer_murugan / dealer_priya / dealer_arjun / dealer_amit / dealer_venkat  (password: user123)")
    print("   Admin:   admin / admin123")
    print(f"   Vehicles: {len(vehicles)} total ({sum(1 for v in vehicles if v[-1]=='approved')} approved, {sum(1 for v in vehicles if v[-1]=='pending')} pending)")


if __name__ == "__main__":
    main()
