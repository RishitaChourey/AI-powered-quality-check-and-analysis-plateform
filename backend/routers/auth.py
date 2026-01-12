from fastapi import APIRouter,HTTPException
from fastapi.responses import JSONResponse
from models.users import User
from db.database import get_connection
import random
import smtplib
from datetime import datetime, timedelta
from email.message import EmailMessage
router = APIRouter()

@router.post("/signup")
async def signup(user: User):
    conn = get_connection()
    c = conn.cursor()

    c.execute("SELECT is_verified FROM users WHERE email=?", (user.email,))
    row = c.fetchone()

    otp = str(random.randint(100000, 999999))
    expiry = datetime.now() + timedelta(minutes=10)

    if row:
        # User exists
        if row[0] == 1:
            conn.close()
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            # User exists but not verified → resend OTP
            c.execute("""
                UPDATE users
                SET otp=?, otp_expiry=?
                WHERE email=?
            """, (otp, expiry, user.email))
            conn.commit()
            conn.close()

            send_otp_email(user.email, otp)
            return {"message": "OTP resent. Please verify your email."}

    # New user
    c.execute("""
        INSERT INTO users (name, email, password, otp, otp_expiry)
        VALUES (?, ?, ?, ?, ?)
    """, (user.name, user.email, user.password, otp, expiry))

    conn.commit()
    conn.close()

    send_otp_email(user.email, otp)
    return {"message": "OTP sent. Please verify your email."}

@router.post("/verify-otp")
def verify_otp(email: str, otp: str):
    conn = get_connection()
    c = conn.cursor()

    # 1️⃣ Fetch stored OTP
    c.execute(
        "SELECT otp FROM users WHERE email = ?",
        (email,)
    )
    row = c.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    stored_otp = row[0]

    # 2️⃣ Compare OTP
    if stored_otp != otp:
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # 3️⃣ Mark user as verified & clear OTP
    c.execute(
        """
        UPDATE users
        SET is_verified = 1,
            otp = NULL
        WHERE email = ?
        """,
        (email,)
    )

    conn.commit()
    conn.close()

    return {"message": "Email verified successfully"}

@router.post("/login")
async def login(user: User):
    conn = get_connection()
    c = conn.cursor()

    c.execute("""
        SELECT is_verified FROM users
        WHERE email=? AND password=?
    """, (user.email, user.password))

    row = c.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if row[0] == 0:
        otp = str(random.randint(100000, 999999))
        expiry = datetime.now() + timedelta(minutes=10)

        conn = get_connection()
        c = conn.cursor()
        c.execute("""
            UPDATE users SET otp=?, otp_expiry=? WHERE email=?
        """, (otp, expiry, user.email))
        conn.commit()
        conn.close()

        send_otp_email(user.email, otp)
        raise HTTPException(
            status_code=403,
            detail="Email not verified. OTP resent."
        )

    return {"message": "Login successful"}

def send_otp_email(to_email: str, otp: str):
    sender_email  = "factorysafety00@gmail.com"
    app_password = "chsc qwgd tzbg sajy"

    msg = EmailMessage()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = "Verify your email - OTP"

    msg.set_content(
        f"""
        Hello,

        Your One-Time Password (OTP) for email verification is:

        🔐 {otp}

        This OTP is valid for 10 minutes.
        If you did not request this, please ignore this email.

        Regards,
        AI Quality Assurance Team
        """
            )

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender_email, app_password)
        server.send_message(msg)