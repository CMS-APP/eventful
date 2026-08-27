import { StyleSheet, View } from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { OnboardingStackParamList } from "@/app/navigationTypes";
import { colors } from "@/design-system/tokens/colors";

import { FeatureView } from "../components/FeatureView";
import { OnboardingButtons } from "../components/OnboardingButtons";

interface Onboarding2ScreenProps {
  navigation: StackNavigationProp<OnboardingStackParamList>;
}

export function Onboarding2Screen({ navigation }: Onboarding2ScreenProps) {
  async function handleBack() {
    navigation.goBack();
  }

  async function handleNext() {
    navigation.navigate("Onboarding3");
  }

  return (
    <View style={styles.container}>
      <FeatureView
        image={require("@/assets/onboarding/celebrate.png")}
        title="Connect with Your People"
        subTitle="With Your Friends and Family"
        description="Follow your friends, share event updates, and send invites instantly to build excitement together."
      />

      <OnboardingButtons backText="Back" exit={handleBack} next={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flex: 1
  }
});
