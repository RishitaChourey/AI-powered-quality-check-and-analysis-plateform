from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel
from typing import List

# Email Configuration
conf = ConnectionConfig(
    MAIL_USERNAME="vedika.desai@cumminscollege.in",  
    MAIL_PASSWORD="ijvv kuri ngnv jbfy",   # your Gmail app password
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
    body: str  # This will contain violation details

async def send_detection_email(to: List[str], subject: str, body: str):
    # Beautified HTML email template
    html_content = f"""
    <html>
      <body style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f7; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="background-color: #dc3545; color: white; padding: 20px; border-top-left-radius: 10px; border-top-right-radius: 10px;">
            <h2 style="margin: 0;">⚠️ PPE Violation Alert</h2>
          </div>
          <div style="padding: 20px; color: #333;">
            <p style="font-size: 16px;">Hello Team,</p>
            <p style="font-size: 15px;">The PPE detection system has identified the following safety violations:</p>

            <div style="background: #f9f9f9; padding: 10px 15px; border-left: 4px solid #dc3545; margin: 15px 0;">
              <p style="font-size: 15px; white-space: pre-line;">{body}</p>
            </div>

            <p style="font-size: 15px;">Please take immediate action to ensure safety compliance.</p>
            <p style="font-size: 15px;">Thank you,<br><b>PPE Monitoring System</b></p>
          </div>
          <div style="background-color: #f4f4f7; text-align: center; padding: 10px; border-top: 1px solid #ddd; font-size: 13px; color: #777;">
            © 2025 Safety Monitoring | Automated Alert
          </div>
        </div>
      </body>
    </html>
    """

    message = MessageSchema(
        subject=subject,
        recipients=to,
        body=html_content,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    return {"message": "Email sent successfully"}
