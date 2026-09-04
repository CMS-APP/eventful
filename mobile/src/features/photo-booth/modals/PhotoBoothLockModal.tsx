import { useEffect, useState } from "react";

import { Keyboard } from "react-native";

import { Button } from "@/design-system/components/buttons/Button";
import { Input } from "@/design-system/components/inputs/Input";
import { ModalView } from "@/design-system/components/overlays/ModalView";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

interface PhotoBoothLockModalProps {
  locked: boolean;
  setLocked: (locked: boolean) => void;
  presentModal: boolean;
  setPresentModal: (presentModal: boolean) => void;
  lockPin: string;
  setLockPin: (lockPin: string) => void;
}

export function PhotoBoothLockModal({
  locked,
  setLocked,
  presentModal,
  setPresentModal,
  lockPin,
  setLockPin
}: PhotoBoothLockModalProps) {
  const [input, setInput] = useState("");

  useEffect(() => {
    if (input.length === 4) {
      Keyboard.dismiss();
    }
  }, [input]);

  function lockButtonAction() {
    if (input.length !== 4) {
      alert("Please enter a 4 digit pin.");
      return;
    }

    setLockPin(input);
    setInput("");
    setLocked(true);
    setPresentModal(false);
  }

  useEffect(() => {
    if (presentModal) {
      setInput("");
    }
  }, [presentModal]);

  return (
    <ModalView
      show={presentModal}
      setShow={setPresentModal}
      backgroundColor={colors.white}
      borderColor={colors.lightGray + "40"}
    >
      <Text type="header" color={colors.black}>
        {locked ? "Unlock" : "Lock"} Photo Booth
      </Text>

      <Input
        placeholder="Pin"
        value={input}
        onChangeText={setInput}
        keyboardType="number-pad"
        password
        backgroundColor={colors.lightGray}
        textColor={colors.black}
      />

      <Button
        text="Lock"
        onPress={lockButtonAction}
        color={colors.primary}
        leadingIcon="lock"
        textColor={colors.white}
      />

      <Button
        text="Cancel"
        onPress={() => setPresentModal(false)}
        color={colors.lightGray}
        textColor={colors.black}
      />
    </ModalView>
  );
}
