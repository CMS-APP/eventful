import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";

interface EventInviteMoreRowProps {
  icon: keyof typeof FontAwesome5.glyphMap;
  label: string;
  count: number;
  onPress: () => void;
}

export function EventInviteMoreRow({
  icon,
  label,
  count,
  onPress
}: EventInviteMoreRowProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      hitSlop={getHitSlop("small")}
    >
      <View style={styles.iconCircle}>
        <FontAwesome5 name={icon} size={16} color={colors.white} />
      </View>

      <Text type="subHeader" color={colors.black} style={styles.label}>
        {label}
      </Text>

      <Text type="body" color={colors.gray}>
        {count}
      </Text>

      <FontAwesome5 name="chevron-right" size={14} color={colors.gray} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...card.small,
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    padding: 8
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  label: {
    flex: 1,
    textAlign: "left"
  }
});
