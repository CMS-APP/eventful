import * as Sentry from "@sentry/react-native";

function formatMessage(message: string) {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `[${hours}:${minutes}:${seconds}] ${message}`;
}

export function log(
  message: string,
  level: "debug" | "info" | "warn" | "error" = "info"
) {
  const logLevel = process.env.EXPO_PUBLIC_LOG_LEVEL ?? "warn";
  const logLevels = {
    debug: { priority: 0, func: console.debug },
    info: { priority: 1, func: console.info },
    warn: { priority: 2, func: console.warn },
    error: { priority: 3, func: console.error }
  };

  const priority = logLevels[level].priority;

  const formattedMessage = formatMessage(message);

  switch (level) {
    case "error":
      Sentry.captureMessage(formattedMessage, "error");
      break;
    case "warn":
      Sentry.captureMessage(formattedMessage, "warning");
      break;
    default:
      if (priority >= 1) {
        Sentry.addBreadcrumb({
          category: "log",
          message: formattedMessage,
          level: "info"
        });
      }
      break;
  }

  if (priority >= logLevels[logLevel as keyof typeof logLevels].priority) {
    logLevels[level].func(formattedMessage);
  }
}
