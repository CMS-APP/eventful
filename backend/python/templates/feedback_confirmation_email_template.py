def _get_first_name(name: str | None, username: str | None) -> str:
    if name and name.strip():
        return name.strip().split()[0]
    if username and username.strip():
        return username.strip()
    return "there"


def _is_bug_report(type_: str | None) -> bool:
    return "bug" in (type_ or "").lower()


_BUG_COPY = {
    "heading": "Bug report received",
    "subject": "Eventful: We received your bug report",
    "body_paragraphs": [
        "Thanks for reporting this issue. We've received your bug report and added it to our backlog for review.",
        "We'll investigate and reach out if we need any additional information.",
        "Thanks for helping improve the app.",
    ],
}

_FEATURE_COPY = {
    "heading": "Feature request received",
    "subject": "Eventful: We received your feature request",
    "body_paragraphs": [
        "Thanks for the suggestion. We've received your feature request and added it to our list for consideration.",
        "We review all requests regularly and prioritise them based on user demand and impact.",
        "Thanks for helping shape the future of the app.",
    ],
}


def feedback_confirmation_email_template(feedback_data: dict) -> str:
    type_ = feedback_data.get("type")
    name = feedback_data.get("name")
    username = feedback_data.get("username")
    first_name = _get_first_name(name, username)
    copy = _BUG_COPY if _is_bug_report(type_) else _FEATURE_COPY
    body_html = "\n".join(f"<p>{paragraph}</p>" for paragraph in copy["body_paragraphs"])

    return f"""
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{copy["heading"]} - Eventful</title>
    <style>
    body, html {{
      font-family: "Poppins", sans-serif;
      font-size: 16px;
      color: #333;
      margin: 0;
      padding: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
    }}
    .header {{
      padding-bottom: 10px;
      background-color: #0a3b2e;
    }}
    .content {{
      background-color: #ffffff;
      padding: 40px;
      text-align: left;
      flex-grow: 1;
    }}
    .footer {{
      padding: 20px;
      background-color: #6e9975;
      color: #ffffff;
      font-size: 12px;
      text-align: center;
    }}
    </style>
  </head>
  <body style="background: #e3e3e3">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" class="header" style="padding: 15px 0">
          <h1 style="color: #ffffff; margin: 0; font-weight: 600">Eventful</h1>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 40px 20px">
          <table
            class="content"
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            "
          >
            <tr>
              <td style="text-align: left">
                <h2 style="color: #0a3b2e; font-weight: 600">{copy["heading"]}</h2>
                <p>Hi {first_name},</p>
                {body_html}
                <p>The Eventful Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div class="footer">
      &copy; 2025 Eventful. All vibes reserved.<br />
      <a
        href="https://app.eventfulapp.com/contact"
        style="color: #ffffff; text-decoration: none; font-weight: 600"
      >
        Need help? Hit us up anytime!
      </a>
    </div>
  </body>
</html>
"""


def feedback_confirmation_email_subject(type_: str | None) -> str:
    return _BUG_COPY["subject"] if _is_bug_report(type_) else _FEATURE_COPY["subject"]
