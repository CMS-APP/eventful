import { Animated, StyleSheet } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";

import { RAISED_CIRCLE_SIZE, RAISED_CIRCLE_TOP_OFFSET } from "./TabBarBorder";

const CROWN_BADGE_SIZE = 20;

interface TabBarCameraProps {
  scale: Animated.Value;
  hasAccess: boolean;
  isFocused: boolean;
}

export function TabBarCamera({
  scale,
  hasAccess,
  isFocused
}: TabBarCameraProps) {
  const fillColor = colors.white;
  const glyphColor = isFocused ? colors.secondary : colors.black;

  return (
    <Animated.View
      style={[
        styles.raisedCircle,
        { backgroundColor: fillColor },
        { transform: [{ scale }] }
      ]}
    >
      <FontAwesome5 name="camera" size={24} color={glyphColor} />

      {!hasAccess && (
        <Animated.View style={styles.crownBadge}>
          <FontAwesome5 name="crown" size={10} color={colors.secondary} />
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  crownBadge: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: CROWN_BADGE_SIZE / 2,
    height: CROWN_BADGE_SIZE,
    justifyContent: "center",
    position: "absolute",
    right: -4,
    top: -4,
    width: CROWN_BADGE_SIZE
  },
  raisedCircle: {
    ...card.medium,
    alignItems: "center",
    alignSelf: "center",
    borderRadius: RAISED_CIRCLE_SIZE / 2,
    height: RAISED_CIRCLE_SIZE,
    justifyContent: "center",
    position: "absolute",
    top: -RAISED_CIRCLE_TOP_OFFSET,
    width: RAISED_CIRCLE_SIZE
  }
});
