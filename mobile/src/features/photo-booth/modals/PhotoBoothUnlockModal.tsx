import { useCallback, useEffect, useState } from "react";

import { Keyboard } from "react-native";

import { Button } from "@/design-system/components/buttons/Button";
import { Input } from "@/design-system/components/inputs/Input";
import { ModalView } from "@/design-system/components/overlays/ModalView";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

interface PhotoBoothUnlockModalProps {
  setLocked: (locked: boolean) => void;
  presentModal: boolean;
  setPresentModal: (presentModal: boolean) => void;
  lockPin: string;
  setLockPin: (lockPin: string) => void;
}

export function PhotoBoothUnlockModal({
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
      backgroundColor={colors.white}
      borderColor={colors.lightGray + "40"}
    >
      <Text type="header" color={colors.black}>
        Unlock
      </Text>

      <Input
        placeholder="Enter Pin"
        value={input}
        onChangeText={setInput}
        keyboardType="number-pad"
        password
        backgroundColor={colors.lightGray}
        textColor={colors.black}
      />

      <Button
        text="Unlock"
        leadingIcon="unlock"
        onPress={unlockButtonAction}
        color={colors.primary}
        textColor={colors.white}
      />

      <Button
        text="Cancel"
        onPress={() => setPresentModal(false)}
        color={colors.white}
        textColor={colors.black}
      />
    </ModalView>
  );
}
