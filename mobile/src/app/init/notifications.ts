import { arrayUnion } from "@react-native-firebase/firestore";

import { getUserInfo, updateUserInfo } from "@/services/firebase/user";
import {
  getExpoToken,
  hasAcceptedNotifications
} from "@/services/pushNotifications";
import { log } from "@/utils/logging";

export async function notificationsInit(userId: string) {
  try {
    const accepted = await hasAcceptedNotifications();
    if (!accepted) {
      return;
    }

    const expoToken = await getExpoToken();
    if (!expoToken) {
      log("No expo token found on device", "warn");
      return;
    }

    const user = await getUserInfo(userId);
    if (user?.pushTokens?.includes(expoToken)) {
      return;
    }

    await updateUserInfo(userId, { pushTokens: arrayUnion(expoToken) });
  } catch (error) {
    log(`Error initializing notifications: ${error}`, "error");
  }
}
