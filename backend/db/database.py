import sqlite3, os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # backend/
DB_FILE = os.path.join(BASE_DIR, "users.db")

def init_db():
    if not os.path.exists(DB_FILE):
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('''
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        ''')
        conn.commit()
        conn.close()

def get_connection():
    return sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)