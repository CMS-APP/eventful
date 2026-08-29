import { StyleSheet, View } from "react-native";

import { Button } from "@/design-system/components/buttons/Button";
import { TextButton } from "@/design-system/components/buttons/TextButton";
import { colors } from "@/design-system/tokens/colors";

interface OnboardingButtonsProps {
  exit: () => void;
  next: () => void;
  nextText?: string;
  backText?: string;
}

export function OnboardingButtons({
  exit,
  next,
  nextText = "Next",
  backText = "Cancel"
}: OnboardingButtonsProps) {
  return (
    <View style={styles.container}>
      <Button
        text={nextText}
        color={colors.secondary}
        textColor={colors.white}
        onPress={next}
        leadingIcon="arrow-right"
      />

      <TextButton
        text={backText}
        onPress={exit}
        textColor={colors.white}
        textAlign="left"
        type="body"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    marginHorizontal: 20
  }
});
