import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";

import React from "react";

import { StyleSheet } from "react-native";

import { BootProvider } from "@/app/context/loading/BootProvider";
import { LoadingModalProvider } from "@/app/context/loading/LoadingModalProvider";
import { PaymentProvider } from "@/app/context/payment/PaymentProvider";
import { ToastProvider } from "@/app/context/toast/ToastProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { userStore } from "@/store/UserSlice";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Provider store={userStore}>
          <ToastProvider>
            <LoadingModalProvider>
              <PaymentProvider>
                <BootProvider>
                  <GestureHandlerRootView style={styles.gestureHandlerRootView}>
                    {children}
                  </GestureHandlerRootView>
                </BootProvider>
              </PaymentProvider>
            </LoadingModalProvider>
          </ToastProvider>
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
