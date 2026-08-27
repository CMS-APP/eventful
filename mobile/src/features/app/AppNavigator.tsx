import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator
} from "@react-navigation/native-stack";

import { useDataInit } from "@/app/init/data";
import { AppStackParamList } from "@/features/app/navigationTypes";
import { navigationRef } from "@/utils/navigation";

import { LoadingScreen } from "../../app/screens/LoadingScreen";
import { UpdateScreen } from "../../app/screens/UpdateScreen";
import { AuthNavigator } from "../auth/AuthNavigator";
import { EventInviteNavigator } from "../invite/EventInviteNavigator";
import { MainNavigator } from "../main/MainNavigator";
import { OnboardingNavigator } from "../onboarding/OnboardingNavigator";
import { PaywallScreen } from "./screens/PaywallScreen";
import { SubscriptionCelebrationScreen } from "./screens/SubscriptionCelebrationScreen";
import { WebViewScreen } from "./screens/WebViewScreen";

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
  const { initialize } = useDataInit();

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
          component={WebViewScreen}
          options={modalOptions}
        />
        <Stack.Screen
          name="EventInvite"
          component={EventInviteNavigator}
          options={modalOptions}
        />
        <Stack.Screen
          name="SubscriptionCelebration"
          component={SubscriptionCelebrationScreen}
          options={modalOptions}
        />
        <Stack.Screen name="Update" component={UpdateScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
