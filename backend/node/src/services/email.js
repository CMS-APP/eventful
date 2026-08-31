import Mailjet from "node-mailjet";
import {
  feedbackConfirmationEmailSubject,
  feedbackConfirmationEmailTemplate,
} from "../templates/feedbackConfirmationEmailTemplate.js";
import { feedbackEmailTemplate } from "../templates/feedbackEmailTemplate.js";
import { forgotPasswordTemplate } from "../templates/forgotPasswordTemplate.js";
import { verifyEmailTemplate } from "../templates/verifyEmailTemplate.js";

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
      {
        Email: "christopher.sharp@hotmail.co.uk",
        Name: "Chris Sharp",
      },
      {
        Email: "harrietrparsons@hotmail.com",
        Name: "Harriet Parsons",
      },
    ],
    "Subject": "New Feedback Received",
    "Html-part": feedbackEmailTemplate(feedbackData),
  });
}

export async function sendFeedbackConfirmationEmailMailJet(
  MJ_API_KEY,
  MJ_SECRET,
  feedbackData,
) {
  const { email, name, username, type } = feedbackData;
  if (!email) {
    return;
  }

  const client = Mailjet.apiConnect(MJ_API_KEY.value(), MJ_SECRET.value());
  const recipientName = name || username || email;

  await client.post("send", { version: "v3" }).request({
    "FromEmail": "no-reply@eventfulapp.com",
    "FromName": "Eventful Support",
    "ReplyTo": "help@eventfulapp.com",
    "Recipients": [
      {
        Email: email,
        Name: recipientName,
      },
    ],
    "Subject": feedbackConfirmationEmailSubject(type),
    "Html-part": feedbackConfirmationEmailTemplate(feedbackData),
  });
}
