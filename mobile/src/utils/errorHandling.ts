import { showErrorNotification } from "./appNotifications";
import { log } from "./logging";

export async function safeQuery<T>(
  operation: () => Promise<T>,
  context: string,
  defaultValue: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    log(`${context}: ${(error as any)?.message ?? error}`, "error");
    return defaultValue;
  }
}

export async function safeMutation(
  operation: () => Promise<void>,
  context: string,
  showUserNotification = false
): Promise<void> {
  try {
    await operation();
  } catch (error) {
    if (showUserNotification) {
      showErrorNotification(`Error: ${context}`);
    }
    throw error;
  }
}

export async function safeMutationWithReturn<T>(
  operation: () => Promise<T>,
  context: string,
  showUserNotification = false
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (showUserNotification) {
      showErrorNotification(`Error: ${context}`);
    }
    throw error;
  }
}

export function safeListener(
  operation: () => () => void,
  context: string
): () => void {
  try {
    return operation();
  } catch (error) {
    log(`${context}: ${(error as any)?.message ?? error}`, "error");
    return () => {};
  }
}
