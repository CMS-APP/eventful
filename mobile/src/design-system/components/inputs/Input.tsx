import React, { useRef, useState } from "react";

import {
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View
} from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";

import { textStyles } from "../../tokens/text";
import { InputAccessory } from "./InputAccessory";

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  backgroundColor?: string;
  textColor?: string;
  titleColor?: string | null;
  dark?: boolean;
  multilineProps?: {
    numberOfLines?: number;
    height?: number;
  };
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoCorrect?: boolean;
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
  password?: boolean;
  editable?: boolean;
  children?: React.ReactNode;
  flex?: boolean;
}

export function Input({
  placeholder,
  value,
  onChangeText,
  backgroundColor = colors.primaryTint3,
  textColor = colors.white,
  titleColor = null,
  dark = false,
  multilineProps,
  keyboardType = "default",
  autoCapitalize,
  autoCorrect,
  autoComplete,
  textContentType,
  password = false,
  editable = true,
  children,
  flex = false
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const accessoryId = useRef(`input-${placeholder}`).current;
  const isEmailInput = keyboardType === "email-address";
  const resolvedAutoCapitalize =
    autoCapitalize ?? (password || isEmailInput ? "none" : "sentences");
  const resolvedAutoCorrect = autoCorrect ?? !(password || isEmailInput);
  const resolvedAutoComplete =
    autoComplete ?? (password ? "password" : isEmailInput ? "email" : "off");
  const resolvedTextContentType =
    textContentType ??
    (password ? "password" : isEmailInput ? "emailAddress" : undefined);

  const inputContainerStyle = {
    ...styles.inputContainer,
    ...(!dark && card.small),
    backgroundColor: backgroundColor
  };

  const inputStyle = {
    ...styles.input,
    backgroundColor: backgroundColor,
    height: multilineProps?.height,
    color: textColor,
    textAlignVertical: multilineProps ? ("top" as const) : undefined
  };

  const titleTextColor = titleColor
    ? titleColor
    : dark
      ? colors.white
      : colors.black;

  return (
    <View
      style={[
        styles.container,
        flex && styles.flex,
        !editable && styles.noEditable
      ]}
    >
      <Text type="body" color={titleTextColor}>
        {placeholder}
      </Text>

      <View style={inputContainerStyle}>
        <View style={styles.inputContainerInner}>
          <TextInput
            multiline={!!multilineProps}
            numberOfLines={multilineProps?.numberOfLines}
            style={inputStyle}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.gray}
            inputAccessoryViewID={accessoryId}
            keyboardType={keyboardType}
            autoCapitalize={resolvedAutoCapitalize}
            autoCorrect={resolvedAutoCorrect}
            autoComplete={resolvedAutoComplete}
            textContentType={resolvedTextContentType}
            secureTextEntry={password && !showPassword}
            editable={editable}
          />
          {password && (
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={getHitSlop("small")}
            >
              <FontAwesome5
                name={showPassword ? "eye-slash" : "eye"}
                size={20}
                color={colors.gray}
              />
            </TouchableOpacity>
          )}
        </View>
        {children}
      </View>

      <InputAccessory
        key={placeholder}
        value={value}
        placeholder={placeholder}
        nativeID={accessoryId}
        password={password}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6
  },
  flex: {
    flex: 1
  },
  input: {
    flex: 1,
    fontFamily: "poppinsMediumItalic",
    fontSize: textStyles.body.fontSize,
    letterSpacing: 1,
    paddingVertical: 16,
    textTransform: "none"
  },
  inputContainer: {
    borderRadius: 12,
    paddingHorizontal: 12
  },
  inputContainerInner: {
    alignItems: "center",
    flexDirection: "row"
  },
  noEditable: {
    opacity: 0.5
  }
});
