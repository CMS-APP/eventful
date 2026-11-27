import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { OnboardingStackParamList } from "@/app/navigation";

import { OnboardingNameInputScreen } from "./screens/OnboardingNameInputScreen";
import { OnboardingNotificationsScreen } from "./screens/OnboardingNotificationsScreen";
import { OnboardingWelcomeScreen } from "./screens/OnboardingWelcomeScreen";

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
      <Stack.Screen
        name="OnboardingWelcome"
        component={OnboardingWelcomeScreen}
      />
      <Stack.Screen
        name="OnboardingNameInput"
        component={OnboardingNameInputScreen}
      />
      <Stack.Screen
        name="OnboardingNotifications"
        component={OnboardingNotificationsScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
