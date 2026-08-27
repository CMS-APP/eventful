/** @format */
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential
} from "@react-native-firebase/auth";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes
} from "@react-native-google-signin/google-signin";
import { useDispatch } from "react-redux";

import { useState } from "react";

import { dataInit } from "@/app/init/data";
import { Button } from "@/design-system/components/Button";
import { colors } from "@/design-system/tokens/colors";
import { showErrorNotification } from "@/utils/appNotifications";
import { log } from "@/utils/logging";
import { navigationRef } from "@/utils/navigation";

import { saveGoogleOnboardingName } from "../utils";

export function GoogleLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  async function onGoogleButtonPress() {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await GoogleSignin.hasPlayServices();

      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error("No ID token found");
      }

      const googleCredential = GoogleAuthProvider.credential(
        signInResult?.data?.idToken
      );

      const user = await signInWithCredential(getAuth(), googleCredential);
      const result = await dataInit(dispatch);

      if (user.additionalUserInfo?.profile) {
        await saveGoogleOnboardingName(
          user.user,
          user.additionalUserInfo?.profile
        );
      }

      navigationRef.navigate(result);
    } catch (error) {
      if (
        (isErrorWithCode(error) &&
          error.code === statusCodes.SIGN_IN_CANCELLED) ||
        error?.toString() === "Error: No ID token found"
      ) {
        log("User cancelled Google authentication", "info");
        return;
      }
      log(
        `Error signing in with Google: ${(error as any)?.message ?? error}`,
        "error"
      );
      showErrorNotification("Error Signing In");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Button
      text="Google"
      onPress={onGoogleButtonPress}
      color={colors.primary}
      textColor={colors.white}
      icon="google"
      disabled={isSubmitting}
      loading={isSubmitting}
    />
  );
}
