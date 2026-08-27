const {
  sendFeedbackConfirmationEmailMailJet,
  sendFeedbackEmailMailJet
} = require("../services/email");
const { getUserInfo } = require("../services/user");

function createSyncFollowersHandler({ admin, db }) {
  return async (event) => {
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
      unfollowedAt: newData.unfollowedAt || null
    };
    await followerDocRef.set(update, { merge: true });

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
          read: false
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
            })
          );
        }
      } catch (err) {
        console.error("Error deleting notification:", err);
      }
    }
  };
}

function createSendFeedbackEmailHandler({ admin, MJ_API_KEY, MJ_SECRET }) {
  return async (event) => {
    const { feedbackId } = event.params;
    const newData = event.data.after.data();
    const oldData = event.data.before.data();

    if (!oldData && newData) {
      try {
        const timestamp = newData.timestamp || admin.firestore.Timestamp.now();
        const timestampString = timestamp.toDate().toISOString();

        let name = "";
        if (newData.userId) {
          const user = await getUserInfo(admin, newData.userId);
          name = user?.name || "";
        }

        const feedbackData = {
          message: newData.message || "",
          email: newData.email || "",
          name,
          type: newData.type || "general",
          username: newData.username || "Anonymous",
          timestamp: timestampString
        };

        await sendFeedbackEmailMailJet(MJ_API_KEY, MJ_SECRET, feedbackData);
        await sendFeedbackConfirmationEmailMailJet(
          MJ_API_KEY,
          MJ_SECRET,
          feedbackData
        );
        console.log(`Feedback emails sent for document: ${feedbackId}`);
      } catch (error) {
        console.error("Error sending feedback email:", error);
      }
    }
  };
}

module.exports = {
  createSyncFollowersHandler,
  createSendFeedbackEmailHandler
};
