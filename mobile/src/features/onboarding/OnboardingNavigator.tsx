import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { OnboardingStackParamList } from "@/app/navigationTypes";

import { Onboarding1Screen } from "./screens/Onboarding1Screen";
import { Onboarding2Screen } from "./screens/Onboarding2Screen";
import { Onboarding3Screen } from "./screens/Onboarding3Screen";
import { OnboardingNameInputScreen } from "./screens/OnboardingNameInputScreen";
import { OnboardingNotificationsScreen } from "./screens/OnboardingNotificationsScreen";

export function OnboardingNavigator() {
  const Stack = createNativeStackNavigator<OnboardingStackParamList>();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureDirection: "vertical",
        animation: "slide_from_bottom"
      }}
    >
      <Stack.Screen name="Onboarding1" component={Onboarding1Screen} />
      <Stack.Screen name="Onboarding2" component={Onboarding2Screen} />
      <Stack.Screen name="Onboarding3" component={Onboarding3Screen} />
      <Stack.Screen
        name="OnboardingNameInput"
        component={OnboardingNameInputScreen}
      />
      <Stack.Screen
        name="OnboardingNotifications"
        component={OnboardingNotificationsScreen}
      />
    </Stack.Navigator>
  );
}
