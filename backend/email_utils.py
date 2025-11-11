from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel
from typing import List

conf = ConnectionConfig(
    MAIL_USERNAME="vedika.desai@cumminscollege.in",  
    MAIL_PASSWORD="ijvv kuri ngnv jbfy",   
    MAIL_FROM="vedika.desai@cumminscollege.in",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

class DetectionEmail(BaseModel):
    to: List[str]
    subject: str
    body: str

async def send_detection_email(to: List[str], subject: str, body: str):
    message = MessageSchema(
        subject=subject,
        recipients=to,
        body=body,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    return {"message": "Email sent successfully"}
