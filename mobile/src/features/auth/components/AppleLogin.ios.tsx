/** @format */
import { appleAuth } from "@invertase/react-native-apple-authentication";
import {
  AppleAuthProvider,
  getAuth,
  signInWithCredential
} from "@react-native-firebase/auth";
import { useDispatch } from "react-redux";

import React from "react";

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

import { saveAppleOnboardingName } from "../utils";

export function AppleLogin() {
  const dispatch = useDispatch();
  const { setLoading } = useLoadingModal() as ILoadingModalContext;

  async function onAppleButtonPress() {
    try {
      setLoading(true);
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL]
      });

      if (!appleAuthRequestResponse.identityToken) {
        throw new Error("Apple Sign-In failed - no identify token returned");
      }

      const fullName = appleAuthRequestResponse.fullName;

      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = AppleAuthProvider.credential(
        identityToken,
        nonce
      );

      const user = await signInWithCredential(getAuth(), appleCredential);
      const result = await appInit(dispatch);

      if (fullName?.givenName && fullName?.familyName) {
        await saveAppleOnboardingName(user.user, fullName);
      }

      navigationRef.navigate(result);
    } catch (error: any) {
      if (error.code === "1001") {
        log("User cancelled authentication", "info");
      } else {
        new AppError(error, "Error signing in with Apple", true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      text="Apple"
      onPress={onAppleButtonPress}
      color={colors.primary}
      textColor={colors.white}
      icon="apple"
    />
  );
}
