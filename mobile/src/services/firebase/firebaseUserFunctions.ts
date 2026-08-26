import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import {
  Timestamp,
  doc,
  updateDoc,
  where
} from "@react-native-firebase/firestore";

import {
  API_COLLECTIONS,
  API_FOLLOWERS_COLLECTIONS,
  API_FOLLOWING_COLLECTIONS
} from "@/services/api/constants";
import { createDocument } from "@/services/api/create";
import { deleteDocument } from "@/services/api/delete";
import {
  getDocument,
  getDocuments,
  getDocumentsByQuery
} from "@/services/api/get";
import { setDocument, updateDocument } from "@/services/api/update";
import { removeData } from "@/services/async";
import { Event } from "@/types/Event";
import { EventLinkResponse } from "@/types/EventLinkResponse";
import { Follower } from "@/types/Follower";
import { Invite } from "@/types/Invite";
import { Notification } from "@/types/Notification";
import { PB_CONFIG, PhotoBoothConfig } from "@/types/PhotoBoothConfig";
import { PollVote } from "@/types/PollVote";
import { User } from "@/types/User";
import { AppError } from "@/utils/error";
import { log } from "@/utils/logging";
import { sendFollowNotification } from "@/utils/notifications";

import { FIRESTORE_DB } from "./firebase";

export function convertTimestampsToMillis(user: User) {
  try {
    if (user.usernameCreateDate instanceof Timestamp) {
      user.usernameCreateDate = user.usernameCreateDate.toMillis();
    }
    if (user.usernameUpdateDate instanceof Timestamp) {
      user.usernameUpdateDate = user.usernameUpdateDate.toMillis();
    }
    return user;
  } catch (error) {
    new AppError(error, "Error converting timestamps to millis");
    return user;
  }
}

export async function getUserInfo(userId: string): Promise<User | null> {
  log("Getting user info", "info");
  const userData = await getDocument(API_COLLECTIONS.USER, userId);

  if (userData) {
    return convertTimestampsToMillis(userData as User);
  } else {
    return null;
  }
}

export async function createUserInfo(userId: string, data: User) {
  try {
    await setDocument(data, API_COLLECTIONS.USER, userId);
  } catch (error) {
    throw new AppError(error, "Error creating user details");
  }
}

export type UserUpdateData = {
  [K in keyof User]?: User[K] | FirebaseFirestoreTypes.FieldValue;
};

export async function updateUserInfo(userId: string, data: UserUpdateData) {
  try {
    const docRef = doc(FIRESTORE_DB, "user", userId);
    await updateDoc(docRef, data);
  } catch (error) {
    throw new AppError(error, "Error updating user details");
  }
}

async function deleteUserEvents(userId: string) {
  try {
    const events = (await getDocumentsByQuery(
      [where("userId", "==", userId)],
      API_COLLECTIONS.EVENT
    )) as Event[];

    const eventsDeletePromises = events.map((event: Event) =>
      deleteDocument(API_COLLECTIONS.EVENT, event.id)
    );
    await Promise.all(eventsDeletePromises);
  } catch (error) {
    new AppError(error, "Error deleting user events");
  }
}

async function deleteUserInvites(userId: string) {
  try {
    const recipientInvites = (await getDocumentsByQuery(
      [where("recipient", "==", userId)],
      API_COLLECTIONS.INVITE
    )) as Invite[];
    const senderInvites = (await getDocumentsByQuery(
      [where("sender", "==", userId)],
      API_COLLECTIONS.INVITE
    )) as Invite[];

    const deletePromise = [
      recipientInvites.map((invite) =>
        deleteDocument(API_COLLECTIONS.INVITE, invite.id)
      ),
      senderInvites.map((invite) =>
        deleteDocument(API_COLLECTIONS.INVITE, invite.id)
      )
    ];
    await Promise.all(deletePromise);
  } catch (error) {
    new AppError(error, "Error deleting user invites");
  }
}

async function deleteUserFollowing(userId: string) {
  try {
    const followingDocs = await getDocuments(
      API_COLLECTIONS.FOLLOWING,
      userId,
      API_FOLLOWING_COLLECTIONS.FOLLOWING
    );

    const followingDeletePromises = followingDocs.map((doc: any) =>
      deleteDocument(
        API_COLLECTIONS.FOLLOWING,
        userId,
        API_FOLLOWING_COLLECTIONS.FOLLOWING,
        doc.id
      )
    );

    await Promise.all(followingDeletePromises);
  } catch (error) {
    throw new AppError(error, "Error deleting user following");
  }
}

async function deleteUserFollowers(userId: string) {
  try {
    const followersDocs = await getDocuments(
      API_COLLECTIONS.FOLLOWERS,
      userId,
      API_FOLLOWERS_COLLECTIONS.FOLLOWERS
    );

    const followersDeletePromises = followersDocs.map((doc: any) =>
      deleteDocument(
        API_COLLECTIONS.FOLLOWERS,
        userId,
        API_FOLLOWERS_COLLECTIONS.FOLLOWERS,
        doc.id
      )
    );

    await Promise.all(followersDeletePromises);
  } catch (error) {
    throw new AppError(error, "Error deleting user followers");
  }
}

async function deleteUserNotifications(userId: string) {
  try {
    const userNotifications = (await getDocumentsByQuery(
      [where("userId", "==", userId)],
      API_COLLECTIONS.NOTIFICATIONS
    )) as Notification[];
    const senderNotifications = (await getDocumentsByQuery(
      [where("senderId", "==", userId)],
      API_COLLECTIONS.NOTIFICATIONS
    )) as Notification[];

    const deletePromises = [
      ...userNotifications.map((notification) =>
        deleteDocument(API_COLLECTIONS.NOTIFICATIONS, notification.id)
      ),
      ...senderNotifications.map((notification) =>
        deleteDocument(API_COLLECTIONS.NOTIFICATIONS, notification.id)
      )
    ];
    await Promise.all(deletePromises);
  } catch (error) {
    throw new AppError(error, "Error deleting user notifications");
  }
}

async function deleteUserPollVotes(userId: string) {
  try {
    const pollVotes = (await getDocumentsByQuery(
      [where("userId", "==", userId)],
      API_COLLECTIONS.POLL_VOTE
    )) as PollVote[];

    const deletePromises = pollVotes.map((pollVote) =>
      deleteDocument(API_COLLECTIONS.POLL_VOTE, pollVote.voteId)
    );

    await Promise.all(deletePromises);
  } catch (error) {
    new AppError(error, "Error deleting user poll votes");
  }
}

async function deleteUserPhotoBoothConfig(userId: string) {
  try {
    await deleteDocument(API_COLLECTIONS.PHOTO_BOOTH_CONFIG, userId);
  } catch (error) {
    new AppError(error, "Error deleting user photo booth config");
  }
}

export async function deleteUserData(userId: string): Promise<void> {
  try {
    await Promise.all([
      deleteUserEvents(userId),
      deleteUserInvites(userId),
      deleteUserFollowing(userId),
      deleteUserFollowers(userId),
      deleteUserNotifications(userId),
      deleteUserPollVotes(userId),
      deleteUserPhotoBoothConfig(userId)
    ]);

    await removeData("spotifyData");
    await deleteDocument(API_COLLECTIONS.USER, userId);
  } catch (error) {
    new AppError(error, "Error deleting user data");
  }
}

export async function checkUsernameExists(username: string) {
  const usernameExists = await getDocumentsByQuery(
    [where("username", "==", username.trim().toLowerCase())],
    API_COLLECTIONS.USER
  );
  return usernameExists.length > 0;
}

export async function getPushTokensFromDatabase(userId: string) {
  const user = await getDocument(API_COLLECTIONS.USER, userId);
  return user?.pushTokens || [];
}

export async function sendFeedbackToDatabase(
  user: User,
  type: string,
  message: string
) {
  try {
    const feedback = {
      userId: user.uid,
      username: user.username,
      email: user.email,
      type,
      message,
      timestamp: new Date()
    };

    await createDocument(feedback, API_COLLECTIONS.FEEDBACK);
  } catch (error) {
    throw new AppError(error, "Error sending feedback");
  }
}

export async function changeHostname(
  userId: string,
  firstName: string,
  lastName: string
) {
  try {
    const eventLinks = (await getDocumentsByQuery(
      [where("userId", "==", userId)],
      API_COLLECTIONS.EVENT_LINKS
    )) as EventLinkResponse[];

    const eventLinksUpdatePromises = eventLinks.map((eventLink) =>
      updateDocument(
        { hostName: firstName + " " + lastName },
        API_COLLECTIONS.EVENT_LINKS,
        eventLink.id
      )
    );

    await Promise.all(eventLinksUpdatePromises);
  } catch (error) {
    throw new AppError(error, "Error changing hostname");
  }
}

export async function followUser(
  userId: string,
  followUserId: string,
  notification = true
) {
  try {
    const following = await getDocument(
      API_COLLECTIONS.FOLLOWING,
      userId,
      API_FOLLOWING_COLLECTIONS.FOLLOWING,
      followUserId
    );

    if (following?.status === "active") {
      // User is already following this user
      return;
    }

    await setDocument(
      { status: "active", followedAt: Timestamp.now() },
      API_COLLECTIONS.FOLLOWING,
      userId,
      API_FOLLOWING_COLLECTIONS.FOLLOWING,
      followUserId
    );

    if (notification) {
      const sender = await getUserInfo(userId);
      const recipient = await getUserInfo(followUserId);
      if (recipient && sender) {
        await sendFollowNotification(recipient, sender);
      }
    }
  } catch (error) {
    throw new AppError(error, "Error following user");
  }
}

export async function isFollowingUser(userId: string, followUserId: string) {
  const following = await getDocument(
    API_COLLECTIONS.FOLLOWING,
    userId,
    API_FOLLOWING_COLLECTIONS.FOLLOWING,
    followUserId
  );
  return following?.status === "active";
}

export async function unFollowUser(userId: string, followUserId: string) {
  try {
    const following = await getDocument(
      API_COLLECTIONS.FOLLOWING,
      userId,
      API_FOLLOWING_COLLECTIONS.FOLLOWING,
      followUserId
    );

    if (following && following.status === "inactive") {
      return;
    }

    await updateDocument(
      { status: "inactive", unfollowedAt: Timestamp.now() },
      API_COLLECTIONS.FOLLOWING,
      userId,
      API_FOLLOWING_COLLECTIONS.FOLLOWING,
      followUserId
    );

    await removeUserFromAllInvites(userId, followUserId);
  } catch (error) {
    throw new AppError(error, "Error unfollowing user");
  }
}

async function removeUserFromAllInvites(senderId: string, userId: string) {
  try {
    const invites = (await getDocumentsByQuery(
      [where("sender", "==", senderId), where("recipient", "==", userId)],
      API_COLLECTIONS.INVITE
    )) as Invite[];
    const deletePromises = invites.map((invite) =>
      deleteDocument(API_COLLECTIONS.INVITE, invite.id)
    );
    await Promise.all(deletePromises);
  } catch (error) {
    new AppError(error, "Error removing user from all invites");
  }
}

export async function getUserFollowers(userId: string) {
  try {
    const followersDocs = await getDocuments(
      API_COLLECTIONS.FOLLOWERS,
      userId,
      API_FOLLOWERS_COLLECTIONS.FOLLOWERS
    );

    const followers: Follower[] = followersDocs.map((doc: any) => ({
      followerId: doc.id,
      followingId: userId,
      status: doc.status,
      followedAt: doc.followedAt,
      unfollowedAt: doc.unfollowedAt
    }));

    return followers.filter((follower) => follower.status === "active");
  } catch (error) {
    throw new AppError(error, "Error getting user followers");
  }
}

export async function getUserFollowing(userId: string) {
  try {
    const followingDocs = await getDocuments(
      API_COLLECTIONS.FOLLOWING,
      userId,
      API_FOLLOWING_COLLECTIONS.FOLLOWING
    );

    const following: Follower[] = followingDocs.map((doc: any) => ({
      followerId: userId,
      followingId: doc.id,
      status: doc.status,
      followedAt: doc.followedAt,
      unfollowedAt: doc.unfollowedAt
    }));

    return following.filter((follower) => follower.status === "active");
  } catch (error) {
    throw new AppError(error, "Error getting user following");
  }
}

export async function readFollowNotification(notificationId: string) {
  try {
    await updateDocument(
      { read: true },
      API_COLLECTIONS.NOTIFICATIONS,
      notificationId
    );
  } catch (error) {
    new AppError(error, "Error reading follow notification");
  }
}

export async function readUpdateNotification(notificationId: string) {
  try {
    await updateDocument(
      { read: true },
      API_COLLECTIONS.NOTIFICATIONS,
      notificationId
    );
  } catch (error) {
    new AppError(error, "Error reading update notification");
  }
}

async function deleteOrphanedFollowing(userId: string) {
  try {
    const followingDocs = await getDocuments(
      API_COLLECTIONS.FOLLOWING,
      userId,
      API_FOLLOWING_COLLECTIONS.FOLLOWING
    );

    for (const doc of followingDocs) {
      if (!doc?.id) continue;
      const userDoc = await getDocument(API_COLLECTIONS.USER, doc.id);
      if (!userDoc) {
        await deleteDocument(
          API_COLLECTIONS.FOLLOWING,
          userId,
          API_FOLLOWING_COLLECTIONS.FOLLOWING,
          doc.id
        );
      }
    }
  } catch (error) {
    throw new AppError(error, "Error cleaning up orphaned following data");
  }
}

async function deleteOrphanedFollowers(userId: string) {
  try {
    const followersDocs = await getDocuments(
      API_COLLECTIONS.FOLLOWERS,
      userId,
      API_FOLLOWERS_COLLECTIONS.FOLLOWERS
    );
    for (const doc of followersDocs) {
      if (!doc?.id) continue;
      const userDoc = await getDocument(API_COLLECTIONS.USER, doc.id);
      if (!userDoc) {
        await deleteDocument(
          API_COLLECTIONS.FOLLOWERS,
          userId,
          API_FOLLOWERS_COLLECTIONS.FOLLOWERS,
          doc.id
        );
      }
    }
  } catch (error) {
    throw new AppError(error, "Error cleaning up orphaned followers data");
  }
}

async function deleteOrphanedNotifications(userId: string) {
  try {
    const [userNotifications, senderNotifications] = await Promise.all([
      getDocumentsByQuery(
        [where("userId", "==", userId)],
        API_COLLECTIONS.NOTIFICATIONS
      ),
      getDocumentsByQuery(
        [where("senderId", "==", userId)],
        API_COLLECTIONS.NOTIFICATIONS
      )
    ]);

    for (const notification of userNotifications) {
      const senderDoc = await getDocument(
        API_COLLECTIONS.USER,
        notification?.senderId || ""
      );

      if (!senderDoc) {
        await deleteDocument(
          API_COLLECTIONS.NOTIFICATIONS,
          notification?.id || ""
        );
      }
    }

    for (const notification of senderNotifications) {
      const recipientDoc = await getDocument(
        API_COLLECTIONS.USER,
        notification?.userId || ""
      );

      if (!recipientDoc) {
        await deleteDocument(
          API_COLLECTIONS.NOTIFICATIONS,
          notification?.id || ""
        );
      }
    }
  } catch (error) {
    throw new AppError(error, "Error cleaning up orphaned notifications");
  }
}

export async function cleanupOrphanedData(userId: string) {
  try {
    await Promise.all([
      deleteOrphanedFollowing(userId),
      deleteOrphanedFollowers(userId),
      deleteOrphanedNotifications(userId)
    ]);
  } catch (error) {
    new AppError(
      error,
      "FirebaseFunctions: Error during orphaned data cleanup"
    );
  }
}

export async function getPhotoBoothConfig(
  userId: string
): Promise<PhotoBoothConfig> {
  try {
    const configData = await getDocument(
      API_COLLECTIONS.PHOTO_BOOTH_CONFIG,
      userId
    );

    if (configData) {
      return configData as PhotoBoothConfig;
    } else {
      return PB_CONFIG as PhotoBoothConfig;
    }
  } catch (error) {
    new AppError(error, "Error fetching photo booth configuration");
    return PB_CONFIG as PhotoBoothConfig;
  }
}

export async function savePhotoBoothConfig(
  userId: string,
  config: PhotoBoothConfig
) {
  try {
    const configData = {
      title: config.title || "",
      subTitle: config.subTitle || "",
      frameColor: config.frameColor || "#FFFFFF",
      textColor: config.textColor || "#000000",
      customTitleFont: config.customTitleFont || "Poppins",
      customTitleFontSize: config.customTitleFontSize || 24,
      customSubTitleFont: config.customSubTitleFont || "Poppins",
      customSubTitleFontSize: config.customSubTitleFontSize || 24,
      autoSave: config.autoSave !== undefined ? config.autoSave : true,
      saveIndividualPhotos:
        config.saveIndividualPhotos !== undefined
          ? config.saveIndividualPhotos
          : false,
      removeWatermark:
        config.removeWatermark !== undefined ? config.removeWatermark : false,
      flipPhotosHorizontally:
        config.flipPhotosHorizontally !== undefined
          ? config.flipPhotosHorizontally
          : true,
      collageStyle: config.collageStyle || "square",
      canChangeCollage:
        config.canChangeCollage !== undefined ? config.canChangeCollage : false,
      canChangeFilter:
        config.canChangeFilter !== undefined ? config.canChangeFilter : false,
      flash: config.flash !== undefined ? config.flash : false,
      filter: config.filter || "Normal",
      timerDuration: config.timerDuration || 4,
      updatedAt: Timestamp.now()
    };

    await setDocument(configData, API_COLLECTIONS.PHOTO_BOOTH_CONFIG, userId);
  } catch (error) {
    throw new AppError(error, "Error saving photo booth configuration");
  }
}

export async function getUsersFromFollowing(
  following: Follower[],
  type: string
) {
  try {
    log("Getting users from following", "info");
    const users = await Promise.all(
      following.map(
        async (follower) =>
          await getUserInfo(
            type === "Followers"
              ? follower.followerId || ""
              : follower.followingId || ""
          )
      )
    );
    return users.filter((user: User | null) => user !== null);
  } catch (error) {
    new AppError(error, "Error getting users from following");
    return [];
  }
}
