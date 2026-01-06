import sqlite3, os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # backend/
DB_FILE = os.path.join(BASE_DIR, "users.db")

def init_db():
    """Initialize the database with all required tables."""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    # Users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')

    # Detection summary table
    c.execute('''
        CREATE TABLE IF NOT EXISTS detection_summary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            summary TEXT,  -- store JSON string here
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Class summary table
    c.execute('''
        CREATE TABLE IF NOT EXISTS class_summary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_name TEXT UNIQUE NOT NULL,
            count INTEGER DEFAULT 0
        )
    ''')

     # Checkpoint summary table (cumulative pass/fail counts per checkpoint)
    c.execute('''
        CREATE TABLE IF NOT EXISTS checkpoint_summary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            checkpoint_name TEXT UNIQUE NOT NULL,
            passed_count INTEGER DEFAULT 0,
            failed_count INTEGER DEFAULT 0
        )
    ''')

    # Machine summary table (per-run stats per machine type)
    c.execute('''
        CREATE TABLE IF NOT EXISTS machine_summary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_type TEXT DEFAULT 'Machine Type A',
            filename TEXT,
            passed_checkpoints INTEGER DEFAULT 0,
            failed_checkpoints INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # Notifications table
    c.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,              -- "ppe" or "machine"
            title TEXT,
            message TEXT,
            summary TEXT,                    -- JSON string for PPE or machine summary
            failed_items TEXT,               -- JSON string for machine failed checkpoints
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            read INTEGER DEFAULT 0           -- 0 = unread, 1 = read
        )
    ''')

    conn.commit()
    conn.close()

def update_class_summary(summary_dict):
    """Update or insert class counts into class_summary table."""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    for class_name, count in summary_dict.items():
        c.execute("UPDATE class_summary SET count = count + ? WHERE class_name = ?", 
                  (count, class_name))
        if c.rowcount == 0:
            c.execute("INSERT INTO class_summary (class_name, count) VALUES (?, ?)", 
                      (class_name, count))

    conn.commit()
    conn.close()


def update_checkpoint_summary(checkpoints: list):
    """
    Update checkpoint_summary with pass/fail counts.
    checkpoints = [{"name": "sensor", "passed": True}, {"name": "valve", "passed": False}]
    """
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    for cp in checkpoints:
        if cp["passed"]:
            c.execute("UPDATE checkpoint_summary SET passed_count = passed_count + 1 WHERE checkpoint_name = ?", (cp["name"],))
            if c.rowcount == 0:
                c.execute("INSERT INTO checkpoint_summary (checkpoint_name, passed_count, failed_count) VALUES (?, ?, ?)", (cp["name"], 1, 0))
        else:
            c.execute("UPDATE checkpoint_summary SET failed_count = failed_count + 1 WHERE checkpoint_name = ?", (cp["name"],))
            if c.rowcount == 0:
                c.execute("INSERT INTO checkpoint_summary (checkpoint_name, passed_count, failed_count) VALUES (?, ?, ?)", (cp["name"], 0, 1))

    conn.commit()
    conn.close()


def save_machine_summary(machine_type: str, filename: str, checkpoints: list):
    """Save per-run machine summary into machine_summary table."""
    passed = sum(1 for cp in checkpoints if cp["passed"])
    failed = sum(1 for cp in checkpoints if not cp["passed"])

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute(
        "INSERT INTO machine_summary (machine_type, filename, passed_checkpoints, failed_checkpoints) VALUES (?, ?, ?, ?)",
        (machine_type, filename, passed, failed)
    )
    conn.commit()
    conn.close()

def clear_class_summary():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("DELETE FROM class_summary")
    conn.commit()
    conn.close()

def get_connection():
    return sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)