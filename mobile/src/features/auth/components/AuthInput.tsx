import { useState } from "react";

import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View
} from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

type AuthInputProps = Pick<
  TextInputProps,
  | "value"
  | "onChangeText"
  | "placeholder"
  | "keyboardType"
  | "autoCapitalize"
  | "autoComplete"
  | "textContentType"
  | "returnKeyType"
  | "onSubmitEditing"
  | "editable"
> & {
  label: string;
  error?: string;
  secure?: boolean;
  prefix?: string;
};

export function AuthInput({
  label,
  error,
  secure = false,
  prefix,
  ...inputProps
}: AuthInputProps) {
  const [hidden, setHidden] = useState(secure);

  return (
    <View style={styles.container}>
      <Text type="body" color={colors.primary}>
        {label}
      </Text>
      <View>
        {prefix && (
          <View style={styles.prefix} pointerEvents="none">
            <Text type="body" italic color={colors.primaryTint3}>
              {prefix}
            </Text>
          </View>
        )}
        <TextInput
          {...inputProps}
          secureTextEntry={hidden}
          autoCorrect={false}
          placeholderTextColor={colors.primaryTint3}
          style={[
            styles.input,
            secure && styles.inputWithToggle,
            prefix ? styles.inputWithPrefix : undefined,
            error ? styles.inputError : undefined
          ]}
        />
        {secure && (
          <TouchableOpacity
            onPress={() => setHidden(!hidden)}
            style={styles.toggle}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
          >
            <FontAwesome5
              name={hidden ? "eye" : "eye-slash"}
              size={14}
              color={colors.primaryTint3}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text type="caption" color={colors.red}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6
  },
  input: {
    backgroundColor: colors.primaryTint + "33",
    borderColor: colors.lightGray,
    borderRadius: 12,
    borderWidth: 0.5,
    color: colors.primary,
    fontFamily: "poppinsMediumItalic",
    fontSize: 13,
    height: 48,
    letterSpacing: 1,
    paddingHorizontal: 14
  },
  inputError: {
    borderColor: colors.red,
    borderWidth: 1
  },
  inputWithPrefix: {
    paddingLeft: 30
  },
  inputWithToggle: {
    paddingRight: 48
  },
  prefix: {
    bottom: 0,
    justifyContent: "center",
    left: 14,
    position: "absolute",
    top: 0,
    zIndex: 1
  },
  toggle: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    position: "absolute",
    right: 2,
    top: 2,
    width: 44
  }
});
