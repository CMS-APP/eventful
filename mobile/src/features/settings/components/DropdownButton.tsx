import { useEffect, useRef } from "react";

import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { haptics } from "@/utils/haptics";

interface DropdownButtonProps {
  isDropdownClosed: boolean;
  toggleDropdown: () => void;
  title: string;
  backgroundColor?: string;
}

export function DropdownButton({
  isDropdownClosed,
  toggleDropdown,
  title,
  backgroundColor = colors.primaryTint
}: DropdownButtonProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: isDropdownClosed ? 0 : 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [isDropdownClosed, rotation]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["-90deg", "0deg"]
  });

  function handlePress() {
    toggleDropdown();
    haptics.soft();
  }

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={getHitSlop("small")}>
      <View style={[styles.buttonStyle, { backgroundColor: backgroundColor }]}>
        <Text type="subHeader" color={colors.white} style={styles.title}>
          {title}
        </Text>

        <Animated.View
          style={[
            styles.animatedIcon,
            { transform: [{ rotate: rotateInterpolate }] }
          ]}
        >
          <FontAwesome5 name="chevron-down" size={20} color={colors.white} />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  animatedIcon: {
    transform: [{ rotate: "0deg" }]
  },
  buttonStyle: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    padding: 16
  },
  title: {
    color: colors.white
  }
});
