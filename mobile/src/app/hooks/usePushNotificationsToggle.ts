import { arrayUnion } from "@react-native-firebase/firestore";
import { useDispatch, useSelector } from "react-redux";

import { useCallback } from "react";

import { removeExpoToken, updateUserInfo } from "@/services/firebase/user";
import { registerForPushNotificationsAsync } from "@/services/pushNotifications";
import { UserState, setPushNotifications } from "@/store/UserSlice";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

export function usePushNotificationsToggle() {
  const dispatch = useDispatch();
  const userId = useSelector((state: UserState) => state.uid);
  const pushNotifications = useSelector(
    (state: UserState) => state.pushNotifications
  );

  const togglePushNotifications = useCallback(async () => {
    try {
      if (pushNotifications) {
        await Promise.all([
          removeExpoToken(userId),
          updateUserInfo(userId, { pushNotifications: false })
        ]);
        dispatch(setPushNotifications(false));
        return;
      }

      const token = await registerForPushNotificationsAsync();
      if (!token) {
        return;
      }

      await updateUserInfo(userId, {
        pushTokens: arrayUnion(token) as any,
        pushNotifications: true
      });
      dispatch(setPushNotifications(true));
    } catch (error) {
      log(`Error Toggling Push Notifications: ${error}`, "error");
      showErrorToast("Error Updating Notifications");
    }
  }, [pushNotifications, userId, dispatch]);

  return { pushNotifications, togglePushNotifications };
}
