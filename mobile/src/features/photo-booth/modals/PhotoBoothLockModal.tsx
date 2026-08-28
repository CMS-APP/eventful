import { useEffect, useState } from "react";

import { Keyboard } from "react-native";

import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { ModalView } from "@/design-system/components/ModalView";
import { Text } from "@/design-system/components/Text";
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
      backgroundColor={colors.primary}
      borderColor={colors.lightGray + "40"}
    >
      <Text type="header" color="white">
        Lock
      </Text>

      <Input
        placeholder="Pin"
        value={input}
        onChangeText={setInput}
        keyboardType="number-pad"
        password
        dark
      />

      <Button
        text="Lock"
        onPress={lockButtonAction}
        color={colors.primaryTint}
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
