import Svg, { Path } from "react-native-svg";

import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";

interface ArcCutoutProps {
  color?: string;
  rotation?: number;
  position?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export function ArcCutout({
  color = colors.white,
  rotation = 90,
  position = { top: 0, right: 0 }
}: ArcCutoutProps) {
  return (
    <View style={[styles.container, position]}>
      <Svg
        height="40"
        width="40"
        style={{ transform: [{ rotate: `${rotation}deg` }] }}
      >
        <Path d="M0,0 A40,40 0 0,1 40,40 L40,0 Z" fill={color} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    position: "absolute",
    zIndex: 1000
  }
});
