import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";

interface InviteMenuRowProps {
  icon: keyof typeof FontAwesome5.glyphMap;
  text: string;
  onPress: () => void;
}

export function InviteMenuRow({ icon, text, onPress }: InviteMenuRowProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      hitSlop={getHitSlop("small")}
    >
      <View style={styles.iconCircle}>
        <FontAwesome5 name={icon} size={16} color={colors.primary} />
      </View>

      <Text type="subHeader" color={colors.black} style={styles.label}>
        {text}
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
    padding: 16
  },
  iconCircle: {
    ...card.small,
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  label: {
    flex: 1
  }
});
