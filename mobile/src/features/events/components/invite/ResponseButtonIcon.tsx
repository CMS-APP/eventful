import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { haptics } from "@/utils/haptics";

interface ResponseButtonIconProps {
  icon: keyof typeof FontAwesome5.glyphMap;
  pressedIcon: keyof typeof FontAwesome5.glyphMap;
  title: string;
  color: string;
  updateResponse: (title: string) => void;
  disabled?: boolean;
  response: string;
}

export function ResponseButtonIcon({
  icon,
  pressedIcon,
  title,
  color,
  updateResponse,
  disabled = false,
  response
}: ResponseButtonIconProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          haptics.soft();
          updateResponse(title);
        }}
        disabled={disabled}
        hitSlop={getHitSlop("small")}
      >
        <FontAwesome5
          name={title !== response ? icon : pressedIcon}
          size={50}
          color={title === response ? color : colors.gray}
        />
      </TouchableOpacity>

      <Text type="body" style={styles.title}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 12,
    width: 60
  },
  title: {
    fontSize: 10,
    textAlign: "center"
  }
});
