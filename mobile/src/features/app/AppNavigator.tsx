import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AppStackParamList } from "@/features/app/navigationTypes";
import { useAppStateHandler } from "@/hooks/useAppStateHandler";
import { useBackButtonHandler } from "@/hooks/useBackButtonHandler";
import { useNavigationInitialization } from "@/hooks/useNavigationInitialization";
import { useNotificationHandler } from "@/hooks/useNotificationHandler";
import { navigationRef } from "@/utils/navigation";

import { AuthNavigator } from "../auth/AuthNavigator";
import { EventInviteNavigator } from "../invite/EventInviteNavigator";
import { MainNavigator } from "../main/MainNavigator";
import { OnboardingNavigator } from "../onboarding/OnboardingNavigator";
import { LoadingScreen } from "./screens/LoadingScreen";
import { PaywallScreen } from "./screens/PaywallScreen";
import { SubscriptionCelebrationScreen } from "./screens/SubscriptionCelebrationScreen";
import { UpdateScreen } from "./screens/UpdateScreen";
import { WebViewScreen } from "./screens/WebViewScreen";

export function AppNavigator() {
  const Stack = createNativeStackNavigator<AppStackParamList>();

  useAppStateHandler();
  useBackButtonHandler();
  useNotificationHandler();
  const { initialize } = useNavigationInitialization();

  return (
    <NavigationContainer ref={navigationRef} onReady={initialize}>
      <Stack.Navigator
        screenOptions={{ headerShown: false, gestureEnabled: false }}
      >
        <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />

        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ gestureEnabled: true, presentation: "modal" }}
        />

        <Stack.Screen
          name="WebView"
          component={WebViewScreen}
          options={{ gestureEnabled: true, presentation: "modal" }}
        />

        <Stack.Screen
          name="EventInvite"
          component={EventInviteNavigator}
          options={{ gestureEnabled: true, presentation: "modal" }}
        />

        <Stack.Screen
          name="SubscriptionCelebration"
          component={SubscriptionCelebrationScreen}
          options={{ gestureEnabled: true, presentation: "modal" }}
        />

        <Stack.Screen name="Update" component={UpdateScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
