import os
from dotenv import load_dotenv
import mysql.connector

# Load environment variables from .env
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

def ensure_database():
    """Create the database if it doesn't exist."""
    conn = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD
    )
    c = conn.cursor()
    c.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
    conn.commit()
    conn.close()

def get_connection():
    """Connect to the database (after ensuring it exists)."""
    ensure_database()
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
    )


def init_db():
    """Initialize the database with all required tables."""
    conn = get_connection()
    c = conn.cursor()

    # Users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            is_verified TINYINT(1) DEFAULT 0,
            otp VARCHAR(255),
            otp_expiry DATETIME
        )
    ''')

    # Detection summary table
    c.execute('''
        CREATE TABLE IF NOT EXISTS detection_summary (
            id INT AUTO_INCREMENT PRIMARY KEY,
            filename VARCHAR(255),
            summary JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Class summary table
    c.execute('''
        CREATE TABLE IF NOT EXISTS class_summary (
            id INT AUTO_INCREMENT PRIMARY KEY,
            class_name VARCHAR(255) UNIQUE NOT NULL,
            count INT DEFAULT 0
        )
    ''')

    # Checkpoint summary table
    c.execute('''
        CREATE TABLE IF NOT EXISTS checkpoint_summary (
            id INT AUTO_INCREMENT PRIMARY KEY,
            checkpoint_name VARCHAR(255) UNIQUE NOT NULL,
            passed_count INT DEFAULT 0,
            failed_count INT DEFAULT 0
        )
    ''')

    # Machine summary table
    c.execute('''
        CREATE TABLE IF NOT EXISTS machine_summary (
            id INT AUTO_INCREMENT PRIMARY KEY,
            machine_type VARCHAR(255) DEFAULT 'Machine Type A',
            filename VARCHAR(255),
            passed_checkpoints INT DEFAULT 0,
            failed_checkpoints INT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Notifications table
    c.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            type VARCHAR(50) NOT NULL,       -- "ppe" or "machine"
            title VARCHAR(255),
            message TEXT,
            summary JSON,                    -- JSON string for PPE or machine summary
            failed_items JSON,               -- JSON string for machine failed checkpoints
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_read TINYINT(1) DEFAULT 0        -- 0 = unread, 1 = read
        )
    ''')

    conn.commit()
    conn.close()


def update_class_summary(summary_dict):
    """Update or insert class counts into class_summary table."""
    conn = get_connection()
    c = conn.cursor()

    for class_name, count in summary_dict.items():
        c.execute("UPDATE class_summary SET count = count + %s WHERE class_name = %s",
                  (count, class_name))
        if c.rowcount == 0:
            c.execute("INSERT INTO class_summary (class_name, count) VALUES (%s, %s)",
                      (class_name, count))

    conn.commit()
    conn.close()


def update_checkpoint_summary(checkpoints: list):
    """
    Update checkpoint_summary with pass/fail counts.
    checkpoints = [{"name": "sensor", "passed": True}, {"name": "valve", "passed": False}]
    """
    conn = get_connection()
    c = conn.cursor()

    for cp in checkpoints:
        if cp["passed"]:
            c.execute("UPDATE checkpoint_summary SET passed_count = passed_count + 1 WHERE checkpoint_name = %s", (cp["name"],))
            if c.rowcount == 0:
                c.execute("INSERT INTO checkpoint_summary (checkpoint_name, passed_count, failed_count) VALUES (%s, %s, %s)", (cp["name"], 1, 0))
        else:
            c.execute("UPDATE checkpoint_summary SET failed_count = failed_count + 1 WHERE checkpoint_name = %s", (cp["name"],))
            if c.rowcount == 0:
                c.execute("INSERT INTO checkpoint_summary (checkpoint_name, passed_count, failed_count) VALUES (%s, %s, %s)", (cp["name"], 0, 1))

    conn.commit()
    conn.close()


def save_machine_summary(machine_type: str, filename: str, checkpoints: list):
    """Save per-run machine summary into machine_summary table."""
    passed = sum(1 for cp in checkpoints if cp["passed"])
    failed = sum(1 for cp in checkpoints if not cp["passed"])

    conn = get_connection()
    c = conn.cursor()
    c.execute(
        "INSERT INTO machine_summary (machine_type, filename, passed_checkpoints, failed_checkpoints) VALUES (%s, %s, %s, %s)",
        (machine_type, filename, passed, failed)
    )
    conn.commit()
    conn.close()


def clear_class_summary():
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM class_summary")
    conn.commit()
    conn.close()