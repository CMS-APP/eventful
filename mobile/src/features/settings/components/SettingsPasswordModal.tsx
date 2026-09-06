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
      backgroundColor={colors.white}
      borderColor={colors.lightGray + "40"}
    >
      <Text type="header" color={colors.black}>
        Delete Account
      </Text>

      <View style={styles.container}>
        <Input
          placeholder="Password"
          value={inputText}
          onChangeText={setInputText}
          backgroundColor={colors.white}
          textColor={colors.black}
          password
        />

        <Button
          text="Delete"
          color={colors.primary}
          textColor={colors.white}
          onPress={() => {
            setPresentPasswordModal(false);
            submitFunction();
          }}
          leadingIcon="trash-alt"
        />

        <Button
          text="Cancel"
          color={colors.lightGray}
          textColor={colors.black}
          onPress={() => setPresentPasswordModal(false)}
          leadingIcon="times"
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
