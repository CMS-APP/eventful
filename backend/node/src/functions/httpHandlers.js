const cors = require("cors")({ origin: true });
const { sendExpoNotifications } = require("../services/notifications");
const { signUp } = require("../auth/signUp");
const {
  sendVerificationEmailMailJet,
  sendForgotPasswordEmailMailJet
} = require("../services/email");
const { buildAuthActionLink } = require("../utils/authActionLinks");

function createRespondToEventHandler({ admin, db, RECAPTCHA_SECRET }) {
  return async (request, response) => {
    if (request.method !== "POST") {
      return response.status(405).send("Method Not Allowed");
    }

    const {
      eventId,
      eventName,
      hostId,
      response: userResponse,
      name,
      email,
      recaptchaToken,
      deviceId
    } = request.body;
    const ip = request.headers["x-forwarded-for"] || "unknown-ip";
    if (!userResponse || !name || !email || !recaptchaToken || !deviceId) {
      return response.status(400).send("Missing required fields");
    }

    try {
      const COOLDOWN_PERIOD_MS = 5 * 60 * 1000;
      const secretKey = RECAPTCHA_SECRET.value();

      const recaptchaResponse = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${secretKey}&response=${recaptchaToken}`
        }
      ).then((res) => res.json());

      if (!recaptchaResponse.success || recaptchaResponse.score < 0.5) {
        return response.status(403).send("reCAPTCHA validation failed");
      }

      const emailSnapshot = await db
        .collection("eventResponses")
        .where("email", "==", email)
        .where("eventId", "==", eventId)
        .orderBy("responseTimestamp", "desc")
        .limit(1)
        .get();

      const deviceSnapshot = await db
        .collection("eventResponses")
        .where("deviceId", "==", deviceId)
        .where("eventId", "==", eventId)
        .orderBy("responseTimestamp", "desc")
        .limit(1)
        .get();

      const lastEmailResponse = emailSnapshot.empty
        ? null
        : emailSnapshot.docs[0].data();
      const lastDeviceResponse = deviceSnapshot.empty
        ? null
        : deviceSnapshot.docs[0].data();

      if (lastEmailResponse || lastDeviceResponse) {
        const lastEmailResponseTime = lastEmailResponse
          ? lastEmailResponse.responseTimestamp.toMillis()
          : 0;
        const lastDeviceResponseTime = lastDeviceResponse
          ? lastDeviceResponse.responseTimestamp.toMillis()
          : 0;
        const lastResponseTime = Math.max(
          lastEmailResponseTime,
          lastDeviceResponseTime
        );

        if (Date.now() - lastResponseTime < COOLDOWN_PERIOD_MS) {
          const remainingTime =
            COOLDOWN_PERIOD_MS - (Date.now() - lastResponseTime);
          const remainingMinutes = Math.floor(remainingTime / 60000);
          const remainingSeconds = Math.floor((remainingTime % 60000) / 1000);

          if (remainingMinutes > 0) {
            return response
              .status(429)
              .send(
                "Too many responses. Please wait: " +
                  remainingMinutes +
                  " minutes and " +
                  remainingSeconds +
                  " seconds."
              );
          }

          return response
            .status(429)
            .send(
              "Too many responses. Please wait: " +
                remainingSeconds +
                " seconds."
            );
        }

        const existingResponse = lastEmailResponse
          ? emailSnapshot.docs[0]
          : deviceSnapshot.docs[0];
        await existingResponse.ref.update({
          response: userResponse,
          responseIp: ip,
          responseTimestamp: admin.firestore.Timestamp.now(),
          name,
          email
        });

        await sendExpoNotifications(
          db,
          hostId,
          "New Event Response",
          `${name} (${email}) just responded to your event (${eventName}).`
        );
        return response.status(200).send("Response updated");
      }

      const docRef = await db.collection("eventResponses").add({
        eventId,
        hostId,
        email,
        deviceId,
        response: userResponse,
        responseIp: ip,
        responseTimestamp: admin.firestore.Timestamp.now(),
        name
      });

      await docRef.update({ id: docRef.id });
      await sendExpoNotifications(
        db,
        hostId,
        "New Event Response",
        `${name} (${email}) just responded to your event (${eventName}).`
      );

      return response.status(200).send("Response recorded");
    } catch (error) {
      console.error("Error processing request:", error);
      return response.status(500).send("Internal Server Error");
    }
  };
}

function createAppCheckTokenHandler({ admin }) {
  return (request, response) => {
    cors(request, response, async () => {
      const idToken = request.headers.authorization?.split("Bearer ")[1];

      if (!idToken) {
        console.log("No ID token found in request");
        return response.status(400).send("No ID token found");
      }

      console.log("Received ID token:", idToken);

      try {
        const validToken = await admin.auth().verifyIdToken(idToken);
        console.log("Verified token:", validToken);

        if (!validToken) {
          console.log("Invalid token");
          return response.status(401).send("Unauthorized");
        }

        const appCheckToken = await admin
          .appCheck()
          .createToken("1:165003650822:web:88a7fa08ae63985891a087");

        response.json({ token: appCheckToken.token });
      } catch (err) {
        console.error("Error verifying token:", err);
        response.status(401).send("Unauthorized");
      }
    });
  };
}

function createSendVerificationEmailHandler({ admin, MJ_API_KEY, MJ_SECRET }) {
  return (request, response) => {
    cors(request, response, async () => {
      try {
        const appCheckToken = request.header("X-Firebase-AppCheck");
        const { email } = request.body;

        await admin.appCheck().verifyToken(appCheckToken);

        const user = await admin.auth().getUserByEmail(email);

        if (!user) return response.status(400).send("User not found");
        if (user.emailVerified) {
          return response.status(400).send("Email already verified");
        }
        if (user.disabled) return response.status(400).send("User is disabled");

        let link;
        try {
          const adminLink = await admin
            .auth()
            .generateEmailVerificationLink(email, {
              url: "https://app.eventfulapp.com/verify-email"
            });
          link = buildAuthActionLink(
            "https://app.eventfulapp.com/verify-email",
            "verifyEmail",
            adminLink
          );
        } catch (err) {
          if (
            err.code === "auth/too-many-requests" ||
            (err.message && err.message.includes("TOO_MANY_ATTEMPTS_TRY_LATER"))
          ) {
            return response
              .status(429)
              .send("Too many attempts. Please try again later.");
          }
          console.error("Error generating verification link:", err);
          return response
            .status(500)
            .send("Internal error generating verification link.");
        }

        await sendVerificationEmailMailJet(MJ_API_KEY, MJ_SECRET, email, link);
        return response.status(200).send("Verification Email Sent");
      } catch (err) {
        console.error("sendVerificationEmail error:", err);
        return response.status(500).send("Unexpected error");
      }
    });
  };
}

function createForgotPasswordHandler({
  admin,
  RECAPTCHA_SECRET,
  MJ_API_KEY,
  MJ_SECRET
}) {
  return async (request, response) => {
    if (request.method !== "POST") {
      return response.status(405).send("Method Not Allowed");
    }
    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    try {
      const { email, recaptchaToken } = request.body;

      if (!email) {
        response.status(400).send("Missing required fields");
        return;
      }

      const appCheckToken = request.header("X-Firebase-AppCheck");

      if (appCheckToken) {
        try {
          await admin.appCheck().verifyToken(appCheckToken);
        } catch (error) {
          console.error("App Check verification failed:", error);
          response.status(401).send("Unauthorized");
          return;
        }
      } else {
        if (!recaptchaToken) {
          response.status(400).send("Missing required fields");
          return;
        }

        const secretKey = RECAPTCHA_SECRET.value();
        const recaptchaResponse = await fetch(
          "https://www.google.com/recaptcha/api/siteverify",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${secretKey}&response=${recaptchaToken}`
          }
        ).then((res) => res.json());

        if (!recaptchaResponse.success || recaptchaResponse.score < 0.5) {
          response.status(403).send("reCAPTCHA validation failed");
          return;
        }
      }

      const user = await admin.auth().getUserByEmail(email);
      if (user) {
        const adminLink = await admin.auth().generatePasswordResetLink(email, {
          url: "https://app.eventfulapp.com/reset-password"
        });
        const link = buildAuthActionLink(
          "https://app.eventfulapp.com/reset-password",
          "resetPassword",
          adminLink
        );

        await sendForgotPasswordEmailMailJet(
          MJ_API_KEY,
          MJ_SECRET,
          email,
          link
        );
      }

      response
        .status(200)
        .send(
          "If your email is registered, you will receive a password reset link."
        );
    } catch (error) {
      console.error("Error in forgotPassword:", error);
      response.status(500).send("Internal Server Error");
    }
  };
}

function createIncrementStatHandler({
  admin,
  db,
  fieldName,
  successMessage,
  failureMessage
}) {
  return (request, response) => {
    cors(request, response, async () => {
      const appCheckToken = request.header("X-Firebase-AppCheck");
      if (!appCheckToken) return response.status(400).send("Missing app token");

      try {
        await admin.appCheck().verifyToken(appCheckToken);
      } catch (error) {
        console.error("App Check verification failed:", error);
        return response.status(401).send("Unauthorized");
      }

      try {
        const docRef = db.collection("stats").doc("stats");
        const docSnap = await docRef.get();

        if (docSnap.exists) {
          const currentValue = docSnap.data()[fieldName] || 0;
          await docRef.update({ [fieldName]: currentValue + 1 });
        } else {
          await docRef.set({ [fieldName]: 1 }, { merge: true });
        }

        response.status(200).send(successMessage);
      } catch (error) {
        console.error(failureMessage, error);
        response.status(500).send(failureMessage);
      }
    });
  };
}

function createSignUpHandler({ admin, MJ_API_KEY, MJ_SECRET }) {
  return (request, response) => {
    cors(request, response, async () => {
      if (request.method !== "POST") {
        return response.status(405).json({ message: "Method Not Allowed" });
      }

      let parsedBody;
      try {
        parsedBody =
          typeof request.body === "string"
            ? JSON.parse(request.body || "{}")
            : request.body || {};
      } catch (error) {
        return response.status(400).json({ message: "Invalid JSON body" });
      }
      const { email, password } = parsedBody;
      const result = await signUp({ admin, email, password });

      if (!result.ok) {
        return response.status(result.status).json(result.error);
      }

      const createdEmail =
        result.data && result.data.email ? result.data.email : email;

      try {
        const adminLink = await admin
          .auth()
          .generateEmailVerificationLink(createdEmail, {
            url: "https://app.eventfulapp.com/verify-email"
          });
        const link = buildAuthActionLink(
          "https://app.eventfulapp.com/verify-email",
          "verifyEmail",
          adminLink
        );
        await sendVerificationEmailMailJet(
          MJ_API_KEY,
          MJ_SECRET,
          createdEmail,
          link
        );
      } catch (error) {
        console.error("signUp verification email error:", error);
        return response.status(500).json({
          code: "VERIFICATION_EMAIL_FAILED",
          message:
            "Account created, but we could not send your verification email. Please try again."
        });
      }

      return response.status(result.status).json({
        ...result.data,
        verificationEmailSent: true
      });
    });
  };
}

module.exports = {
  createRespondToEventHandler,
  createAppCheckTokenHandler,
  createSendVerificationEmailHandler,
  createForgotPasswordHandler,
  createIncrementStatHandler,
  createSignUpHandler
};
