from firebase_admin import auth

from sdk.app_check import app_check_error, verify_app_check
from sdk.mailjet import send_forgot_password_email, send_verification_email
from sdk.recaptcha import verify_recaptcha
from utils.auth_action_links import build_auth_action_link
from utils.https import format_request, response

VERIFY_EMAIL_URL = "https://app.eventfulapp.com/verify-email"
RESET_PASSWORD_URL = "https://app.eventfulapp.com/reset-password"


def handle_send_verification_email_request(req, mjApiKey, mjSecret):
    if not verify_app_check(req):
        return app_check_error()

    req = format_request(req)
    email = req.get("email", "")

    try:
        user = auth.get_user_by_email(email)
    except auth.UserNotFoundError:
        return response("User not found", 400)

    if user.email_verified:
        return response("Email already verified", 400)
    if user.disabled:
        return response("User is disabled", 400)

    try:
        settings = auth.ActionCodeSettings(url=VERIFY_EMAIL_URL)
        adminLink = auth.generate_email_verification_link(email, action_code_settings=settings)
        link = build_auth_action_link(VERIFY_EMAIL_URL, "verifyEmail", adminLink)
    except auth.TooManyAttemptsTryLaterError:
        return response("Too many attempts. Please try again later.", 429)
    except Exception as exc:
        print(f"Error generating verification link: {exc}")
        return response("Internal error generating verification link.", 500)

    send_verification_email(mjApiKey, mjSecret, email, link)
    return response("Verification Email Sent", 200)


def handle_forgot_password_request(req, recaptchaSecret, mjApiKey, mjSecret):
    if req.method != "POST":
        return response("Method Not Allowed", 405)

    req = format_request(req)
    email = req.get("email", "")
    if not email:
        return response("Missing required fields", 400)

    if not verify_app_check(req):
        recaptchaToken = req.get("recaptchaToken", "")
        if not recaptchaToken:
            return response("Missing required fields", 400)
        if not verify_recaptcha(recaptchaSecret, recaptchaToken):
            return response("reCAPTCHA validation failed", 403)

    msg = "If your email is registered, you will receive a password reset link."
    genericSuccess = response(msg, 200)

    try:
        auth.get_user_by_email(email)
    except auth.UserNotFoundError:
        return genericSuccess

    try:
        settings = auth.ActionCodeSettings(url=RESET_PASSWORD_URL)
        adminLink = auth.generate_password_reset_link(email, action_code_settings=settings)
        link = build_auth_action_link(RESET_PASSWORD_URL, "resetPassword", adminLink)
    except Exception as exc:
        print(f"Error in forgotPassword: {exc}")
        return response("Internal Server Error", 500)

    send_forgot_password_email(mjApiKey, mjSecret, email, link)
    return genericSuccess
