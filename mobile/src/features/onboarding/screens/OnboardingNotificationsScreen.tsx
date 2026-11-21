import { useDispatch, useSelector } from "react-redux";

import { useState } from "react";

import { StackNavigationProp } from "@react-navigation/stack";

import { usePushNotificationsToggle } from "@/app/hooks/usePushNotificationsToggle";
import { AllStackParamList } from "@/app/navigation";
import { Button } from "@/design-system/components/buttons/Button";
import { SwitchButton } from "@/design-system/components/buttons/SwitchButton";
import { SwitchButtonGroup } from "@/design-system/components/buttons/SwitchButtonGroup";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { trackOnboardingCompleted } from "@/services/analytics/events";
import { updateUserInfo } from "@/services/firebase/user";
import { UserState, setEmailNotifications } from "@/store/UserSlice";

import { OnboardingLayout } from "../components/OnboardingLayout";

interface OnboardingNotificationsScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
}

export function OnboardingNotificationsScreen({
  navigation
}: OnboardingNotificationsScreenProps) {
  const dispatch = useDispatch();
  const userId = useSelector((state: UserState) => state.uid);
  const [emailNotifications, setEmailNotificationsLocal] = useState(true);

  const { pushNotifications, togglePushNotifications } =
    usePushNotificationsToggle();

  async function finishNotificationsStep() {
    await updateUserInfo(userId, { emailNotifications });
    dispatch(setEmailNotifications(emailNotifications));
    trackOnboardingCompleted();
    navigation.navigate("Main" as never);
  }

  return (
    <OnboardingLayout
      step={3}
      onBack={navigation.goBack}
      title="Stay in the loop"
      subtitle="Choose how we let you know"
      image={require("@/assets/onboarding/notifications.png")}
      footer={
        <Button
          text="Finish"
          color={colors.secondary}
          textColor={colors.white}
          onPress={finishNotificationsStep}
          leadingIcon="arrow-right"
        />
      }
    >
      <SwitchButtonGroup>
        <SwitchButton
          icon="bell"
          title="Push Notifications"
          subtitle="To-do reminders and RSVP updates"
          value={pushNotifications}
          onChange={togglePushNotifications}
        />
        <SwitchButton
          icon="envelope"
          title="Email"
          subtitle="Event summaries and party ideas"
          value={emailNotifications}
          onChange={() => setEmailNotificationsLocal(!emailNotifications)}
        />
      </SwitchButtonGroup>

      <Text type="caption" color={colors.gray} center>
        You can change this any time in settings
      </Text>
    </OnboardingLayout>
  );
}
