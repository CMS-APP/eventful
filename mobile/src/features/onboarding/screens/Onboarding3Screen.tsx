import { StyleSheet, View } from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { OnboardingStackParamList } from "@/app/navigation";
import { colors } from "@/design-system/tokens/colors";

import { FeatureView } from "../components/FeatureView";
import { OnboardingButtons } from "../components/OnboardingButtons";

interface Onboarding3ScreenProps {
  navigation: StackNavigationProp<OnboardingStackParamList>;
}

export function Onboarding3Screen({ navigation }: Onboarding3ScreenProps) {
  async function handleNext() {
    navigation.navigate("OnboardingNameInput");
  }

  async function handleBack() {
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <FeatureView
        image={require("@/assets/onboarding/people.png")}
        title="Simplify"
        subTitle="Everything You Need"
        description="Track RSVPs, manage to-dos, curate playlists, and more! Tailor your events to make them truly special"
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
