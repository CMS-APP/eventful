import { useDispatch, useSelector } from "react-redux";

import { useState } from "react";

import { StyleSheet, View } from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList } from "@/app/navigation";
import { usePushNotificationsToggle } from "@/app/hooks/usePushNotificationsToggle";
import { SwitchButton } from "@/design-system/components/buttons/SwitchButton";
import { TextButton } from "@/design-system/components/buttons/TextButton";
import { colors } from "@/design-system/tokens/colors";
import { trackOnboardingCompleted } from "@/services/analytics/events";
import { updateUserInfo } from "@/services/firebase/user";
import { UserState, setEmailNotifications } from "@/store/UserSlice";

import { FeatureView } from "../components/FeatureView";

interface OnboardingNotificationsScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
}

export function OnboardingNotificationsScreen({
  navigation
}: OnboardingNotificationsScreenProps) {
  const dispatch = useDispatch();
  const userId = useSelector((state: UserState) => state.uid);
  const [emailNotifications, setEmailNotificationsLocal] = useState(false);

  const { pushNotifications, togglePushNotifications } =
    usePushNotificationsToggle();

  async function finishNotificationsStep() {
    await updateUserInfo(userId, { emailNotifications });
    dispatch(setEmailNotifications(emailNotifications));
    trackOnboardingCompleted();
    navigation.navigate("Main" as never);
  }

  return (
    <View style={styles.container}>
      <FeatureView
        image={require("@/assets/onboarding/notifications.png")}
        title="Notifications"
        subTitle="Don't miss Out"
        description="Stay on top of your events and never miss a thing - enable notifications to keep track of to-dos and RSVPs."
      />

      <View style={styles.content}>
        <View style={styles.emailToggle}>
          <SwitchButton
            title="Push Notifications"
            isChecked={pushNotifications}
            onChange={togglePushNotifications}
            dark
          />

          <SwitchButton
            title="Email Notifications"
            isChecked={emailNotifications}
            onChange={() => setEmailNotificationsLocal(!emailNotifications)}
            dark
          />
        </View>

        <TextButton
          text="Continue"
          type="body"
          textAlign="center"
          onPress={finishNotificationsStep}
          textColor={colors.white}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flex: 1
  },
  content: {
    gap: 12,
    marginBottom: 100,
    width: "100%"
  },
  emailToggle: {
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 20
  }
});
