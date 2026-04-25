import Collapsible from "react-native-collapsible";

import { useState } from "react";

import { StyleSheet, View } from "react-native";

import { Button } from "@/components/buttons/Button";
import { colors } from "@/styles/colors";

import { DropdownButton } from "./DropdownButton";
import { FeedbackModal } from "./FeedbackModal";

export function FeedbackButtons() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const toggleFeedback = () => setFeedbackOpen(!feedbackOpen);

  const [feedbackType, setFeedbackType] = useState("");
  const [presentModal, setPresentModal] = useState(false);

  function featureRequest() {
    setFeedbackType("Feature Request");
    setPresentModal(true);
  }

  function reportBug() {
    setFeedbackType("Report Bug");
    setPresentModal(true);
  }

  return (
    <View style={styles.container}>
      <FeedbackModal
        title={feedbackType}
        presentModal={presentModal}
        setPresentModal={setPresentModal}
      />

      <DropdownButton
        isDropdownClosed={!feedbackOpen}
        toggleDropdown={toggleFeedback}
        title="App Feedback"
      />

      <Collapsible collapsed={!feedbackOpen}>
        <View style={styles.buttonColumn}>
          <Button
            text="Feature Request"
            color={colors.primaryTint3}
            textColor={colors.white}
            icon="lightbulb"
            onPress={featureRequest}
          />

          <Button
            text="Report Bug"
            color={colors.primaryTint3}
            textColor={colors.white}
            icon="bug"
            onPress={reportBug}
          />
        </View>
      </Collapsible>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonColumn: {
    gap: 12,
    marginBottom: 6,
    marginTop: 6
  },
  container: {
    gap: 6,
    marginTop: 6
  }
});
