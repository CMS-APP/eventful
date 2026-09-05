import { useEffect } from "react";

import * as Linking from "expo-linking";

import {
  handleEventEditNavigation,
  handleEventInviteNavigation
} from "@/app/hooks/usePushNotificationHandler";
import {
  isBootPending,
  isBootReadyOnMain,
  setPendingDeepLink
} from "@/app/init/pendingDeepLink";
import { log } from "@/utils/logging";

async function navigateToWidgetTarget(queryParams: Linking.QueryParams) {
  const eventId = String(queryParams.eventId);

  if (queryParams.type === "guest" && queryParams.inviteId) {
    await handleEventInviteNavigation({
      event: { id: eventId },
      invite: { invite: { id: String(queryParams.inviteId) } },
      host: String(queryParams.hostId ?? "")
    });
  } else {
    await handleEventEditNavigation({ event: { id: eventId } });
  }
}

async function handleWidgetUrl(url: string) {
  const { queryParams } = Linking.parse(url);
  if (queryParams?.source !== "widget" || !queryParams?.eventId) return;

  if (isBootReadyOnMain()) {
    await navigateToWidgetTarget(queryParams);
  } else if (isBootPending()) {
    setPendingDeepLink(() => navigateToWidgetTarget(queryParams));
  } else {
    log("Widget navigation discarded: app did not boot to Main", "warn");
  }
}

export function useWidgetLinkHandler() {
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) handleWidgetUrl(url);
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleWidgetUrl(url);
    });

    return () => subscription.remove();
  }, []);
}
