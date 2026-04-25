import * as Sentry from "@sentry/react-native";

import { showErrorNotification } from "./appNotifications";
import { log } from "./logging";

function isPermissionDeniedError(error: any): boolean {
  if (!error) return false;
  return (
    error.code === "permission-denied" ||
    error.message?.includes("Permission denied")
  );
}

const networkErrors = [
  "The Internet connection appears to be offline",
  "Failed to get document because the client is offline.",
  "Error performing request because the internet connection appears to be offline."
];

function isNetworkRequestFailedError(error: any): boolean {
  if (!error) return false;
  return (
    error.code === "network-request-failed" ||
    networkErrors.some((errorMessage) => error.message?.includes(errorMessage))
  );
}

function isUnavailableError(error: any): boolean {
  if (!error) return false;
  return (
    error.code === "unavailable" ||
    error.message?.includes("[firestore/unavailable]")
  );
}

export class AppError extends Error {
  public context: string;

  constructor(
    err: any,
    context: string,
    showUserNotification: boolean = false
  ) {
    log("Error: " + err?.message + " - " + context, "error");
    super(err?.message || err?.toString() || "Unknown error occurred");
    this.context = context;
    this.name = context ? context : "AppError";

    const errorHandlers = [
      {
        check: isPermissionDeniedError,
        message: "Permission denied (handled)"
      },
      {
        check: isNetworkRequestFailedError,
        message: "Network request failed (handled)"
      },
      {
        check: isUnavailableError,
        message: "Firestore temporarily unavailable (handled)"
      }
    ];

    const matchedHandler = errorHandlers.find(({ check }) => check(err));
    const handled = !!matchedHandler;

    if (!handled) {
      if (showUserNotification) {
        const notificationMessage = context
          ? `Error: ${context}`
          : "An error occurred";
        showErrorNotification(notificationMessage);
      }
      // Include context as tag and additional context for better Sentry grouping
      Sentry.withScope((scope) => {
        scope.setTag("errorContext", context || "Unknown");
        scope.setContext("errorDetails", {
          context: context || "Unknown",
          originalError: err?.message || err?.toString() || "Unknown error",
          errorCode: err?.code,
          errorName: err?.name
        });
        Sentry.captureException(this);
      });
    }
  }
}
