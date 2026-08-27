function getFirstName(name, username) {
  if (name && name.trim()) {
    return name.trim().split(/\s+/)[0];
  }
  if (username && username.trim()) {
    return username.trim();
  }
  return "there";
}

function isBugReport(type) {
  return (type || "").toLowerCase().includes("bug");
}

const bugCopy = {
  heading: "Bug report received",
  subject: "Eventful: We received your bug report",
  bodyParagraphs: [
    "Thanks for reporting this issue. We've received your bug report and added it to our backlog for review.",
    "We'll investigate and reach out if we need any additional information.",
    "Thanks for helping improve the app."
  ]
};

const featureCopy = {
  heading: "Feature request received",
  subject: "Eventful: We received your feature request",
  bodyParagraphs: [
    "Thanks for the suggestion. We've received your feature request and added it to our list for consideration.",
    "We review all requests regularly and prioritise them based on user demand and impact.",
    "Thanks for helping shape the future of the app."
  ]
};

export function feedbackConfirmationEmailTemplate(feedbackData) {
  const { type, name, username } = feedbackData;
  const firstName = getFirstName(name, username);
  const copy = isBugReport(type) ? bugCopy : featureCopy;
  const bodyHtml = copy.bodyParagraphs
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("\n");

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${copy.heading} - Eventful</title>
    <style>
    body, html {
      font-family: "Poppins", sans-serif;
      font-size: 16px;
      color: #333;
      margin: 0;
      padding: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .header {
      padding-bottom: 10px;
      background-color: #0a3b2e;
    }
    .content {
      background-color: #ffffff;
      padding: 40px;
      text-align: left;
      flex-grow: 1;
    }
    .footer {
      padding: 20px;
      background-color: #6e9975;
      color: #ffffff;
      font-size: 12px;
      text-align: center;
    }
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
                <h2 style="color: #0a3b2e; font-weight: 600">${copy.heading}</h2>
                <p>Hi ${firstName},</p>
                ${bodyHtml}
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
`;
}

export function feedbackConfirmationEmailSubject(type) {
  return isBugReport(type) ? bugCopy.subject : featureCopy.subject;
}
