import React from "react";

import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from "react-native";

import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";

interface ModalViewProps {
  children: React.ReactNode;
  show: boolean;
  setShow: (show: boolean) => void;
  backgroundColor?: string;
  borderColor?: string;
}

export function ModalView({
  children,
  show,
  setShow,
  backgroundColor = colors.white,
  borderColor = colors.lightGray + "40"
}: ModalViewProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={show}
      onRequestClose={() => setShow(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={() => setShow(false)}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>
        <View style={[styles.modalContent, { backgroundColor, borderColor }]}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    ...globalStyles.largeWidget,
    alignItems: "stretch",
    alignSelf: "stretch",
    borderWidth: 0.5,
    gap: 12,
    margin: 24
  },
  modalOverlay: {
    backgroundColor: colors.blackTransparent,
    flex: 1,
    justifyContent: "center"
  },
  overlayTouchable: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  }
});
