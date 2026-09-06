import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from "react-native";

import { Button } from "@/design-system/components/buttons/Button";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { shadows } from "@/design-system/tokens/shadows";
import { AlertOptions } from "@/types/AlertOptions";

type AlertModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertOptions[];
  onDismiss: () => void;
};

export function AlertModal({
  visible,
  title,
  message,
  buttons,
  onDismiss
}: AlertModalProps) {
  const cancelButton = buttons.find((button) => button.style === "cancel");
  const optionButtons = buttons.filter((button) => button.style !== "cancel");
  const { bottom } = useSafeAreaInsets();

  function handlePress(button: AlertOptions) {
    onDismiss();
    button.onPress?.();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        <View style={[styles.sheet, { paddingBottom: bottom + 16 }]}>
          <Text type="header" center color={colors.white}>
            {title}
          </Text>
          {message ? (
            <Text type="body" color={colors.white} center>
              {message}
            </Text>
          ) : null}

          <View style={styles.options}>
            {optionButtons.map((button) => (
              <Button
                key={button.text}
                text={button.text}
                color={
                  button.style === "destructive"
                    ? colors.red
                    : colors.primaryTint
                }
                textColor={colors.white}
                onPress={() => handlePress(button)}
              />
            ))}
          </View>

          {cancelButton ? (
            <Button
              text={cancelButton.text}
              color={colors.white}
              textColor={colors.black}
              onPress={() => handlePress(cancelButton)}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: colors.blackTransparent,
    flex: 1,
    justifyContent: "flex-end"
  },
  options: {
    gap: 8,
    marginTop: 4
  },
  sheet: {
    ...shadows.mediumShadow,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 12,
    padding: 20,
    paddingBottom: 32
  }
});
