export const forgotPasswordTemplate = (forgotPasswordLink) => {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Forgot Password - Eventful</title>
    <style>
    body, html {
        font-family: "Poppins", sans-serif;
        font-size: 16px;
        color: #333;
        margin: 0;
        padding: 0;
        height: 100%; /* Ensures full height */
        display: flex;
        flex-direction: column;
      }
    img {
        -ms-interpolation-mode: bicubic;
        max-width: 100%;
      }
    .header {
        padding-bottom: 10px;
        background-color: #0a3b2e;
      }
    .button {
        background-color: #fdba17;
        color: #0a3b2e;
        padding: 14px 24px;
        text-decoration: none;
        border-radius: 5px;
        display: inline-block;
        font-weight: 600;
        text-align: center;
      }
    .content {
        background-color: #ffffff;
        padding: 40px;
        text-align: left;
        flex-grow: 1; /* Ensures content area grows and takes full space */
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
    <!-- Header with Logo -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" class="header" style="padding: 15px 0">
          <h1 style="color: #ffffff; margin: 0; font-weight: 600">Eventful</h1>
        </td>
      </tr>
    </table>

    <!-- Body -->
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
                <h2 style="color: #0a3b2e; font-weight: 600">
                  Forgot Your Password?
                </h2>
                <p>Hey there 👋</p>
                <p>
                  We noticed you requested a password reset for your Eventful
                  account.
                </p>

                <p style="color: #333333; line-height: 1.6">
                  No worries, it happens to the best of us! Just click the
                  button below to reset your password and get back to creating
                  events.
                </p>

                <p style="text-align: center; margin: 30px 0">
                  <a href="${forgotPasswordLink}" class="button">
                    Reset Password
                  </a>
                </p>

                <p style="color: #999999; font-size: 12px; line-height: 1.5">
                  If you didn't request this, just ignore this email and we'll
                  leave you alone (promise).
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Footer -->
    <div class="footer">
      &copy; 2025 Eventful. All vibes reserved.<br />
      <a
        href="https://app.eventfulapp.com/contact"
        class="footer-link"
        style="color: #ffffff; text-decoration: none; font-weight: 600"
      >
        Need help? Hit us up anytime!
      </a>
    </div>
  </body>
</html>
`;
};
