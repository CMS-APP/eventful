import { useEffect, useState } from "react";

import { Platform } from "react-native";

import { setBadgeCountAsync } from "expo-notifications";

import { getInvitationsFromDatabaseSnapshot } from "@/services/firebase/listeners";
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

        setNotifications(
          (prev: {
            Home: number;
            Contacts: number;
            Calendar: number;
            Events: number;
          }) => {
            const updated = { ...prev, Contacts: maybeCount };
            const total = Object.values(updated).reduce(
              (a: number, b: number) => a + b,
              0
            );

            if (Platform.OS === "ios") {
              setBadgeCountAsync(total as number);
            }

            return updated;
          }
        );
      }
    );

    return () => unsubscribe?.();
  }, [userId]);

  return notifications;
}
