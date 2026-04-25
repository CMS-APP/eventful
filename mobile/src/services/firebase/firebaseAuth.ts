import {
  FirebaseAuthTypes,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "@react-native-firebase/auth";
import { deleteField } from "@react-native-firebase/firestore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Action, Dispatch } from "@reduxjs/toolkit";

import { Platform } from "react-native";

import { setBadgeCountAsync } from "expo-notifications";

import { removeAllData } from "@/services/async";
import { clearCache } from "@/services/cache";
import { clearStorage } from "@/store/UserSlice";
import { User } from "@/types/User";
import { AppError } from "@/utils/error";
import { clearNotifications, getExpoToken } from "@/utils/notifications";

import { incrementUserCount } from "./firebaseBackend";
import {
  getPushTokensFromDatabase,
  updateUserInfo
} from "./firebaseUserFunctions";

export async function handleSignIn(
  email: string,
  password: string
): Promise<FirebaseAuthTypes.User | null> {
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch {
    return null;
  }
}

export async function handleSignOut(dispatch: Dispatch<Action>) {
  const auth = getAuth();

  try {
    const pushToken = await getExpoToken();
    let pushTokens = await getPushTokensFromDatabase(
      auth.currentUser?.uid as string
    );

    if (pushToken && pushTokens) {
      pushTokens =
        pushTokens.filter((token: string) => token !== pushToken) ||
        deleteField();
      await updateUserInfo(
        auth.currentUser?.uid as string,
        { pushTokens: pushTokens } as User
      );
    }

    await clearNotifications();
    await removeAllData();
    await clearCache();

    dispatch(clearStorage());

    if (Platform.OS === "ios") {
      await setBadgeCountAsync(0);
    }

    try {
      await GoogleSignin.signOut();
    } catch (error) {
      new AppError(error, "Error signing out from Google Sign-In");
    }

    await signOut(auth);
  } catch (error) {
    throw new AppError(error, "Auth: Error signing out");
  }
}

export async function handleSignUp(
  email: string,
  password: string
): Promise<FirebaseAuthTypes.User | string> {
  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    incrementUserCount(userCredential.user);
    return userCredential.user;
  } catch (error) {
    if ((error as { code: string }).code === "auth/email-already-in-use") {
      return "Email already in use.";
    }
    throw new AppError(error, "Auth: Error signing up");
  }
}
