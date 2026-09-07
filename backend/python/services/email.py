import time

import requests
from mailjet_rest import Client

from templates.feedback_confirmation_email_template import (
    feedback_confirmation_email_subject,
    feedback_confirmation_email_template,
)
from templates.feedback_email_template import feedback_email_template
from templates.forgot_password_template import forgot_password_template
from templates.verify_email_template import verify_email_template

FROM_EMAIL = "no-reply@eventfulapp.com"
FROM_NAME = "Eventful Support"
REPLY_TO = "help@eventfulapp.com"


def _client(mj_api_key, mj_secret) -> Client:
    return Client(auth=(mj_api_key.value, mj_secret.value), version="v3")


def send_verification_email_mailjet(mj_api_key, mj_secret, to: str, verification_link: str) -> None:
    client = _client(mj_api_key, mj_secret)
    payload = {
        "FromEmail": FROM_EMAIL,
        "FromName": FROM_NAME,
        "ReplyTo": REPLY_TO,
        "Recipients": [{"Email": to, "Name": to}],
        "Subject": "Eventful: Verify your email",
        "Html-part": verify_email_template(verification_link),
    }

    try:
        client.send.create(data=payload)
    except requests.exceptions.ConnectionError:
        print("Mailjet connection reset - retrying once...")
        time.sleep(1)
        try:
            client.send.create(data=payload)
        except requests.exceptions.ConnectionError as retry_exc:
            print(f"Mailjet retry failed: {retry_exc}")
            raise RuntimeError("Mailjet connection reset after retry") from retry_exc


def send_forgot_password_email_mailjet(
    mj_api_key, mj_secret, to: str, forgot_password_link: str
) -> None:
    client = _client(mj_api_key, mj_secret)
    client.send.create(
        data={
            "FromEmail": FROM_EMAIL,
            "FromName": FROM_NAME,
            "ReplyTo": REPLY_TO,
            "Recipients": [{"Email": to, "Name": to}],
            "Subject": "Eventful: Reset your password",
            "Html-part": forgot_password_template(forgot_password_link),
        }
    )


def send_feedback_email_mailjet(mj_api_key, mj_secret, feedback_data: dict) -> None:
    client = _client(mj_api_key, mj_secret)
    client.send.create(
        data={
            "FromEmail": FROM_EMAIL,
            "FromName": FROM_NAME,
            "Recipients": [
                {"Email": "help@eventfulapp.com", "Name": "Eventful Support"},
                {"Email": "christopher.sharp@hotmail.co.uk", "Name": "Chris Sharp"},
                {"Email": "harrietrparsons@hotmail.com", "Name": "Harriet Parsons"},
            ],
            "Subject": "New Feedback Received",
            "Html-part": feedback_email_template(feedback_data),
        }
    )


def send_feedback_confirmation_email_mailjet(mj_api_key, mj_secret, feedback_data: dict) -> None:
    email = feedback_data.get("email")
    if not email:
        return

    name = feedback_data.get("name")
    username = feedback_data.get("username")
    type_ = feedback_data.get("type")
    recipient_name = name or username or email

    client = _client(mj_api_key, mj_secret)
    client.send.create(
        data={
            "FromEmail": FROM_EMAIL,
            "FromName": FROM_NAME,
            "ReplyTo": REPLY_TO,
            "Recipients": [{"Email": email, "Name": recipient_name}],
            "Subject": feedback_confirmation_email_subject(type_),
            "Html-part": feedback_confirmation_email_template(feedback_data),
        }
    )
