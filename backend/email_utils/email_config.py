from fastapi_mail import ConnectionConfig

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
