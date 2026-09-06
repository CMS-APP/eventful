import {
  FieldValue,
  Timestamp,
  doc,
  updateDoc,
  where
} from "@react-native-firebase/firestore";

import { FIRESTORE_DB } from "@/app/init/firebase";
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
import { removeData } from "@/services/local/async";
import {
  getExpoToken,
  sendFollowNotification
} from "@/services/pushNotifications";
import { Event } from "@/types/Event";
import { EventLinkResponse } from "@/types/EventLinkResponse";
import { Follower } from "@/types/Follower";
import { InAppNotification } from "@/types/InAppNotification";
import { Invite } from "@/types/Invite";
import { PB_CONFIG, PhotoBoothConfig } from "@/types/PhotoBoothConfig";
import { PollVote } from "@/types/PollVote";
import { PostLike } from "@/types/PostLike";
import { User } from "@/types/User";
import { log } from "@/utils/logging";

import { deleteUserImageAsnyc } from "./storage";

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
    log(`Error converting timestamps to millis: ${error}`, "error");
    return user;
  }
}

export async function getUserInfo(userId: string): Promise<User | null> {
  const userData = await getDocument(API_COLLECTIONS.USER, userId);

  if (userData) {
    return convertTimestampsToMillis(userData as User);
  } else {
    return null;
  }
}

export async function createUserInfo(userId: string, data: User) {
  await setDocument(data, API_COLLECTIONS.USER, userId);
}

export type UserUpdateData = {
  [K in keyof User]?: User[K] | FieldValue;
};

export async function updateUserInfo(userId: string, data: UserUpdateData) {
  const docRef = doc(FIRESTORE_DB, "user", userId);
  await updateDoc(docRef, data);
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
    log(`Error deleting user events: ${error}`, "error");
    throw error;
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
    log(`Error deleting user invites: ${error}`, "error");
    throw error;
  }
}

async function deleteUserFollowing(userId: string) {
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
}

async function deleteUserFollowers(userId: string) {
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
}

async function deleteUserNotifications(userId: string) {
  const userNotifications = (await getDocumentsByQuery(
    [where("userId", "==", userId)],
    API_COLLECTIONS.NOTIFICATIONS
  )) as InAppNotification[];
  const senderNotifications = (await getDocumentsByQuery(
    [where("senderId", "==", userId)],
    API_COLLECTIONS.NOTIFICATIONS
  )) as InAppNotification[];

  const deletePromises = [
    ...userNotifications.map((notification) =>
      deleteDocument(API_COLLECTIONS.NOTIFICATIONS, notification.id)
    ),
    ...senderNotifications.map((notification) =>
      deleteDocument(API_COLLECTIONS.NOTIFICATIONS, notification.id)
    )
  ];
  await Promise.all(deletePromises);
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
    log(`Error deleting user poll votes: ${error}`, "error");
    throw error;
  }
}

async function deleteUserPostLikes(userId: string) {
  try {
    const postLikes = (await getDocumentsByQuery(
      [where("userId", "==", userId)],
      API_COLLECTIONS.POST_LIKES
    )) as PostLike[];

    const deletePromises = postLikes.map((postLike) =>
      deleteDocument(API_COLLECTIONS.POST_LIKES, postLike.id)
    );

    await Promise.all(deletePromises);
  } catch (error) {
    log(`Error deleting user post likes: ${error}`, "error");
    throw error;
  }
}

async function deleteUserPhotoBoothConfig(userId: string) {
  try {
    await deleteDocument(API_COLLECTIONS.PHOTO_BOOTH_CONFIG, userId);
  } catch (error) {
    log(`Error deleting user photo booth config: ${error}`, "error");
    throw error;
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
      deleteUserPostLikes(userId),
      deleteUserPhotoBoothConfig(userId),
      deleteUserImageAsnyc(userId)
    ]);

    await removeData("spotifyData");
    await deleteDocument(API_COLLECTIONS.USER, userId);
  } catch (error) {
    log(`Error deleting user data: ${error}`, "error");
    throw error;
  }
}

export async function checkUsernameExists(username: string) {
  const usernameExists = await getDocumentsByQuery(
    [where("username", "==", username.trim().toLowerCase())],
    API_COLLECTIONS.USER
  );
  return usernameExists.length > 0;
}

export async function sendFeedbackToDatabase(
  user: User,
  type: string,
  message: string
) {
  const feedback = {
    userId: user.uid,
    username: user.username,
    email: user.email,
    type,
    message,
    timestamp: new Date()
  };

  await createDocument(feedback, API_COLLECTIONS.FEEDBACK);
}

export async function changeHostname(
  userId: string,
  firstName: string,
  lastName: string
) {
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
}

export async function followUser(
  userId: string,
  followUserId: string,
  notification = true
) {
  const following = await getDocument(
    API_COLLECTIONS.FOLLOWING,
    userId,
    API_FOLLOWING_COLLECTIONS.FOLLOWING,
    followUserId
  );

  if (following?.status === "active") {
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
    log(`Error removing user from all invites: ${error}`, "error");
  }
}

export async function getUserFollowers(userId: string) {
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
}

export async function getUserFollowing(userId: string) {
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
}

export async function getSuggestedFollows(
  userId: string,
  maxResults = 8
): Promise<User[]> {
  const following = await getUserFollowing(userId);
  const followingIds = new Set(
    following
      .map((follow) => follow.followingId)
      .filter((id): id is string => !!id)
  );

  const secondDegreeLists = await Promise.all(
    [...followingIds].map((id) => getUserFollowing(id))
  );

  const suggestionCounts = new Map<string, number>();

  for (const list of secondDegreeLists) {
    for (const follow of list) {
      const candidateId = follow.followingId;
      if (
        !candidateId ||
        candidateId === userId ||
        followingIds.has(candidateId)
      ) {
        continue;
      }
      suggestionCounts.set(
        candidateId,
        (suggestionCounts.get(candidateId) || 0) + 1
      );
    }
  }

  const topCandidateIds = [...suggestionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxResults)
    .map(([candidateId]) => candidateId);

  const users = await Promise.all(
    topCandidateIds.map((id) => getUserInfo(id))
  );

  return users.filter((user): user is User => user !== null);
}

export async function readFollowNotification(notificationId: string) {
  try {
    await updateDocument(
      { read: true },
      API_COLLECTIONS.NOTIFICATIONS,
      notificationId
    );
  } catch (error) {
    log(`Error reading follow notification: ${error}`, "error");
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
    log(`Error reading update notification: ${error}`, "error");
  }
}

async function deleteOrphanedFollowing(userId: string) {
  const followingDocs = await getDocuments(
    API_COLLECTIONS.FOLLOWING,
    userId,
    API_FOLLOWING_COLLECTIONS.FOLLOWING
  );

  for (const doc of followingDocs) {
    if (!doc?.id) continue;
    const userDoc = await getUserInfo(doc.id);
    if (!userDoc) {
      await deleteDocument(
        API_COLLECTIONS.FOLLOWING,
        userId,
        API_FOLLOWING_COLLECTIONS.FOLLOWING,
        doc.id
      );
    }
  }
}

async function deleteOrphanedFollowers(userId: string) {
  const followersDocs = await getDocuments(
    API_COLLECTIONS.FOLLOWERS,
    userId,
    API_FOLLOWERS_COLLECTIONS.FOLLOWERS
  );
  for (const doc of followersDocs) {
    if (!doc?.id) continue;
    const userDoc = await getUserInfo(doc.id);
    if (!userDoc) {
      await deleteDocument(
        API_COLLECTIONS.FOLLOWERS,
        userId,
        API_FOLLOWERS_COLLECTIONS.FOLLOWERS,
        doc.id
      );
    }
  }
}

async function deleteOrphanedNotifications(userId: string) {
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
    const senderDoc = await getUserInfo(notification?.senderId || "");

    if (!senderDoc) {
      await deleteDocument(
        API_COLLECTIONS.NOTIFICATIONS,
        notification?.id || ""
      );
    }
  }

  for (const notification of senderNotifications) {
    const recipientDoc = await getUserInfo(notification?.userId || "");

    if (!recipientDoc) {
      await deleteDocument(
        API_COLLECTIONS.NOTIFICATIONS,
        notification?.id || ""
      );
    }
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
    log(`Error cleaning up orphaned data: ${error}`, "error");
  }
}

export async function getPhotoBoothConfig(
  userId: string
): Promise<PhotoBoothConfig> {
  const configData = await getDocument(
    API_COLLECTIONS.PHOTO_BOOTH_CONFIG,
    userId
  );

  if (configData) {
    return configData as PhotoBoothConfig;
  } else {
    return PB_CONFIG as PhotoBoothConfig;
  }
}

export async function savePhotoBoothConfig(
  userId: string,
  config: PhotoBoothConfig
) {
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
    photoPromptsEnabled:
      config.photoPromptsEnabled !== undefined
        ? config.photoPromptsEnabled
        : false,
    updatedAt: Timestamp.now()
  };

  await setDocument(configData, API_COLLECTIONS.PHOTO_BOOTH_CONFIG, userId);
}

export async function getUsersFromFollowing(
  following: Follower[],
  type: string
) {
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
}

export async function isUserAdmin(userId: string) {
  const adminData = await getDocument(API_COLLECTIONS.ADMIN, "admin");
  return adminData?.uids?.includes(userId);
}

export async function removeExpoToken(userId: string) {
  log("Removing expo token from user", "debug");
  const user = await getUserInfo(userId);
  const pushTokens = user?.pushTokens;
  const expoToken = await getExpoToken();

  if (expoToken && pushTokens) {
    const newPushTokens = pushTokens.filter((token) => token !== expoToken);
    await updateUserInfo(userId, { pushTokens: newPushTokens });
  }
}
