import { Modal, StyleSheet, View } from "react-native";

import { LoadingIndicator } from "@/components/views/LoadingIndicator";
import { colors } from "@/design-system/tokens/colors";

export function LoadingModal({ visible }: { visible: boolean }) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.modalOverlay}>
        <LoadingIndicator />
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
