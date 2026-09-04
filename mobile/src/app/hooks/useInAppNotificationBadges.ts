import { doc, onSnapshot } from "@react-native-firebase/firestore";

import { useEffect, useState } from "react";

import { Platform } from "react-native";

import { setBadgeCountAsync } from "expo-notifications";

import { FIRESTORE_DB } from "@/app/init/firebase";
import { getInvitationsFromDatabaseSnapshot } from "@/services/firebase/listeners";
import {
  listenToFollowNotifications,
  listenToUpdateNotifications
} from "@/services/firebase/notifications";
import { InAppNotification } from "@/types/InAppNotification";
import { Invites } from "@/types/Invites";

export function useInAppNotificationBadges(userId: string | null | undefined) {
  const [notifications, setNotifications] = useState({
    Home: 0,
    Contacts: 0,
    Calendar: 0,
    Events: 0
  });

  useEffect(() => {
    if (!userId || userId === "null") return;

    const unsubscribe = getInvitationsFromDatabaseSnapshot(
      userId,
      (invitations: Invites) => {
        const maybeCount = invitations?.noRespond?.length || 0;
        setNotifications((prev) => ({ ...prev, Contacts: maybeCount }));
      }
    );

    return () => unsubscribe?.();
  }, [userId]);

  useEffect(() => {
    if (!userId || userId === "null") return;

    let unreadFollows = 0;
    let unreadUpdates = 0;

    const updateHomeCount = () => {
      setNotifications((prev) => ({
        ...prev,
        Home: unreadFollows + unreadUpdates
      }));
    };

    const unsubscribeFollows = listenToFollowNotifications(
      userId,
      (notifications: InAppNotification[]) => {
        unreadFollows = notifications?.filter((n) => !n.read).length ?? 0;
        updateHomeCount();
      }
    );

    const unsubscribeUpdates = listenToUpdateNotifications(
      userId,
      (notifications: InAppNotification[]) => {
        unreadUpdates = notifications?.filter((n) => !n.read).length ?? 0;
        updateHomeCount();
      }
    );

    return () => {
      unsubscribeFollows?.();
      unsubscribeUpdates?.();
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || userId === "null" || Platform.OS !== "ios") return;

    const unsubscribe = onSnapshot(
      doc(FIRESTORE_DB, "user", userId),
      (snapshot) => {
        const count = snapshot.data()?.unreadNotificationCount ?? 0;
        setBadgeCountAsync(Math.max(0, count));
      }
    );

    return () => unsubscribe?.();
  }, [userId]);

  return notifications;
}
