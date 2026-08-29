import { StyleSheet, View } from "react-native";

import { Button } from "@/design-system/components/buttons/Button";
import { Input } from "@/design-system/components/inputs/Input";
import { ModalView } from "@/design-system/components/overlays/ModalView";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

interface SettingsPasswordModalProps {
  presentPasswordModal: boolean;
  setPresentPasswordModal: (presentPasswordModal: boolean) => void;
  inputText: string;
  setInputText: (inputText: string) => void;
  submitFunction: () => void;
}

export function SettingsPasswordModal({
  presentPasswordModal,
  setPresentPasswordModal,
  inputText,
  setInputText,
  submitFunction
}: SettingsPasswordModalProps) {
  return (
    <ModalView
      show={presentPasswordModal}
      setShow={setPresentPasswordModal}
      backgroundColor={colors.primary}
      borderColor={colors.lightGray + "40"}
    >
      <Text type="header" color={colors.white}>
        Delete Account
      </Text>

      <View style={styles.container}>
        <Input
          placeholder="Password"
          value={inputText}
          onChangeText={setInputText}
          dark
          password
        />

        <Button
          text="Delete"
          color={colors.primaryTint}
          textColor={colors.white}
          onPress={() => {
            setPresentPasswordModal(false);
            submitFunction();
          }}
          leadingIcon="trash-alt"
        />
      </View>
    </ModalView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    width: "100%"
  }
});
