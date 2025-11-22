from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel
from typing import List

# -------------------------------
# Email Schema
class EmailSchema(BaseModel):
    email_to: List[str]
    subject: str
    body: str
    attachment_path: str = None

# -------------------------------
# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME="factorysafety00@gmail.com",
    MAIL_PASSWORD="dill uyof lnro psui",  # <-- Use Gmail App Password
    MAIL_FROM="factorysafety00@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# -------------------------------
# Send email function with error logging
async def send_email(email: EmailSchema):
    try:
        message = {
            "subject": email.subject,
            "recipients": email.email_to,
            "body": email.body,
            "subtype": "html"
        }

        if email.attachment_path:
            message["attachments"] = [
                {
                    "filename": email.attachment_path.split("/")[-1],
                    "path": email.attachment_path
                }
            ]

        msg = MessageSchema(**message)
        fm = FastMail(conf)
        await fm.send_message(msg)
        print("Email sent successfully!")
    except Exception as e:
        print("Error sending email:", e)
