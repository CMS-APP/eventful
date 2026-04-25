import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  TextInput
} from "react-native";

import { InputAccessory } from "@/components/inputs/InputAccessory";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";

interface EventBudgetInputProps {
  placeholder: string;
  value: string;
  premium: boolean;
  handlePaywallPress: () => void;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  preserveCase?: boolean;
}

export function EventBudgetInput({
  placeholder,
  value,
  premium,
  handlePaywallPress,
  onChangeText,
  keyboardType = "default",
  preserveCase = false
}: EventBudgetInputProps) {
  const accessoryId = `budget_${placeholder.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  return (
    <>
      <Pressable onPress={!premium ? handlePaywallPress : undefined}>
        <TextInput
          editable={premium}
          inputAccessoryViewID={accessoryId}
          pointerEvents={premium ? "auto" : "none"}
          placeholder={placeholder}
          placeholderTextColor={colors.lightGray}
          style={[
            globalStyles.smallWidget,
            styles.textInput,
            {
              backgroundColor: colors.primaryTint,
              color: colors.white
            },
            preserveCase && styles.preserveCase
          ]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
      </Pressable>

      <InputAccessory
        key={placeholder}
        value={value}
        placeholder={placeholder}
        nativeID={accessoryId}
      />
    </>
  );
}

const styles = StyleSheet.create({
  preserveCase: {
    textTransform: "none"
  },
  textInput: {
    backgroundColor: colors.primaryTint,
    color: colors.white,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase"
  }
});
