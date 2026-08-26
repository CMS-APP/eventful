import React, { createContext, useState } from "react";

import { Modal, StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";

import { LoadingIndicator } from "../components/views/LoadingIndicator";
import { useContextWrapper } from "./utils";

export interface ILoadingModalContext {
  setLoading: (loading: boolean) => void;
}

const LoadingModalContext = createContext<ILoadingModalContext | null>(null);

export const LoadingModalProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingModalContext.Provider value={{ setLoading }}>
      {children}
      <Modal animationType="fade" transparent visible={loading}>
        <View style={styles.modalOverlay}>
          <LoadingIndicator size={100} />
        </View>
      </Modal>
    </LoadingModalContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    alignItems: "center",
    backgroundColor: colors.blackTransparent,
    flex: 1,
    justifyContent: "center"
  }
});

export const useLoadingModal = () =>
  useContextWrapper(LoadingModalContext, {
    contextName: "LoadingModalContext",
    providerName: "LoadingModalProvider"
  });
