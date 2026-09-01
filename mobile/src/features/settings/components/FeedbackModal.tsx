import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { Alert } from "react-native";

import { Button } from "@/design-system/components/buttons/Button";
import { Input } from "@/design-system/components/inputs/Input";
import { ModalView } from "@/design-system/components/overlays/ModalView";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { trackFeedbackSubmitted } from "@/services/analytics/events";
import { sendFeedbackToDatabase } from "@/services/firebase/user";
import { UserState } from "@/store/UserSlice";
import { User } from "@/types/User";

interface FeedbackModalProps {
  title: string;
  presentModal: boolean;
  setPresentModal: (presentModal: boolean) => void;
}

export function FeedbackModal({
  title,
  presentModal,
  setPresentModal
}: FeedbackModalProps) {
  const [inputText, setInputText] = useState("");

  const email = useSelector((state: UserState) => state.email);
  const userId = useSelector((state: UserState) => state.uid);
  const name = useSelector((state: UserState) => state.name);
  const username = useSelector((state: UserState) => state.username);

  const handleSubmit = useCallback(() => {
    if (inputText.trim() === "") {
      Alert.alert("No Input Text", "Please enter some feedback");
      return;
    }

    sendFeedbackToDatabase(
      { uid: userId, email, name, username } as User,
      title,
      inputText
    );
    trackFeedbackSubmitted(title);
    setPresentModal(false);
    setInputText("");

    Alert.alert("Feedback Sent", "Thank you for your feedback!");
  }, [inputText, userId, email, name, username, title, setPresentModal]);

  return (
    <ModalView
      show={presentModal}
      setShow={setPresentModal}
      backgroundColor={colors.primary}
      borderColor={colors.lightGray + "40"}
    >
      <Text type="header" color={colors.white}>
        {title}
      </Text>

      <Input
        placeholder={title}
        value={inputText}
        onChangeText={setInputText}
        dark
        multilineProps={{
          numberOfLines: 10,
          height: 200
        }}
      />

      <Button
        text="Submit"
        color={colors.primaryTint}
        textColor={colors.white}
        onPress={handleSubmit}
        leadingIcon="paper-plane"
      />
    </ModalView>
  );
}
