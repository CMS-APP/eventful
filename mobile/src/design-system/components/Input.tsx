import React, { useRef, useState } from "react";

import {
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";

import { textStyles } from "../tokens/text";
import { InputAccessory } from "./InputAccessory";

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  backgroundColor?: string;
  textColor?: string;
  dark?: boolean;
  multilineProps?: {
    numberOfLines?: number;
    height?: number;
  };
  keyboardType?: KeyboardTypeOptions;
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
  dark = false,
  multilineProps,
  keyboardType = "default",
  password = false,
  editable = true,
  children,
  flex = false
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const accessoryId = useRef(`input-${placeholder}`).current;

  const inputContainerStyle = {
    ...styles.inputContainer,
    backgroundColor: backgroundColor
  };

  const inputStyle = {
    ...styles.input,
    backgroundColor: backgroundColor,
    height: multilineProps?.height,
    color: textColor
  };

  return (
    <View
      style={[
        styles.container,
        flex && styles.flex,
        !editable && styles.noEditable
      ]}
    >
      <Text type="body" color={dark ? colors.white : colors.black}>
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
    ...textStyles.body,
    color: colors.white,
    flex: 1,
    fontStyle: "italic",
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
