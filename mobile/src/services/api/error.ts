import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

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

export async function safeMutation<T = void>(
  operation: () => Promise<T>,
  context: string,
  showUserNotification = false
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (showUserNotification) {
      showErrorToast(`Error: ${context}`);
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
