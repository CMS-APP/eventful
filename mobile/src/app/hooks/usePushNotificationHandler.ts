import { useCallback, useEffect } from "react";

import { createNavigationContainerRef } from "@react-navigation/native";

import * as Notifications from "expo-notifications";
import { NotificationResponse } from "expo-notifications";

import { AppStackParamList } from "@/app/navigation";
import { getEventInfo } from "@/services/firebase/firebaseEventFunctions";
import { getInviteInfo } from "@/services/firebase/firebaseInviteFunctions";
import { getUserInfo } from "@/services/firebase/firebaseUserFunctions";
import { log } from "@/utils/logging";

export const navigationRef = createNavigationContainerRef<AppStackParamList>();

async function handleEventEditNavigation(params: any) {
  const event = await getEventInfo(params.event);

  if (event) {
    resetStack("Events");

    setTimeout(() => {
      navigationRef?.navigate("Main", {
        screen: "Events",
        params: { screen: "EventEdit", params: { event } }
      });
    }, 100);
  }
}

async function handleContactViewNavigation(params: any) {
  log("Handling contact view navigation", "info");
  const user = await getUserInfo(params.user);
  const type = params.type;

  if (user) {
    resetStack("Contacts");

    setTimeout(() => {
      navigationRef?.navigate("Main", {
        screen: "Contacts",
        params: { screen: "ContactView", params: { user, type } }
      });
    }, 100);
  }
}

async function handleEventInviteNavigation(params: any) {
  log("Handling event invite navigation", "info");
  const event = await getEventInfo(params.event);
  const invite = await getInviteInfo(params.invite);
  const host = await getUserInfo(params.host);

  if (event && invite && host) {
    resetStack("Events");

    setTimeout(() => {
      navigationRef?.navigate("Main", {
        screen: "Events",
        params: { screen: "EventInvite", params: { event, invite, host } }
      });
    }, 100);
  }
}

function resetStack(name: string) {
  navigationRef?.reset({
    index: 0,
    routes: [{ name }]
  });
}

export async function navigateToScreenFromNotification(response: any) {
  const { screen, params } = response.notification.request.content.data;
  if (!params || !screen || !navigationRef || !navigationRef.isReady()) {
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
