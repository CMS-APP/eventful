import { useCallback, useEffect } from "react";

import * as Notifications from "expo-notifications";
import { NotificationResponse } from "expo-notifications";

import { navigateToScreenFromNotification } from "@/utils/navigation";

export function useNotificationHandler() {
  const handleNotificationResponse = useCallback(
    (response: NotificationResponse) => {
      navigateToScreenFromNotification(response);
    },
    []
  );

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => subscription.remove();
  }, [handleNotificationResponse]);
}
