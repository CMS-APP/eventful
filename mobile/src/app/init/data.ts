import { Dispatch } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";

import { useCallback, useState } from "react";

import { CommonActions } from "@react-navigation/native";

import { useBoot } from "@/app/context/loading/BootContext";
import { checkAuth } from "@/app/init/auth";
import { getDeviceInfo } from "@/app/init/device";
import { appDatabaseUpdate } from "@/app/init/migration";
import { storeInit } from "@/app/init/store";
import { navigationRef } from "@/app/navigation";
import {
  cleanupOrphanedData,
  getUserInfo,
  updateUserInfo
} from "@/services/firebase/firebaseUserFunctions";
import { setUserData, setUserInSentry } from "@/store/UserSlice";
import { User } from "@/types/User";
import { log } from "@/utils/logging";

import { checkIfUpdateRequired } from "./version";

export async function dataInit(dispatch: Dispatch, nextStep?: () => void) {
  nextStep?.();
  const needsUpdate = await checkIfUpdateRequired();
  if (needsUpdate) {
    return "Update";
  }

  nextStep?.();
  const user = await checkAuth();
  if (!user || !user.emailVerified) {
    return "Auth";
  }

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

  // TODO: Move this to be a cron job in the backend
  cleanupOrphanedData(user.uid);

  nextStep?.();
  const finalData = await appDatabaseUpdate(userDetails);

  nextStep?.();
  const deviceInfo = getDeviceInfo();
  await updateUserInfo(user.uid, deviceInfo);
  const finalDataWithDeviceInfo: User = {
    ...finalData,
    ...(deviceInfo as Partial<User>)
  };

  delete (finalDataWithDeviceInfo as unknown as Record<string, unknown>)
    .lastLaunchedAt;

  setUserInSentry(finalDataWithDeviceInfo);
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
      stopLoading();
    } catch (error) {
      log(
        `Error initialising app: ${(error as any)?.message ?? error}`,
        "error"
      );
      setBootError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [dispatch, startLoading, nextStep, stopLoading]);

  return { initialize, bootError };
}
