# services/email_utils/ppe_email.py

from fastapi_mail import FastMail, MessageSchema
from typing import Dict
from .email_config import conf
import asyncio

def generate_ppe_table(violations: Dict[str, int]):
    rows = ""
    for item, count in violations.items():
        rows += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{item}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align:center;">{count}</td>
        </tr>
        """
    return rows

async def send_ppe_email(to, subject, violations: Dict[str, int]):
    table_html = generate_ppe_table(violations)
    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="background-color: #d9534f; color: white; padding: 15px; font-size: 20px; border-radius: 6px;">
            ⚠️ PPE Violation Alert
        </div>

        <p>Hello Team,</p>
        <p>The PPE detection system has identified the following safety violations:</p>

        <div style="border-left: 4px solid red; padding-left: 15px;">
            <h3>PPE Violation Report</h3>

            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="background-color: #f8d7da;">
                        <th style="padding: 10px; text-align: left;">Name</th>
                        <th style="padding: 10px; text-align: center;">PPE items</th>
                    </tr>
                </thead>
                <tbody>
                    {table_html}
                </tbody>
            </table>

            <p style="margin-top: 15px;">Regards,<br>TEIM Safety Monitoring</p>
        </div>
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

# --- synchronous wrapper for FastAPI BackgroundTasks ---
def send_ppe_email_sync(to, subject, violations: Dict[str, int]):
    asyncio.run(send_ppe_email(to, subject, violations))
