import { useCallback } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { haptics } from "@/utils/haptics";

interface QuickAddButtonProps {
  title: string;
  onPress: () => void;
}

export function QuickAddButton({ title, onPress }: QuickAddButtonProps) {
  const handlePress = useCallback(() => {
    haptics.soft();
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={getHitSlop("small")}>
      <View style={styles.container}>
        <Text type="body" color="white" center>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryTint3,
    borderRadius: 12,
    padding: 12
  }
});
