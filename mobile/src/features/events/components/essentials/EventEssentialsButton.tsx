import { useCallback } from "react";

import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { padding } from "@/design-system/tokens/padding";
import { haptics } from "@/utils/haptics";

interface EventEssentialsButtonProps {
  title: string;
  image: ImageSourcePropType;
  onPress: () => void;
}

export function EventEssentialsButton({
  title,
  image,
  onPress
}: EventEssentialsButtonProps) {
  const handlePress = useCallback(() => {
    haptics.soft();
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.flexContainer}
      hitSlop={getHitSlop("medium")}
    >
      <View style={styles.button}>
        <Text type="subHeader" style={styles.title}>
          {title}
        </Text>
        <Image source={image} style={styles.image} tintColor={colors.black} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    ...padding.mediumWidget,
    backgroundColor: colors.lightGray,
    gap: 12,
    padding: 12
  },
  flexContainer: {
    flex: 1
  },
  image: {
    height: 100,
    tintColor: colors.black,
    width: 100
  },
  title: {
    color: colors.black
  }
});
