from firebase_admin import auth

from src.sdk.integrations.mailjet import send_forgot_password_email, send_verification_email
from src.utils.auth_action_links import build_auth_action_link

VERIFY_EMAIL_URL = "https://app.eventfulapp.com/verify-email"
RESET_PASSWORD_URL = "https://app.eventfulapp.com/reset-password"


class UserNotFound(Exception):
    pass


class EmailAlreadyVerified(Exception):
    pass


class UserDisabled(Exception):
    pass


class TooManyAttempts(Exception):
    pass


def send_email_verification(mj_api_key, mj_secret, email: str) -> None:
    try:
        user = auth.get_user_by_email(email)
    except auth.UserNotFoundError as exc:
        raise UserNotFound from exc

    if user.email_verified:
        raise EmailAlreadyVerified
    if user.disabled:
        raise UserDisabled

    try:
        settings = auth.ActionCodeSettings(url=VERIFY_EMAIL_URL)
        admin_link = auth.generate_email_verification_link(email, action_code_settings=settings)
    except auth.TooManyAttemptsTryLaterError as exc:
        raise TooManyAttempts from exc

    link = build_auth_action_link(VERIFY_EMAIL_URL, "verifyEmail", admin_link)
    send_verification_email(mj_api_key, mj_secret, email, link)


def request_password_reset(mj_api_key, mj_secret, email: str) -> None:
    try:
        auth.get_user_by_email(email)
    except auth.UserNotFoundError:
        return

    settings = auth.ActionCodeSettings(url=RESET_PASSWORD_URL)
    admin_link = auth.generate_password_reset_link(email, action_code_settings=settings)
    link = build_auth_action_link(RESET_PASSWORD_URL, "resetPassword", admin_link)
    send_forgot_password_email(mj_api_key, mj_secret, email, link)
