import re

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
_PASSWORD_RE = re.compile(
    r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_-])[A-Za-z\d!@#$%^&*(),.?":{}|<>_-]{8,}$'
)


def validate_email(email: str) -> bool:
    normalized_email = str(email).strip().lower()
    return bool(_EMAIL_RE.match(normalized_email))


def validate_password(password: str) -> bool:
    return bool(_PASSWORD_RE.match(password))
