"""Run payment columns migration."""
from app import create_app
app = create_app()

from app import db
conn = db.get_db()
cursor = conn.cursor()

queries = [
    "ALTER TABLE transactions ADD COLUMN payment_status ENUM('pending','verifying','verified','invalid') DEFAULT 'pending'",
    "ALTER TABLE transactions ADD COLUMN payment_screenshot VARCHAR(500) DEFAULT NULL",
    "ALTER TABLE transactions ADD COLUMN upi_transaction_id VARCHAR(100) DEFAULT NULL",
    "ALTER TABLE transactions ADD COLUMN verified_by INT DEFAULT NULL",
    "ALTER TABLE transactions ADD COLUMN verified_at TIMESTAMP NULL DEFAULT NULL",
]

for q in queries:
    try:
        cursor.execute(q)
        print(f"OK: {q[:60]}...")
    except Exception as e:
        print(f"SKIP: {e}")

conn.commit()
cursor.close()
conn.close()
print("Migration done!")
