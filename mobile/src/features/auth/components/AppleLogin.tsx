/** @format */
import { appleAuth } from "@invertase/react-native-apple-authentication";
import {
  AppleAuthProvider,
  getAuth,
  signInWithCredential
} from "@react-native-firebase/auth";
import { useDispatch } from "react-redux";

import React from "react";

import { Platform } from "react-native";

import {
  ILoadingModalContext,
  useLoadingModal
} from "@/app/context/loading/LoadingModalContext";
import { dataInit } from "@/app/init/data";
import { navigationRef } from "@/app/navigation";
import { Button } from "@/design-system/components/Button";
import { colors } from "@/design-system/tokens/colors";
import { showErrorToast } from "@/utils/toast";

import { saveAppleOnboardingName } from "../utils";

export function AppleLogin() {
  const dispatch = useDispatch();
  const { setLoading } = useLoadingModal() as ILoadingModalContext;

  if (Platform.OS !== "ios") {
    return null;
  }

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
      const result = await dataInit(dispatch);

      if (fullName?.givenName && fullName?.familyName) {
        await saveAppleOnboardingName(user.user, fullName);
      }

      navigationRef.navigate(result);
    } catch (error: any) {
      if (error.code !== "1001") {
        showErrorToast("Error signing in with Apple");
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
