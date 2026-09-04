import { useEffect } from "react";

import * as Linking from "expo-linking";

import {
  handleEventEditNavigation,
  handleEventInviteNavigation
} from "@/app/hooks/usePushNotificationHandler";
import { navigationRef } from "@/app/navigation";
import { log } from "@/utils/logging";

async function waitForNavigationReady(maxAttempts = 20, delayMs = 250) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (navigationRef.isReady()) return true;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
}

async function handleWidgetUrl(url: string) {
  const { queryParams } = Linking.parse(url);
  if (queryParams?.source !== "widget" || !queryParams?.eventId) return;

  if (!(await waitForNavigationReady())) {
    log("Widget navigation failed: navigator never became ready", "warn");
    return;
  }

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
