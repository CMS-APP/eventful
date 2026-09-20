from sdk.http_client import post

RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"


def verify_recaptcha(secret, token: str) -> bool:
    response = post(
        RECAPTCHA_VERIFY_URL,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data=f"secret={secret.value}&response={token}",
    ).json()
    return bool(response.get("success"))
