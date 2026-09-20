from firebase_functions import https_fn

from src.sdk.event_responses import CooldownActive, record_event_response
from src.sdk.integrations.recaptcha import verify_recaptcha
from src.utils.https import require_method, response


def handle_respond_to_event_request(req: https_fn.Request, recaptcha_secret) -> https_fn.Response:
    if err := require_method(req, "POST"):
        return err

    body = req.get_json(silent=True) or {}
    eventId = body.get("eventId")
    eventName = body.get("eventName")
    hostId = body.get("hostId")
    userResponse = body.get("response")
    name = body.get("name")
    email = body.get("email")
    recaptchaToken = body.get("recaptchaToken")
    deviceId = body.get("deviceId")
    ip = req.headers.get("X-Forwarded-For", "unknown-ip")

    if not userResponse or not name or not recaptchaToken or not deviceId:
        return response("Missing required fields", 400)

    try:
        if not verify_recaptcha(recaptcha_secret, recaptchaToken):
            return response("reCAPTCHA validation failed", 403)

        result = record_event_response(
            event_id=eventId,
            event_name=eventName,
            host_id=hostId,
            user_response=userResponse,
            name=name,
            email=email,
            device_id=deviceId,
            ip=ip,
        )
    except CooldownActive as cooldown:
        msg = f"Too many responses. Please wait: {cooldown.remaining_seconds} seconds."
        return response(msg, 429)
    except Exception as exc:
        print(f"Error processing request: {exc}")
        return response("Internal Server Error", 500)

    message = "Response updated" if result == "updated" else "Response recorded"
    return response(message, 200)
