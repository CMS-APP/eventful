import { useCallback } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/components/text/Text";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";

interface NewEventButtonProps {
  buttonAction: () => void;
}

export function NewEventButton({ buttonAction }: NewEventButtonProps) {
  const handlePress = useCallback(() => {
    buttonAction();
    haptics.soft();
  }, [buttonAction]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.flex1}
      hitSlop={getHitSlop("large")}
    >
      <View style={styles.container}>
        <FontAwesome5 name="calendar-plus" size={50} color={colors.white} />
        <Text type="subHeader" color={colors.white}>
          New Event
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...globalStyles.largeWidget,
    backgroundColor: colors.primary,
    flex: 1,
    gap: 12
  },
  flex1: {
    flex: 1
  }
});
