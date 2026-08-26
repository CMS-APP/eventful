import { getAuth, signOut } from "@react-native-firebase/auth";

import { useEffect } from "react";

import { StatusBar, StyleSheet, View } from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { colors } from "@/design-system/tokens/colors";
import {
  AllStackParamList,
  AppStackParamList,
  OnboardingStackParamList
} from "@/features/app/navigationTypes";
import { AppError } from "@/utils/error";

import { FeatureView } from "../components/FeatureView";
import { OnboardingButtons } from "../components/OnboardingButtons";

interface Onboarding1ScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
}

export function Onboarding1Screen({ navigation }: Onboarding1ScreenProps) {
  async function handleExit() {
    try {
      const auth = getAuth();
      await signOut(auth);
      await signOutNavigation();
    } catch (error) {
      new AppError(error, "Error Signing out", true);
    }
  }

  async function handleNext() {
    (navigation as StackNavigationProp<OnboardingStackParamList>).navigate(
      "Onboarding2"
    );
  }

  async function signOutNavigation() {
    StatusBar.setBarStyle("light-content");
    (navigation as StackNavigationProp<AppStackParamList>).navigate(
      "LoadingScreen"
    );

    setTimeout(() => {
      (navigation as StackNavigationProp<AppStackParamList>).navigate("Auth");
    }, 500);
  }

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
  }, []);

  return (
    <View style={styles.container}>
      <FeatureView
        image={require("@/assets/onboarding/drinks.png")}
        title="Welcome"
        subTitle="Plan Your Perfect Event"
        description="Easily organize events with friends and family. From parties to weddings, your event details are all in one place!"
      />

      <OnboardingButtons exit={handleExit} next={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flex: 1
  }
});
