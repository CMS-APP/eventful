import Mailjet from "node-mailjet";
import { feedbackEmailTemplate } from "./feedbackEmailTemplate.js";
import { forgotPasswordTemplate } from "./forgotPasswordTemplate.js";
import { verifyEmailTemplate } from "./verifyEmailTemplate.js";

export async function sendVerificationEmailMailJet(
  MJ_API_KEY,
  MJ_SECRET,
  to,
  verificationLink,
) {
  const client = Mailjet.apiConnect(MJ_API_KEY.value(), MJ_SECRET.value());

  const payload = {
    "FromEmail": "no-reply@eventfulapp.com",
    "FromName": "Eventful Support",
    "ReplyTo": "help@eventfulapp.com",
    "Recipients": [
      {
        Email: to,
        Name: to,
      },
    ],
    "Subject": "Eventful: Verify your email",
    "Html-part": verifyEmailTemplate(verificationLink),
  };

  try {
    return await client.post("send", { version: "v3" }).request(payload);
  } catch (err) {
    // 🔍 Specific handling for network reset
    if (err.code === "ECONNRESET") {
      console.warn("Mailjet ECONNRESET – retrying once...");
      // wait 1s then retry once
      await new Promise((res) => setTimeout(res, 1000));
      try {
        return await client.post("send", { version: "v3" }).request(payload);
      } catch (retryErr) {
        console.error("Mailjet retry failed:", retryErr);
        throw new Error("Mailjet connection reset after retry");
      }
    }

    // 🔍 Log unexpected Mailjet errors
    console.error("Mailjet send failed:", err);
    throw err;
  }
}

export async function sendForgotPasswordEmailMailJet(
  MJ_API_KEY,
  MJ_SECRET,
  to,
  forgotPasswordLink,
) {
  const client = Mailjet.apiConnect(MJ_API_KEY.value(), MJ_SECRET.value());

  await client.post("send", { version: "v3" }).request({
    "FromEmail": "no-reply@eventfulapp.com",
    "FromName": "Eventful Support",
    "ReplyTo": "help@eventfulapp.com",
    "Recipients": [
      {
        Email: to,
        Name: to,
      },
    ],
    "Subject": "Eventful: Reset your password",
    "Html-part": forgotPasswordTemplate(forgotPasswordLink),
  });
}

export async function sendFeedbackEmailMailJet(
  MJ_API_KEY,
  MJ_SECRET,
  feedbackData,
) {
  const client = Mailjet.apiConnect(MJ_API_KEY.value(), MJ_SECRET.value());

  await client.post("send", { version: "v3" }).request({
    "FromEmail": "no-reply@eventfulapp.com",
    "FromName": "Eventful Support",
    "Recipients": [
      {
        Email: "help@eventfulapp.com",
        Name: "Eventful Support",
      },
    ],
    "Subject": "New Feedback Received",
    "Html-part": feedbackEmailTemplate(feedbackData),
  });
}
