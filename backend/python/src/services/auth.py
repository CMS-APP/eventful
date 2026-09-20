from src.sdk.firebase.app_check import app_check_error, verify_app_check
from src.sdk.firebase.auth import (
    EmailAlreadyVerified,
    TooManyAttempts,
    UserDisabled,
    UserNotFound,
    request_password_reset,
    send_email_verification,
)
from src.sdk.integrations.recaptcha import verify_recaptcha
from src.utils.https import format_request, require_method, response


def handle_send_verification_email_request(req, mjApiKey, mjSecret):
    if err := require_method(req, "POST"):
        return err
    if not verify_app_check(req):
        return app_check_error()

    req = format_request(req)
    email = req.get("email", "")

    try:
        send_email_verification(mjApiKey, mjSecret, email)
    except UserNotFound:
        return response("User not found", 400)
    except EmailAlreadyVerified:
        return response("Email already verified", 400)
    except UserDisabled:
        return response("User is disabled", 400)
    except TooManyAttempts:
        return response("Too many attempts. Please try again later.", 429)
    except Exception as exc:
        print(f"Error generating verification link: {exc}")
        return response("Internal error generating verification link.", 500)

    return response("Verification Email Sent", 200)


def handle_forgot_password_request(req, recaptchaSecret, mjApiKey, mjSecret):
    if err := require_method(req, "POST"):
        return err

    hasAppCheck = verify_app_check(req)
    req = format_request(req)
    email = req.get("email", "")
    if not email:
        return response("Missing required fields", 400)

    if not hasAppCheck:
        recaptchaToken = req.get("recaptchaToken", "")
        if not recaptchaToken:
            return response("Missing required fields", 400)
        if not verify_recaptcha(recaptchaSecret, recaptchaToken):
            return response("reCAPTCHA validation failed", 403)

    genericSuccess = response(
        "If your email is registered, you will receive a password reset link.", 200
    )

    try:
        request_password_reset(mjApiKey, mjSecret, email)
    except Exception as exc:
        print(f"Error in forgotPassword: {exc}")
        return response("Internal Server Error", 500)

    return genericSuccess
