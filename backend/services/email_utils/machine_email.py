from fastapi_mail import FastMail, MessageSchema
from typing import Dict
from .email_config import conf
import asyncio

def generate_badges(items, bg, color):
    return "".join(
        f"""
        <span style="
            display:inline-block;
            padding:8px 12px;
            margin:6px;
            background:{bg};
            color:{color};
            border-radius:10px;
            font-size:14px;">
            {item}
        </span>
        """
        for item in items
    )

async def send_machine_email(to, subject, detected_items, failed_items):
    detected_set = set(detected_items)
    failed_set = set(failed_items.keys())

    pass_items = sorted(detected_set - failed_set)
    fail_items = sorted(failed_set)

    pass_html = generate_badges(pass_items, "#DFFFEA", "#1B5E20")
    fail_html = generate_badges(fail_items, "#FFE2E2", "#B71C1C")

    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding:20px;">

        <h2 style="background:#2962FF; color:white; padding:15px; border-radius:6px;">
            🔧 Machine Quality Inspection
        </h2>

        <div style="display:flex; gap:20px; margin-top:20px;">

            <div style="flex:1; background:#E8FFF1; padding:15px; border-radius:10px;">
                <h3 style="color:#1B5E20;">✅ PASS</h3>
                {pass_html if pass_html else "<p>No passed items</p>"}
            </div>

            <div style="flex:1; background:#FFEAEA; padding:15px; border-radius:10px;">
                <h3 style="color:#B71C1C;">❌ FAIL</h3>
                {fail_html if fail_html else "<p>No failures detected 🎉</p>"}
            </div>

        </div>

        <p style="margin-top:25px;">
            Regards,<br>
            <b>TEIM Machine Monitoring</b>
        </p>

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

# --- synchronous wrapper for BackgroundTasks ---
def send_machine_email_sync(to, subject, detected_items, failed_items):
    asyncio.run(
        send_machine_email(to, subject, detected_items, failed_items)
    )

    


