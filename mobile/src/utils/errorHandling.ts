import { AppError } from "./error";

export async function safeQuery<T>(
  operation: () => Promise<T>,
  context: string,
  defaultValue: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    new AppError(error, context);
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
    throw new AppError(error, context, showUserNotification);
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
    throw new AppError(error, context, showUserNotification);
  }
}

export function safeListener(
  operation: () => () => void,
  context: string
): () => void {
  try {
    return operation();
  } catch (error) {
    new AppError(error, context);
    return () => {};
  }
}
