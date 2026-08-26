import { useCallback, useEffect, useState } from "react";

import { Keyboard } from "react-native";

import { ModalView } from "@/components/views/ModalView";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";

interface PhotoBoothUnlockModalProps {
  locked: boolean;
  setLocked: (locked: boolean) => void;
  presentModal: boolean;
  setPresentModal: (presentModal: boolean) => void;
  lockPin: string;
  setLockPin: (lockPin: string) => void;
}

export function PhotoBoothUnlockModal({
  locked,
  setLocked,
  presentModal,
  setPresentModal,
  lockPin,
  setLockPin
}: PhotoBoothUnlockModalProps) {
  const [input, setInput] = useState("");

  const unlockButtonAction = useCallback(() => {
    if (lockPin.length !== 4) {
      alert("Please enter a 4 digit pin.");
      return;
    }

    if (input !== lockPin) {
      alert("Incorrect pin.");
      return;
    }

    setLockPin("");
    setInput("");
    setLocked(false);
    setPresentModal(false);
  }, [lockPin, input, setLockPin, setInput, setLocked, setPresentModal]);

  useEffect(() => {
    if (input.length === 4) {
      Keyboard.dismiss();
      unlockButtonAction();
    }
  }, [input, unlockButtonAction]);

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
        Unlock
      </Text>

      <Input
        placeholder="Enter Pin"
        value={input}
        onChangeText={setInput}
        keyboardType="number-pad"
        password
        dark
      />

      <Button
        text="Unlock"
        icon="unlock"
        onPress={unlockButtonAction}
        color={colors.primaryTint}
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
