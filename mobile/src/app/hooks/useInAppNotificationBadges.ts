import { useEffect, useState } from "react";

import { Platform } from "react-native";

import { setBadgeCountAsync } from "expo-notifications";

import { getInvitationsFromDatabaseSnapshot } from "@/services/firebase/listeners";
import {
  listenToFollowNotifications,
  listenToUpdateNotifications
} from "@/services/firebase/notifications";
import { InAppNotification } from "@/types/InAppNotification";
import { Invites } from "@/types/Invites";
import { isValidUserId } from "@/utils/userId";

export function useInAppNotificationBadges(userId: string | null | undefined) {
  const [notifications, setNotifications] = useState({
    Home: 0,
    Contacts: 0,
    Calendar: 0,
    Events: 0
  });

  useEffect(() => {
    if (!isValidUserId(userId)) return;

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
    if (!isValidUserId(userId)) return;

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
    if (!isValidUserId(userId) || Platform.OS !== "ios") return;

    const total =
      notifications.Home +
      notifications.Contacts +
      notifications.Calendar +
      notifications.Events;
    setBadgeCountAsync(total);
  }, [userId, notifications]);

  return notifications;
}
