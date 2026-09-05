import { useSelector } from "react-redux";

import React, { useRef } from "react";

import { NavigationContainer } from "@react-navigation/native";
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator
} from "@react-navigation/native-stack";

import { ErrorFallback } from "@/app/context/error/ErrorFallback";
import { useBackButtonHandler } from "@/app/hooks/useBackButtonHandler";
import { useSyncEventWidget } from "@/app/hooks/useSyncEventWidget";
import { useDataInit } from "@/app/init/data";
import { AppStackParamList, navigationRef } from "@/app/navigation";
import { trackScreen } from "@/services/analytics/analytics";
import { UserState } from "@/store/UserSlice";

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
  const routeNameRef = useRef<string | undefined>(undefined);
  const userId = useSelector((state: UserState) => state.uid);

  useBackButtonHandler();
  useSyncEventWidget(userId);

  if (bootError) {
    return <ErrorFallback error={bootError} resetError={initialize} />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={initialize}
      onStateChange={() => {
        const next = navigationRef.getCurrentRoute()?.name;
        if (next && next !== routeNameRef.current) {
          routeNameRef.current = next;
          trackScreen(next);
        }
      }}
    >
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
          options={{ gestureEnabled: true }}
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
