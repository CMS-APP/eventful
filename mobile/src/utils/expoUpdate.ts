import * as Updates from "expo-updates";

import { AppError } from "./error";

export async function fetchUpdate() {
  if (__DEV__) return;

  try {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (error) {
    throw new AppError(error, "Error checking for updates");
  }
}
