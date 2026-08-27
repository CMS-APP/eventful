import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator
} from "@react-navigation/native-stack";

import { ErrorFallback } from "@/app/context/error/ErrorFallback";
import { useBackButtonHandler } from "@/app/hooks/useBackButtonHandler";
import { useDataInit } from "@/app/init/data";
import { AppStackParamList, navigationRef } from "@/app/navigation";

import { AuthNavigator } from "../features/auth/AuthNavigator";
import { EventInviteNavigator } from "../features/invite/EventInviteNavigator";
import { MainNavigator } from "../features/main/MainNavigator";
import { OnboardingNavigator } from "../features/onboarding/OnboardingNavigator";
import { PaywallScreen } from "../features/paywall/PaywallScreen";
import { CelebrationScreen } from "./screens/CelebrationScreen";
import { LoadingScreen } from "./screens/LoadingScreen";
import { UpdateScreen } from "./screens/UpdateScreen";
import { WebScreen } from "./screens/WebScreen";

const Stack = createNativeStackNavigator<AppStackParamList>();

const stackOptions = {
  headerShown: false,
  gestureEnabled: false
};

const modalOptions: NativeStackNavigationOptions = {
  gestureEnabled: true,
  presentation: "modal"
};

export function AppNavigator() {
  const { initialize, bootError } = useDataInit();

  useBackButtonHandler();

  if (bootError) {
    return <ErrorFallback error={bootError} resetError={initialize} />;
  }

  return (
    <NavigationContainer ref={navigationRef} onReady={initialize}>
      <Stack.Navigator screenOptions={stackOptions}>
        <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={modalOptions}
        />
        <Stack.Screen
          name="WebView"
          component={WebScreen}
          options={modalOptions}
        />
        <Stack.Screen
          name="EventInvite"
          component={EventInviteNavigator}
          options={modalOptions}
        />
        <Stack.Screen
          name="Celebration"
          component={CelebrationScreen}
          options={modalOptions}
        />
        <Stack.Screen name="Update" component={UpdateScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
