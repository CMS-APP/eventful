import requests
from firebase_admin import app_check, auth
from firebase_functions import https_fn

from services.email import (
    send_forgot_password_email_mailjet,
    send_verification_email_mailjet,
)
from utils.auth_action_links import build_auth_action_link

RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"
VERIFY_EMAIL_URL = "https://app.eventfulapp.com/verify-email"
RESET_PASSWORD_URL = "https://app.eventfulapp.com/reset-password"


def _verify_recaptcha(recaptcha_secret, recaptcha_token: str) -> bool:
    recaptcha_response = requests.post(
        RECAPTCHA_VERIFY_URL,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data=f"secret={recaptcha_secret.value}&response={recaptcha_token}",
        timeout=10,
    ).json()
    return bool(recaptcha_response.get("success")) and recaptcha_response.get("score", 0) >= 0.5


def handle_send_verification_email_request(
    req: https_fn.Request, mj_api_key, mj_secret
) -> https_fn.Response:
    try:
        app_check_token = req.headers.get("X-Firebase-AppCheck")
        if not app_check_token:
            return https_fn.Response("Missing app token", status=400)
        try:
            app_check.verify_token(app_check_token)
        except Exception as exc:
            print(f"App Check verification failed: {exc}")
            return https_fn.Response("Unauthorized", status=401)

        email = (req.get_json(silent=True) or {}).get("email")

        try:
            user = auth.get_user_by_email(email)
        except auth.UserNotFoundError:
            return https_fn.Response("User not found", status=400)

        if user.email_verified:
            return https_fn.Response("Email already verified", status=400)
        if user.disabled:
            return https_fn.Response("User is disabled", status=400)

        try:
            admin_link = auth.generate_email_verification_link(
                email, action_code_settings=auth.ActionCodeSettings(url=VERIFY_EMAIL_URL)
            )
            link = build_auth_action_link(VERIFY_EMAIL_URL, "verifyEmail", admin_link)
        except auth.TooManyAttemptsTryLaterError:
            return https_fn.Response("Too many attempts. Please try again later.", status=429)
        except Exception as exc:
            print(f"Error generating verification link: {exc}")
            return https_fn.Response("Internal error generating verification link.", status=500)

        send_verification_email_mailjet(mj_api_key, mj_secret, email, link)
        return https_fn.Response("Verification Email Sent", status=200)
    except Exception as exc:
        print(f"sendVerificationEmail error: {exc}")
        return https_fn.Response("Unexpected error", status=500)


def handle_forgot_password_request(
    req: https_fn.Request, recaptcha_secret, mj_api_key, mj_secret
) -> https_fn.Response:
    if req.method != "POST":
        return https_fn.Response("Method Not Allowed", status=405)

    generic_success = https_fn.Response(
        "If your email is registered, you will receive a password reset link.", status=200
    )

    try:
        body = req.get_json(silent=True) or {}
        email = body.get("email")
        recaptcha_token = body.get("recaptchaToken")

        if not email:
            return https_fn.Response("Missing required fields", status=400)

        app_check_token = req.headers.get("X-Firebase-AppCheck")
        if app_check_token:
            try:
                app_check.verify_token(app_check_token)
            except Exception as exc:
                print(f"App Check verification failed: {exc}")
                return https_fn.Response("Unauthorized", status=401)
        else:
            if not recaptcha_token:
                return https_fn.Response("Missing required fields", status=400)
            if not _verify_recaptcha(recaptcha_secret, recaptcha_token):
                return https_fn.Response("reCAPTCHA validation failed", status=403)

        try:
            user = auth.get_user_by_email(email)
        except auth.UserNotFoundError:
            return generic_success

        admin_link = auth.generate_password_reset_link(
            email, action_code_settings=auth.ActionCodeSettings(url=RESET_PASSWORD_URL)
        )
        link = build_auth_action_link(RESET_PASSWORD_URL, "resetPassword", admin_link)
        send_forgot_password_email_mailjet(mj_api_key, mj_secret, email, link)

        return generic_success
    except Exception as exc:
        print(f"Error in forgotPassword: {exc}")
        return https_fn.Response("Internal Server Error", status=500)
