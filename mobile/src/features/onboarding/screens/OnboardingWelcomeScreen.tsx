import { getAuth, signOut } from "@react-native-firebase/auth";

import { useEffect } from "react";

import { StatusBar } from "react-native";

import { CommonActions } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import {
  AllStackParamList,
  AppStackParamList,
  OnboardingStackParamList,
  navigationRef
} from "@/app/navigation";
import { Button } from "@/design-system/components/buttons/Button";
import { colors } from "@/design-system/tokens/colors";
import { trackOnboardingStarted } from "@/services/analytics/events";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

import { OnboardingLayout } from "../components/OnboardingLayout";

interface OnboardingWelcomeScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
}

export function OnboardingWelcomeScreen({
  navigation
}: OnboardingWelcomeScreenProps) {
  async function handleExit() {
    try {
      const auth = getAuth();
      await signOut(auth);
      await signOutNavigation();
    } catch (error) {
      log(`Error Signing Out: ${error}`, "error");
      showErrorToast("Error Signing Out");
    }
  }

  async function handleNext() {
    trackOnboardingStarted();
    (navigation as StackNavigationProp<OnboardingStackParamList>).navigate(
      "OnboardingNameInput"
    );
  }

  async function signOutNavigation() {
    StatusBar.setBarStyle("light-content");
    (navigation as StackNavigationProp<AppStackParamList>).navigate(
      "LoadingScreen"
    );

    setTimeout(() => {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Auth" }]
        })
      );
    }, 500);
  }

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
  }, []);

  return (
    <OnboardingLayout
      step={1}
      onBack={handleExit}
      title="You're in!"
      subtitle="Two quick steps and you're ready to plan your first event"
      image={require("@/assets/onboarding/drinks.png")}
      imageSize={200}
      expandHero
    >
      <Button
        text="Let's go"
        color={colors.primary}
        textColor={colors.white}
        onPress={handleNext}
        leadingIcon="arrow-right"
      />
    </OnboardingLayout>
  );
}
