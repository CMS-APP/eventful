/** @format */
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential
} from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useDispatch } from "react-redux";

import { Button } from "@/components/buttons/Button";
import {
  ILoadingModalContext,
  useLoadingModal
} from "@/contexts/LoadingProviderContext";
import { appInit } from "@/services/initialisation/appInit";
import { colors } from "@/styles/colors";
import { AppError } from "@/utils/error";
import { log } from "@/utils/logging";
import { navigationRef } from "@/utils/navigation";

import { saveGoogleOnboardingName } from "../utils";

export function GoogleLogin() {
  const { setLoading } = useLoadingModal() as ILoadingModalContext;
  const dispatch = useDispatch();

  async function onGoogleButtonPress() {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      let idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error("No ID token found");
      }

      const googleCredential = GoogleAuthProvider.credential(
        signInResult?.data?.idToken
      );

      const user = await signInWithCredential(getAuth(), googleCredential);
      const result = await appInit(dispatch);

      if (user.additionalUserInfo?.profile) {
        await saveGoogleOnboardingName(
          user.user,
          user.additionalUserInfo?.profile
        );
      }

      navigationRef.navigate(result);
    } catch (error) {
      if (error?.toString() === "Error: No ID token found") {
        log("User cancelled Google authentication", "info");
        return;
      }
      new AppError(error, "Error signing in with Google", true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      text="Google"
      onPress={onGoogleButtonPress}
      color={colors.primary}
      textColor={colors.white}
      icon="google"
    />
  );
}
