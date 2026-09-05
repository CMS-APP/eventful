import { useCallback, useEffect } from "react";

import { StackActions } from "@react-navigation/native";

import * as Notifications from "expo-notifications";
import { NotificationResponse } from "expo-notifications";

import { buildNestedResetState, navigationRef } from "@/app/navigation";
import { getEventInfo } from "@/services/firebase/event";
import { getInviteInfo } from "@/services/firebase/invite";
import { getUserInfo } from "@/services/firebase/user";
import { log } from "@/utils/logging";

export async function handleEventEditNavigation(params: any) {
  const event = await getEventInfo(params.event);

  if (!event || !navigationRef) return;

  const currentRoot = navigationRef.getRootState();
  const alreadyOnMain = currentRoot?.routes[currentRoot.index]?.name === "Main";

  if (!alreadyOnMain) {
    navigationRef.reset({ index: 0, routes: [{ name: "Main" }] });
  }

  const mainRoute = navigationRef
    .getRootState()
    ?.routes.find((route) => route.name === "Main");
  const eventsRoute = (mainRoute?.state as any)?.routes?.find(
    (route: any) => route.name === "Events"
  );
  const eventsKey = eventsRoute?.state?.key;

  if (eventsKey && eventsRoute.state.routes.length > 1) {
    navigationRef.dispatch({ ...StackActions.popToTop(), target: eventsKey });
  }

  navigationRef.navigate("Main", {
    screen: "Events",
    params: { screen: "EventEdit", params: { event } }
  });
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

export async function handleEventInviteNavigation(params: any) {
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
