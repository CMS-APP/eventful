import {
  FirebaseFirestoreTypes,
  collection,
  onSnapshot,
  query,
  where
} from "@react-native-firebase/firestore";

import { API_COLLECTIONS } from "@/services/api/constants";
import { createDocument } from "@/services/api/create";
import { deleteDocument } from "@/services/api/delete";
import { getDocumentsByQuery } from "@/services/api/get";
import { updateDocument } from "@/services/api/update";
import { Notification } from "@/types/Notification";
import { safeListener } from "@/utils/errorHandling";

import { FIRESTORE_DB } from "./firebase";

export function listenToFollowNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
) {
  return safeListener(() => {
    const notificationCollection = collection(FIRESTORE_DB, "notifications");

    const notificationQuery = query(
      notificationCollection,
      where("userId", "==", userId),
      where("type", "==", "follow")
    );

    return onSnapshot(
      notificationQuery,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const notifications = snapshot?.docs?.map(
          (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data()
          })
        ) as Notification[];

        notifications?.sort(
          (a, b) =>
            b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime()
        );
        callback(notifications);
      }
    );
  }, "FirebaseNotification: Error listening to follow notifications");
}

export function listenToUpdateNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
) {
  return safeListener(() => {
    const notificationCollection = collection(FIRESTORE_DB, "notifications");

    const notificationQuery = query(
      notificationCollection,
      where("userId", "==", userId),
      where("type", "==", "update")
    );

    return onSnapshot(
      notificationQuery,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const notifications = snapshot?.docs?.map(
          (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
            id: doc?.id,
            ...doc?.data()
          })
        ) as Notification[];

        notifications?.sort(
          (a, b) =>
            b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime()
        );
        callback(notifications ?? []);
      }
    );
  }, "FirebaseNotification: Error listening to update notifications");
}

async function getExistingNotification(
  senderId: string,
  userId: string,
  subType: string,
  eventId: string
): Promise<Notification | null> {
  const notifications = await getDocumentsByQuery(
    [
      where("senderId", "==", senderId),
      where("userId", "==", userId),
      where("subType", "==", subType),
      where("eventId", "==", eventId)
    ],
    API_COLLECTIONS.NOTIFICATIONS
  );
  return notifications.length > 0 ? (notifications[0] as Notification) : null;
}

export async function createUpdateNotification(
  senderId: string,
  userId: string,
  eventId: string,
  title: string,
  subTitle: string,
  subType: string
): Promise<void> {
  const data = {
    senderId: senderId,
    eventId: eventId,
    userId: userId,
    title: title,
    body: subTitle,
    type: "update",
    subType: subType,
    timestamp: new Date(),
    read: false
  };

  const existingNotification = await getExistingNotification(
    senderId,
    userId,
    subType,
    eventId
  );

  if (existingNotification) {
    await updateDocument(
      data,
      API_COLLECTIONS.NOTIFICATIONS,
      existingNotification.id
    );
  } else {
    await createDocument(data, API_COLLECTIONS.NOTIFICATIONS);
  }
}

export async function deleteUpdateNotification(
  senderId: string,
  userId: string,
  eventId: string
): Promise<void> {
  const notifications = await getDocumentsByQuery(
    [
      where("senderId", "==", senderId),
      where("userId", "==", userId),
      where("eventId", "==", eventId)
    ],
    API_COLLECTIONS.NOTIFICATIONS
  );
  if (notifications.length > 0) {
    await deleteDocument(API_COLLECTIONS.NOTIFICATIONS, notifications[0]?.id);
  }
}
