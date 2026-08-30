import { useCallback, useEffect } from "react";

import * as Notifications from "expo-notifications";
import { NotificationResponse } from "expo-notifications";

import { buildNestedResetState, navigationRef } from "@/app/navigation";
import { getEventInfo } from "@/services/firebase/event";
import { getInviteInfo } from "@/services/firebase/invite";
import { getUserInfo } from "@/services/firebase/user";
import { log } from "@/utils/logging";

async function handleEventEditNavigation(params: any) {
  const event = await getEventInfo(params.event);

  if (event) {
    navigationRef?.reset(
      buildNestedResetState([
        { name: "Main" },
        { name: "Events", fallback: "EventsList" },
        { name: "EventEdit", params: { event } }
      ])
    );
  }
}

async function handleContactViewNavigation(params: any) {
  const user = await getUserInfo(params.user);

  if (user) {
    navigationRef?.reset(
      buildNestedResetState([
        { name: "Main" },
        { name: "Contacts", fallback: "ContactsHome" },
        { name: "Profile" },
        { name: "ProfileView", params: { user } }
      ])
    );
  }
}

async function handleEventInviteNavigation(params: any) {
  const event = await getEventInfo(params.event);
  const invite = await getInviteInfo(params.invite?.invite);
  const host = await getUserInfo(params.host);

  if (event && invite && host) {
    navigationRef?.reset(
      buildNestedResetState(
        [{ name: "EventInvite", params: { invite, event, host } }],
        { background: "Main" }
      )
    );
  }
}

export async function navigateToScreenFromNotification(response: any) {
  const { screen, params } = response.notification.request.content.data;
  if (!params || !screen || !navigationRef || !navigationRef.isReady()) {
    log("Notification navigation failed", "warn");
    return;
  }

  if (screen === "EventEdit") {
    await handleEventEditNavigation(params);
  } else if (screen === "ContactView") {
    await handleContactViewNavigation(params);
  } else if (screen === "EventInvite") {
    await handleEventInviteNavigation(params);
  }
}

export function usePushNotificationHandler() {
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
