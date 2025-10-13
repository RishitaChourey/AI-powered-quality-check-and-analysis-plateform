import sqlite3

DB_PATH = 'users.db'

def ensure_table():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT
        )
    ''')
    conn.commit()
    conn.close()

def register_user(username, email, password):
    """
    Register a new user. Returns (success: bool, message: str)
    """
    ensure_table()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                       (username, email, password))
        conn.commit()
        return True, "User registered successfully."
    except sqlite3.IntegrityError:
        return False, "Username or email already exists."
    finally:
        conn.close()

def check_login(email, password):
    """
    Check login for existing user. Returns (success: bool, message: str)
    """
    ensure_table()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT id, username, email, password FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return False, "User does not exist. Please sign up first."
    stored_password = user[3]
    if stored_password == password:
        return True, "Login successful."
    else:
        return False, "Incorrect password."
