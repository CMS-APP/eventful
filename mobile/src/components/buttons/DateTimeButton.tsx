import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { globalStyles } from "@/design-system/tokens/globalStyles";
import { formatDate, formatTime } from "@/utils/date";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";

interface DateTimeButtonProps {
  date: Date;
  onPress: () => void;
  title: string;
  type: "Date" | "Time";
  dark?: boolean;
}

export function DateTimeButton({
  date,
  onPress,
  title,
  type,
  dark = false
}: DateTimeButtonProps) {
  const handlePress = () => {
    haptics.soft();
    onPress();
  };

  const textColor = dark ? colors.white : colors.black;

  return (
    <View style={styles.flex1}>
      <Text type="body" color={textColor}>
        {title}
      </Text>

      <TouchableOpacity onPress={handlePress} hitSlop={getHitSlop("small")}>
        <View style={[globalStyles.largeWidget, styles.button]}>
          <Text type="body" italic color={textColor}>
            {type === "Time" ? formatTime(date) : formatDate(date)}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primaryTint3,
    borderRadius: 12,
    padding: 12
  },
  flex1: {
    flex: 1,
    gap: 6
  }
});
