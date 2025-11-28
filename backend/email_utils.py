from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from typing import Dict

conf = ConnectionConfig(
    MAIL_USERNAME="factorysafety00@gmail.com",
    MAIL_PASSWORD="dill uyof lnro psui",
    MAIL_FROM="factorysafety00@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

def generate_table_html(violations: Dict[str, int]):
    rows = ""
    for item, count in violations.items():
        rows += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{item}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align:center;">{count}</td>
        </tr>
        """
    return rows


async def send_detection_email(to, subject, summary: Dict[str, int]):
    table_rows = generate_table_html(summary)

    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="background-color: #d9534f; color: white; padding: 15px; font-size: 20px; border-radius: 6px;">
            ⚠️ PPE Violation Alert
        </div>

        <p>Hello Team,</p>
        <p>The PPE detection system has identified the following safety violations:</p>

        <div style="border-left: 4px solid red; padding-left: 15px;">
            <h3>PPE Violation Report</h3>
            <p>The system detected the following PPE violations:</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="background-color: #f8d7da;">
                        <th style="padding: 10px; text-align: left;">PPE Item</th>
                        <th style="padding: 10px; text-align: center;">Count</th>
                    </tr>
                </thead>
                <tbody>
                    {table_rows}
                </tbody>
            </table>

            <p style="margin-top: 15px;">Regards,<br>TEIM Safety Monitoring</p>
        </div>

        <p>Please take immediate action to ensure safety compliance.</p>

        <p>Thank you,<br>PPE Monitoring System</p>
    </div>
    """

    message = MessageSchema(
        subject=subject,
        recipients=to,
        body=html_content,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
