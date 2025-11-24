# import sqlite3

# DB_FILE = 'users.db'

import mysql.connector

# MySQL connection config
MYSQL_CONFIG = {
    "host": "localhost",
    "user": "root",        # your MySQL username
    "password": "root",    # your MySQL password
    "database": "ppe_detection"
}

def register_user(name, email, password):
    """
    Register a new user.
    Returns (True, message) if success, (False, message) if failure.
    """
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
            (name, email, password)
        )
        conn.commit()
        return True, "User registered successfully."
    except mysql.connector.errors.IntegrityError:
        return False, "Email already exists."
    finally:
        conn.close()

def check_login(email, password):
    """
    Check login credentials.
    Returns (True, message) if login successful, (False, message) if failed.
    """
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, name, email, password FROM users WHERE email = %s",
        (email,)
    )
    user = cursor.fetchone()
    conn.close()

    if not user:
        return False, "User does not exist. Please sign up first."

    if user["password"] == password:
        return True, "Login successful."
    else:
        return False, "Incorrect password."