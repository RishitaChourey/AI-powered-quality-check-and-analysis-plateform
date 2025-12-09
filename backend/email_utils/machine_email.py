from fastapi_mail import FastMail, MessageSchema
from typing import Dict
from . import conf


def generate_machine_table(items: Dict[str, int]):
    rows = ""
    for item, count in items.items():
        rows += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{item}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align:center;">{count}</td>
        </tr>
        """
    return rows


async def send_machine_email(to, subject, summary: Dict[str, int]):
    table_html = generate_machine_table(summary)

    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="background-color: #2962FF; color: white; padding: 15px; font-size: 20px; border-radius: 6px;">
            🔧 Machine Quality Alert
        </div>

        <p>Hello Team,</p>
        <p>The machine quality detection system has identified the following issues:</p>

        <div style="border-left: 4px solid #2962FF; padding-left: 15px;">
            <h3>Machine Quality Report</h3>

            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="background-color: #E3F2FD;">
                        <th style="padding: 10px; text-align: left;">Machine Item</th>
                        <th style="padding: 10px; text-align: center;">Count</th>
                    </tr>
                </thead>
                <tbody>
                    {table_html}
                </tbody>
            </table>

            <p style="margin-top: 15px;">Regards,<br>TEIM Machine Monitoring</p>
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
