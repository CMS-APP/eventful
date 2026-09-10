import { StyleSheet, TouchableOpacity } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { haptics } from "@/utils/haptics";

interface InviteRSVPButtonProps {
  icon: keyof typeof FontAwesome5.glyphMap;
  label: string;
  value: string;
  color: string;
  response: string;
  updateResponse: (value: string) => void;
}

export function InviteRSVPButton({
  icon,
  label,
  value,
  color,
  response,
  updateResponse
}: InviteRSVPButtonProps) {
  const selected = response === value;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && { backgroundColor: color, borderColor: color }
      ]}
      onPress={() => {
        haptics.soft();
        updateResponse(value);
      }}
      hitSlop={getHitSlop("small")}
    >
      <FontAwesome5
        name={icon}
        size={22}
        color={selected ? colors.white : color}
      />
      <Text
        type="caption"
        color={selected ? colors.white : colors.black}
        center
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...card.small,
    alignItems: "center",
    flex: 1,
    gap: 8,
    justifyContent: "center",
    paddingVertical: 20
  }
});
