from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel
from typing import List, Union 
from collections import Counter

# Email Configuration
conf = ConnectionConfig(
    MAIL_USERNAME="factorysafety00@gmail.com",  
    MAIL_PASSWORD="dill uyof lnro psui",   # your Gmail app password
    MAIL_FROM="factorysafety00@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

class DetectionEmail(BaseModel):
    to: List[str]
    subject: str
    body: Union[str, List[str], dict, Counter]  # Can handle string, list, dict, Counter
    alert_type: str = "machine"  # 'ppe' or 'machine'

def format_body(body: Union[str, List[str], dict, Counter]) -> str:
    """Convert list, dict, Counter into HTML-friendly format."""
    if isinstance(body, list):
        formatted = "<ul>" + "".join(f"<li>{item}</li>" for item in body) + "</ul>"
    elif isinstance(body, (dict, Counter)):
        formatted = "<ul>" + "".join(f"<li><b>{k}:</b> {v}</li>" for k, v in body.items()) + "</ul>"
    else:
        formatted = f"<p>{body}</p>"
    return formatted

async def send_detection_email(to: List[str], subject: str, body: Union[str, List[str], dict, Counter], alert_type: str = "machine"):
    # Select colors based on alert type
    header_color = "#d62828" if alert_type == "ppe" else "#6a0dad"
    box_color = "#fff5f5" if alert_type == "ppe" else "#f3e5ff"
    border_color = "#d62828" if alert_type == "ppe" else "#6a0dad"

    # Format the body content
    html_body = format_body(body)

    # Beautified HTML email template
    html_content = f"""
    <html>
      <body style="margin:0; padding:0; background:#eef1f5; font-family:'Segoe UI', sans-serif;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
          <tr>
            <td>
              <table width="600" align="center" cellpadding="0" cellspacing="0" 
                     style="background:white; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.08); overflow:hidden;">

              <!-- HEADER -->
              <tr>
                <td style="background:{header_color}; padding:20px 25px; color:white;">
                  <h2 style="margin:0; font-size:24px;">⚠ {subject}</h2>
                </td>
              </tr>

              <!-- BODY -->
              <tr>
                <td style="padding:25px; color:#333;">
                  <p style="font-size:16px; margin-top:0;">Hello Team,</p>
                  <p style="font-size:15px; line-height:1.6;">
                    The system has detected the following violations:
                  </p>

                  <!-- VIOLATION BOX -->
                  <div style="
                      background:{box_color};
                      padding:15px 18px;
                      border-left:5px solid {border_color};
                      margin:18px 0;
                      border-radius:6px;
                      font-size:15px;
                      white-space:pre-line;">
                        {html_body}
                  </div>

                  <p style="font-size:15px; line-height:1.6;">
                    Please take immediate action to ensure workplace safety and compliance.
                  </p>

                  <p style="font-size:15px; line-height:1.6; margin-bottom:30px;">
                    Thank you,<br>
                    <b>PPE Monitoring System</b>
                  </p>
                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="
                    background:#f3f3f3; 
                    text-align:center; 
                    padding:12px; 
                    font-size:13px; 
                    color:#777;
                    border-top:1px solid #ddd;">
                    © 2025 Safety Monitoring | Automated Alert
                </td>
              </tr>

              </table>
            </td>
          </tr>
        </table>
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