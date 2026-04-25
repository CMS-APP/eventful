import { Timestamp } from "@react-native-firebase/firestore";
import { Dispatch } from "@reduxjs/toolkit";
import Purchases from "react-native-purchases";

import {
  cleanupOrphanedData,
  getUserInfo,
  updateUserInfo
} from "@/services/firebase/firebaseUserFunctions";
import { checkAuth } from "@/services/initialisation/auth";
import { INIT_STEPS } from "@/services/initialisation/constants";
import { getDebugSyncPayload } from "@/services/initialisation/debugSync";
import { appDatabaseUpdate } from "@/services/initialisation/update";
import { ensurePurchasesConfigured } from "@/services/purchases/purchasesConfig";
import { setUserData, setUserInSentry } from "@/store/UserSlice";
import { User } from "@/types/User";
import { log } from "@/utils/logging";

import { checkIfUpdateRequired } from "./versionCheck";

export async function appInit(
  dispatch: Dispatch,
  onProgressUpdate?: (step: number, message: string) => void
) {
  let currentStep = 0;

  const updateProgress = (step: number, message: string | null = null) => {
    currentStep = step;
    if (onProgressUpdate) {
      onProgressUpdate(currentStep, message || INIT_STEPS[step - 1] || "");
    }
  };

  updateProgress(1, INIT_STEPS[0]);
  const needsUpdate = await checkIfUpdateRequired();
  if (needsUpdate) {
    return "Update";
  }

  updateProgress(2, INIT_STEPS[1]);
  const user = await checkAuth();
  if (!user || !user.emailVerified) {
    return "Auth";
  }

  log("User: " + JSON.stringify(user, null, 2), "info");

  await ensurePurchasesConfigured();
  await Purchases.logIn(user.uid);

  let data: Partial<User> = {
    uid: user.uid,
    email: user.email || undefined,
    emailVerified: user.emailVerified
  };

  updateProgress(3, INIT_STEPS[2]);
  const userDetails = await getUserInfo(user.uid);
  if (!userDetails || !userDetails?.firstName || !userDetails?.lastName) {
    dispatch(setUserData(data));
    return "Onboarding";
  }

  updateProgress(4, INIT_STEPS[3]);
  cleanupOrphanedData(user.uid);

  updateProgress(5, INIT_STEPS[4]);
  const finalData = await appDatabaseUpdate(
    userDetails,
    updateProgress,
    INIT_STEPS
  );

  updateProgress(6, INIT_STEPS[5]);

  // Sync debug/device info to user document for admin querying and support
  const debugPayload = getDebugSyncPayload();
  await updateUserInfo(user.uid, debugPayload);
  const lastLaunchedAt =
    debugPayload.lastLaunchedAt instanceof Timestamp
      ? debugPayload.lastLaunchedAt.toMillis()
      : (debugPayload.lastLaunchedAt as number | undefined);
  const finalDataWithDebugInfo: User = {
    ...finalData,
    ...(debugPayload as Partial<User>),
    lastLaunchedAt
  };

  setUserInSentry(finalDataWithDebugInfo);
  dispatch(setUserData(finalDataWithDebugInfo));

  return "Main";
}
