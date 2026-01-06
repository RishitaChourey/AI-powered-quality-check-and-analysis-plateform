import os
import sqlite3

db_path = "users.db"
print(f"Looking for DB at: {os.path.abspath(db_path)}")

if not os.path.exists(db_path):
    print("❌ Database file not found!")
else:
    print("✅ Database file found!")
    conn = sqlite3.connect(db_path, check_same_thread=False, timeout=10)
    c = conn.cursor()

    # List all tables
    c.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in c.fetchall()]
    print(f"Tables found: {tables}")

    # Inspect each table
    for table in tables:
        print(f"\n--- Checking table: {table} ---")
        try:
            c.execute(f"SELECT * FROM {table}")
            rows = c.fetchall()
            print(f"Rows in '{table}': {len(rows)}")
            for row in rows:
                print(row)
        except Exception as e:
            print(f"Error reading {table}: {e}")

    conn.close()