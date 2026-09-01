import { arrayUnion } from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";

import { Alert, StyleSheet, View } from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList } from "@/app/navigation";
import { colors } from "@/design-system/tokens/colors";
import { trackOnboardingCompleted } from "@/services/analytics/events";
import { updateUserInfo } from "@/services/firebase/user";
import { registerForPushNotificationsAsync } from "@/services/pushNotifications";
import { UserState } from "@/store/UserSlice";

import { FeatureView } from "../components/FeatureView";
import { OnboardingButtons } from "../components/OnboardingButtons";

interface OnboardingNotificationsScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
}

export function OnboardingNotificationsScreen({
  navigation
}: OnboardingNotificationsScreenProps) {
  const userId = useSelector((state: UserState) => state.uid);

  async function allowNotifications() {
    const token = await registerForPushNotificationsAsync();

    if (!token) {
      return;
    }

    await updateUserInfo(userId, {
      pushTokens: arrayUnion(token)
    });

    enabledAlert();
  }

  function enabledAlert() {
    Alert.alert(
      "Notifications Enabled",
      "You will now receive notifications for your events.",
      [
        {
          text: "OK",
          onPress: () => {
            trackOnboardingCompleted();
            navigation.navigate("Main" as never);
          }
        }
      ]
    );
  }

  return (
    <View style={styles.container}>
      <FeatureView
        image={require("@/assets/onboarding/notifications.png")}
        title="Notifications"
        subTitle="Don't miss Out"
        description="Stay on top of your events and never miss a thing - enable notifications to keep track of to-dos and RSVPs."
      />

      <OnboardingButtons
        exit={() => {
          trackOnboardingCompleted();
          navigation.navigate("Main" as never);
        }}
        next={() => {
          allowNotifications();
        }}
        nextText="Allow"
        backText="Skip"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flex: 1
  }
});
