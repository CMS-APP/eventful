import { Event } from "@/types/Event";

import { navigationRef } from "./navigation";

export function navigateToEventEdit(event: Event) {
  if (!navigationRef.isReady()) return;

  navigationRef.navigate("Main", {
    screen: "Events",
    params: {
      screen: "EventEdit",
      params: { event }
    }
  });
}
