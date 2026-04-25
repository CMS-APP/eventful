const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { sendExpoNotifications } = require("./notifications");
const {
  sendVerificationEmailMailJet,
  sendForgotPasswordEmailMailJet,
  sendFeedbackEmailMailJet,
} = require("./email");
const { getUserInfo } = require("./user");
const { getStoragePathFromUrl } = require("./photos");
const { createAlgoliaUserSearchHandler } = require("./algoliaUserSearch");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

const RECAPTCHA_SECRET = defineSecret("RECAPTCHA_SECRET");
const MJ_API_KEY = defineSecret("MJ_API_KEY");
const MJ_SECRET = defineSecret("MJ_SECRET");
const ALGOLIA_APP_ID = defineSecret("ALGOLIA_APP_ID");
const ALGOLIA_API_KEY = defineSecret("ALGOLIA_API_KEY");

exports.respondToEvent = onRequest(
  {
    secrets: [RECAPTCHA_SECRET],
    cors: [/eventfulapp\.com$/],
  },
  async (request, response) => {
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
      deviceId,
    } = request.body;
    const ip = request.headers["x-forwarded-for"] || "unknown-ip";
    if (!userResponse || !name || !email || !recaptchaToken || !deviceId) {
      return response.status(400).send("Missing required fields");
    }

    try {
      const COOLDOWN_PERIOD_MS = 5 * 60 * 1000;
      const secretKey = RECAPTCHA_SECRET.value();

      // Verify reCAPTCHA
      const recaptchaResponse = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${secretKey}&response=${recaptchaToken}`,
        },
      ).then((res) => res.json());

      if (!recaptchaResponse.success || recaptchaResponse.score < 0.5) {
        return response.status(403).send("reCAPTCHA validation failed");
      }

      // Run queries for both email and deviceId
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

      // Combine results from both queries (OR logic)
      const lastEmailResponse = emailSnapshot.empty
        ? null
        : emailSnapshot.docs[0].data();
      const lastDeviceResponse = deviceSnapshot.empty
        ? null
        : deviceSnapshot.docs[0].data();

      if (lastEmailResponse || lastDeviceResponse) {
        // Check the most recent response time (from either email or device)

        let lastEmailResponseTime = 0;
        if (lastEmailResponse) {
          lastEmailResponseTime =
            lastEmailResponse.responseTimestamp.toMillis();
        } else {
          lastEmailResponseTime = 0;
        }

        let lastDeviceResponseTime = 0;
        if (lastDeviceResponse) {
          lastDeviceResponseTime =
            lastDeviceResponse.responseTimestamp.toMillis();
        } else {
          lastDeviceResponseTime = 0;
        }
        const lastResponseTime = Math.max(
          lastEmailResponseTime,
          lastDeviceResponseTime,
        );

        // Apply cooldown check
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
                  " seconds.",
              );
          }

          return response
            .status(429)
            .send(
              "Too many responses. Please wait: " +
                remainingSeconds +
                " seconds.",
            );
        } else {
          // If a response exists, update it (choose email or device response based on the most recent)
          const existingResponse = lastEmailResponse
            ? emailSnapshot.docs[0]
            : deviceSnapshot.docs[0];
          await existingResponse.ref.update({
            response: userResponse,
            responseIp: ip,
            responseTimestamp: admin.firestore.Timestamp.now(),
            name,
            email,
          });

          await sendExpoNotifications(
            db,
            hostId,
            "New Event Response",
            `${name} (${email}) just responded to your event (${eventName}).`,
          );
          return response.status(200).send("Response updated");
        }
      }

      // If no previous response exists, add new one
      const docRef = await db.collection("eventResponses").add({
        eventId,
        hostId,
        email,
        deviceId,
        response: userResponse,
        responseIp: ip,
        responseTimestamp: admin.firestore.Timestamp.now(),
        name,
      });

      await docRef.update({ id: docRef.id });
      await sendExpoNotifications(
        db,
        hostId,
        "New Event Response",
        `${name} (${email}) just responded to your event (${eventName}).`,
      );

      return response.status(200).send("Response recorded");
    } catch (error) {
      console.error("Error processing request:", error);
      return response.status(500).send("Internal Server Error");
    }
  },
);

const cors = require("cors")({ origin: true });

exports.appCheckToken = onRequest((request, response) => {
  cors(request, response, async () => {
    const idToken = request.headers.authorization?.split("Bearer ")[1];

    if (!idToken) {
      console.log("No ID token found in request");
      return response.status(400).send("No ID token found");
    }

    console.log("Received ID token:", idToken);

    try {
      // Verify the ID token with Firebase Admin SDK
      const validToken = await admin.auth().verifyIdToken(idToken);
      console.log("Verified token:", validToken);

      if (!validToken) {
        console.log("Invalid token");
        return response.status(401).send("Unauthorized");
      }

      // Generate the app check token
      const appCheckToken = await admin
        .appCheck()
        .createToken("1:165003650822:web:88a7fa08ae63985891a087");

      // Return the app check token
      response.json({ token: appCheckToken.token });
    } catch (err) {
      console.error("Error verifying token:", err);
      response.status(401).send("Unauthorized");
    }
  });
});

exports.sendVerificationEmail = onRequest(
  { secrets: [MJ_API_KEY, MJ_SECRET] },
  (request, response) => {
    cors(request, response, async () => {
      try {
        const appCheckToken = request.header("X-Firebase-AppCheck");
        const { email } = request.body;

        await admin.appCheck().verifyToken(appCheckToken);

        const user = await admin.auth().getUserByEmail(email);

        console.log("User:", user);

        if (!user) {
          return response.status(400).send("User not found");
        }
        if (user.emailVerified) {
          return response.status(400).send("Email already verified");
        }
        if (user.disabled) {
          return response.status(400).send("User is disabled");
        }

        let link;
        try {
          link = await admin.auth().generateEmailVerificationLink(email, {
            url: "https://app.eventfulapp.com/verify-email",
          });
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
  },
);

exports.forgotPassword = onRequest(
  {
    secrets: [RECAPTCHA_SECRET, MJ_API_KEY, MJ_SECRET],
    cors: [/eventfulapp\.com$/],
  },
  async (request, response) => {
    if (request.method !== "POST") {
      return response.status(405).send("Method Not Allowed");
    }
    // Handle preflight requests
    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    // Only allow POST requests
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const { email, recaptchaToken } = request.body;

      if (!email || !recaptchaToken) {
        response.status(400).send("Missing required fields");
        return;
      }

      // Verify reCAPTCHA
      const secretKey = RECAPTCHA_SECRET.value();
      const recaptchaResponse = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${secretKey}&response=${recaptchaToken}`,
        },
      ).then((response) => response.json());

      if (!recaptchaResponse.success || recaptchaResponse.score < 0.5) {
        response.status(403).send("reCAPTCHA validation failed");
        return;
      }

      const user = await admin.auth().getUserByEmail(email);

      if (user) {
        const link = await admin.auth().generatePasswordResetLink(email, {
          url: "https://app.eventfulapp.com/",
        });

        await sendForgotPasswordEmailMailJet(
          MJ_API_KEY,
          MJ_SECRET,
          email,
          link,
        );
      }

      response
        .status(200)
        .send(
          "If your email is registered, you will receive a password reset link.",
        );
    } catch (error) {
      console.error("Error in forgotPassword:", error);
      response.status(500).send("Internal Server Error");
    }
  },
);

exports.incrementUserCount = onRequest((request, response) => {
  cors(request, response, async () => {
    const appCheckToken = request.header("X-Firebase-AppCheck");

    if (!appCheckToken) {
      return response.status(400).send("Missing app token");
    }

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
        const userCount = docSnap.data().userCount || 0;
        await docRef.update({ userCount: userCount + 1 });
      } else {
        await docRef.set({ userCount: 1 }, { merge: true });
      }

      response.status(200).send("User count incremented");
    } catch (error) {
      console.error("Error incrementing user count:", error);
      response.status(500).send("Error incrementing user count");
    }
  });
});

exports.incrementEventCount = onRequest((request, response) => {
  cors(request, response, async () => {
    const appCheckToken = request.header("X-Firebase-AppCheck");

    if (!appCheckToken) {
      return response.status(400).send("Missing app token");
    }

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
        const eventCount = docSnap.data().eventCount || 0;
        await docRef.update({ eventCount: eventCount + 1 });
      } else {
        await docRef.set({ eventCount: 1 }, { merge: true });
      }

      response.status(200).send("Event count incremented");
    } catch (error) {
      console.error("Error incrementing event count:", error);
      response.status(500).send("Error incrementing event count");
    }
  });
});

exports.searchUsers = onRequest(
  {
    secrets: [ALGOLIA_APP_ID, ALGOLIA_API_KEY],
    cors: [/eventfulapp\.com$/],
    minInstances: 1,
  },
  createAlgoliaUserSearchHandler({ admin, ALGOLIA_APP_ID, ALGOLIA_API_KEY }),
);

exports.syncFollowers = onDocumentWritten(
  {
    document: "following/{userA}/following/{userB}",
    region: "europe-west2",
  },
  async (event) => {
    const { userA, userB } = event.params;
    const newData = event.data.after.data();

    if (!newData) return;

    const followerDocRef = db
      .collection("followers")
      .doc(userB)
      .collection("followers")
      .doc(userA);

    const now = admin.firestore.Timestamp.now();

    let shouldSendNotification = true;
    let shouldDeleteNotification = false;
    if (newData.status === "inactive") {
      shouldSendNotification = false;
      shouldDeleteNotification = true;
    }

    try {
      const existingDoc = await followerDocRef.get();
      if (existingDoc.exist) {
        const existingData = existingDoc.data();
        const previousFollowedAt = existingData?.followedAt;
        if (previousFollowedAt && previousFollowedAt.toMillis) {
          const tenMinutes = 10 * 60 * 1000;
          const timeSinceLastFollow =
            now.toMillis() - previousFollowedAt.toMillis();
          if (timeSinceLastFollow < tenMinutes) {
            shouldSendNotification = false;
            console.warn("Not sending notification: followed recently");
          }
        }
      }
    } catch (err) {
      console.error("Error checking previous follow time:", err);
    }

    const update = {
      status: newData.status,
      followedAt: newData.followedAt,
      unfollowedAt: newData.unfollowedAt || null,
    };
    await followerDocRef.set(update, { merge: true });

    // Send notification only for active status and if it's been more than 10 minutes
    if (shouldSendNotification && newData.status === "active") {
      try {
        const followedUserInfo = await getUserInfo(admin, userA);
        const notification = {
          type: "follow",
          title: `${followedUserInfo.name}`,
          body: `(${followedUserInfo.username}) started following you.`,
          timestamp: now,
          userId: userB,
          senderId: userA,
          read: false,
        };
        await db.collection("notifications").add(notification);
        console.log("Notification sent.");
      } catch (err) {
        console.error("Error sending notification:", err);
      }
    }

    if (shouldDeleteNotification) {
      try {
        const notificationDocRef = db.collection("notifications");
        const query = notificationDocRef
          .where("type", "==", "follow")
          .where("userId", "==", userB)
          .where("senderId", "==", userA);
        const snapshot = await query.get();

        if (!snapshot.empty) {
          await Promise.all(
            snapshot.docs.map(async (doc) => {
              await doc.ref.delete();
              console.log("Successfully deleted follow notification");
            }),
          );
        }
      } catch (err) {
        console.error("Error deleting notification:", err);
      }
    }
  },
);

exports.deleteOldPhotos = onSchedule("every 24 hours", async (event) => {
  const now = admin.firestore.Timestamp.now();

  // 30 days ago
  const cutoff = new Date(now.toDate().getTime() - 30 * 24 * 60 * 60 * 1000);

  const snapshot = await db
    .collection("photoBoothPhotos")
    .where("createdAt", "<", cutoff)
    .get();

  const deletions = snapshot.docs.map(async (doc) => {
    const data = doc.data();
    const filePath = getStoragePathFromUrl(data.url);
    if (filePath) {
      try {
        await storage.bucket().file(filePath).delete();
      } catch (err) {
        console.error("Failed to delete storage file", err);
      }
    }
    await doc.ref.delete();
  });

  await Promise.all(deletions);
  console.log(`Deleted ${deletions.length} old photos`);
});

exports.sendFeedbackEmail = onDocumentWritten(
  {
    document: "feedback/{feedbackId}",
    region: "europe-west2",
    secrets: [MJ_API_KEY, MJ_SECRET],
  },
  async (event) => {
    const { feedbackId } = event.params;
    const newData = event.data.after.data();
    const oldData = event.data.before.data();

    // Only send email for new documents (not updates)
    if (!oldData && newData) {
      try {
        const timestamp = newData.timestamp || admin.firestore.Timestamp.now();
        const timestampString = timestamp.toDate().toISOString();
        const feedbackData = {
          message: newData.message || "",
          email: newData.email || "",
          type: newData.type || "general",
          username: newData.username || "Anonymous",
          timestamp: timestampString,
        };

        await sendFeedbackEmailMailJet(MJ_API_KEY, MJ_SECRET, feedbackData);
        console.log(`Feedback email sent for document: ${feedbackId}`);
      } catch (error) {
        console.error("Error sending feedback email:", error);
      }
    }
  },
);
