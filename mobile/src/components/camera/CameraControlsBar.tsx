import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { ReactNode } from "react";

import { StyleSheet, View } from "react-native";

interface CameraControlsBarProps {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}

export function CameraControlsBar({
  left,
  center,
  right
}: CameraControlsBarProps) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={[styles.container, { marginBottom: bottom + 12 }]}>
      <View style={styles.column}>{left}</View>
      <View style={styles.center}>{center}</View>
      <View style={styles.column}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1
  },
  column: {
    gap: 16
  },
  container: {
    alignItems: "flex-end",
    bottom: 0,
    flexDirection: "row",
    gap: 24,
    left: 0,
    paddingHorizontal: 24,
    position: "absolute",
    right: 0,
    width: "100%"
  }
});
