// App Notifications
import { log } from "./logging";

let globalShowError: ((message: string, duration?: number) => void) | null =
  null;

let notificationQueue: { message: string; duration?: number }[] = [];

export function setGlobalNotificationFunctions(
  showError: (message: string, duration?: number) => void
) {
  globalShowError = showError;

  // Process any queued notifications
  if (notificationQueue.length > 0) {
    log(
      `AppNotifications: Provider initialized, processing ${notificationQueue.length} queued notification(s)`,
      "info"
    );

    notificationQueue.forEach(({ message, duration }) => {
      showError(message, duration);
    });

    notificationQueue = [];
  }
}

export function showErrorNotification(message: string, duration?: number) {
  if (globalShowError) {
    globalShowError(message, duration);
  } else {
    // Queue the notification for when provider is ready
    notificationQueue.push({ message, duration });
  }
}
