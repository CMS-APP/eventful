import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";

import React from "react";

import { StyleSheet } from "react-native";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingModalProvider } from "@/contexts/LoadingProviderContext";

import { userStore } from "../store/UserSlice";
import { LoadingProvider } from "./LoadingProvider";
import { NotificationProvider } from "./NotificationProvider";
import { PaymentProvider } from "./PaymentProvider";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Provider store={userStore}>
          <NotificationProvider>
            <LoadingModalProvider>
              <PaymentProvider>
                <LoadingProvider>
                  <GestureHandlerRootView style={styles.gestureHandlerRootView}>
                    {children}
                  </GestureHandlerRootView>
                </LoadingProvider>
              </PaymentProvider>
            </LoadingModalProvider>
          </NotificationProvider>
        </Provider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  gestureHandlerRootView: {
    flex: 1
  }
});
