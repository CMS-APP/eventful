import { clearNotifications } from "./notifications";

export async function handleAppStateChange(nextAppState: string) {
  if (nextAppState === "active") {
    await clearNotifications();
  }
}
