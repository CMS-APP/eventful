import { reload, signOut } from "@react-native-firebase/auth";
import { serverTimestamp } from "@react-native-firebase/firestore";
import { Dispatch } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";

import { useCallback, useState } from "react";

import { CommonActions } from "@react-navigation/native";

import { useBoot } from "@/app/context/loading/BootContext";
import { checkAuth } from "@/app/init/auth";
import { getDeviceInfo } from "@/app/init/device";
import { FIREBASE_AUTH } from "@/app/init/firebase";
import { appDatabaseUpdate } from "@/app/init/migration";
import { storeInit } from "@/app/init/store";
import { navigationRef } from "@/app/navigation";
import {
  initAnalytics,
  setAnalyticsUserId
} from "@/services/analytics/analytics";
import {
  cleanupOrphanedData,
  getUserInfo,
  updateUserInfo
} from "@/services/firebase/user";
import { syncNextEventWidget } from "@/services/widget/nextEventWidget";
import { setUserData, setUserInSentry } from "@/store/UserSlice";
import { User } from "@/types/User";
import { log } from "@/utils/logging";

import { notificationsInit } from "./notifications";
import { checkIfUpdateRequired } from "./version";

export async function dataInit(dispatch: Dispatch, nextStep?: () => void) {
  await initAnalytics();

  nextStep?.();
  const needsUpdate = await checkIfUpdateRequired();
  if (needsUpdate) {
    return "Update";
  }

  nextStep?.();
  const user = await checkAuth();
  if (!user) {
    return "Auth";
  }

  try {
    await reload(user);
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (
      code === "auth/user-not-found" ||
      code === "auth/user-disabled" ||
      code === "auth/user-token-expired" ||
      code === "auth/invalid-user-token" ||
      code === "auth/no-current-user"
    ) {
      try {
        await signOut(FIREBASE_AUTH);
      } catch (error) {
        log(`Error signing out: ${error}`, "error");
      }
      return "Auth";
    }
    throw error;
  }

  const hasFederatedProvider = user.providerData.some(
    (provider) =>
      provider.providerId === "google.com" ||
      provider.providerId === "apple.com"
  );
  if (!hasFederatedProvider && !user.emailVerified) {
    return "Auth";
  }

  syncNextEventWidget(user.uid);

  await storeInit(user.uid);
  nextStep?.();

  const userDetails = await getUserInfo(user.uid);
  if (!userDetails || !userDetails?.firstName || !userDetails?.lastName) {
    dispatch(
      setUserData({
        uid: user.uid,
        email: user.email || undefined
      })
    );
    return "Onboarding";
  }

  nextStep?.();

  cleanupOrphanedData(user.uid);

  nextStep?.();
  const finalData = await appDatabaseUpdate(userDetails);

  nextStep?.();
  const deviceInfo = getDeviceInfo();
  await updateUserInfo(user.uid, {
    ...deviceInfo,
    lastLaunchedAt: serverTimestamp()
  });
  const finalDataWithDeviceInfo: User = {
    ...finalData,
    ...(deviceInfo as Partial<User>)
  };

  nextStep?.();
  await notificationsInit(user.uid);

  delete (finalDataWithDeviceInfo as unknown as Record<string, unknown>)
    .lastLaunchedAt;

  setUserInSentry(finalDataWithDeviceInfo);
  setAnalyticsUserId(user.uid);
  dispatch(setUserData(finalDataWithDeviceInfo));

  return "Main";
}

export function useDataInit() {
  const dispatch = useDispatch();
  const { startLoading, nextStep, stopLoading } = useBoot();
  const [bootError, setBootError] = useState<Error | null>(null);

  const initialize = useCallback(async () => {
    setBootError(null);
    startLoading();

    try {
      const result = await dataInit(dispatch, nextStep);
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: result }]
        })
      );
    } catch (error) {
      log(`Error initialising app: ${error}`, "error");
    } finally {
      stopLoading();
    }
  }, [dispatch, startLoading, nextStep, stopLoading]);

  return { initialize, bootError };
}
