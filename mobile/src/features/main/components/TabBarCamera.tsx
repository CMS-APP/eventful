import { Animated, StyleSheet } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { colors } from "@/design-system/tokens/colors";

import { RAISED_CIRCLE_SIZE, RAISED_CIRCLE_TOP_OFFSET } from "./TabBarBorder";

interface TabBarCameraProps {
  scale: Animated.Value;
  hasAccess: boolean;
}

export function TabBarCamera({ scale, hasAccess }: TabBarCameraProps) {
  return (
    <Animated.View
      style={[
        styles.raisedCircle,
        { backgroundColor: hasAccess ? colors.secondary : colors.gray },
        { transform: [{ scale }] }
      ]}
    >
      <FontAwesome5 name="camera" size={24} color={colors.white} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  raisedCircle: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.secondary,
    borderRadius: RAISED_CIRCLE_SIZE / 2,
    height: RAISED_CIRCLE_SIZE,
    justifyContent: "center",
    position: "absolute",
    top: -RAISED_CIRCLE_TOP_OFFSET,
    width: RAISED_CIRCLE_SIZE
  }
});
