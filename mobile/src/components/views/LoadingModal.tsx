import { Modal, StyleSheet, View } from "react-native";

import { colors } from "@/styles/colors";

import { LoadingIndicator } from "./LoadingIndicator";

export function LoadingModal({ visible }: { visible: boolean }) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.modalOverlay}>
        <LoadingIndicator size={100} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    alignItems: "center",
    backgroundColor: colors.blackTransparent,
    flex: 1,
    justifyContent: "center"
  }
});
