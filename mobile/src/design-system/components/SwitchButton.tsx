import { useCallback } from "react";

import { StyleSheet, Switch, TouchableOpacity, View } from "react-native";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { haptics } from "@/utils/haptics";

interface SwitchButtonProps {
  title: string;
  isChecked: boolean;
  onChange: () => void;
  dark?: boolean;
}

export function SwitchButton({
  title,
  isChecked,
  onChange,
  dark = false
}: SwitchButtonProps) {
  const handlePress = useCallback(() => {
    haptics.soft();
    onChange();
  }, [onChange]);

  const textColor = dark ? colors.white : colors.black;
  const backgroundColor = dark ? colors.primaryTint3 : colors.lightGray;

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={getHitSlop("medium")}>
      <View style={styles.switchButton}>
        <View style={[styles.switchContainer, { backgroundColor }]}>
          <Text
            type="body"
            italic
            style={[styles.switchText, { color: textColor }]}
          >
            {title}
          </Text>
        </View>
        <View style={[styles.switchToggle, { backgroundColor }]}>
          <Switch
            value={isChecked}
            onValueChange={handlePress}
            trackColor={{ true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  switchButton: {
    alignItems: "stretch",
    flexDirection: "row",
    gap: 12
  },
  switchContainer: {
    backgroundColor: colors.primaryTint3,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  switchText: {
    textAlign: "center"
  },
  switchToggle: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 12
  }
});
