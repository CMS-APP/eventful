import { getAuth, signOut } from "@react-native-firebase/auth";

import { useEffect } from "react";

import { StatusBar, StyleSheet, View } from "react-native";

import { CommonActions } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import {
  AllStackParamList,
  AppStackParamList,
  OnboardingStackParamList,
  navigationRef
} from "@/app/navigation";
import { colors } from "@/design-system/tokens/colors";
import { showErrorToast } from "@/utils/toast";

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
    } catch {
      showErrorToast("Error Signing Out");
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
