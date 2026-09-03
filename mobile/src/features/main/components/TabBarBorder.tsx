import Svg, { Path } from "react-native-svg";

import { StyleSheet } from "react-native";

import { colors } from "@/design-system/tokens/colors";

export const RAISED_CIRCLE_SIZE = 52;
export const RAISED_CIRCLE_TOP_OFFSET = 8;

const NOTCH_GAP = 6;
const NOTCH_STROKE_WIDTH = 2;
const NOTCH_PADDING = NOTCH_STROKE_WIDTH;

const BUTTON_RADIUS = RAISED_CIRCLE_SIZE / 2;
const BUTTON_CENTER_Y = BUTTON_RADIUS - RAISED_CIRCLE_TOP_OFFSET;
const NOTCH_RADIUS = BUTTON_RADIUS + NOTCH_GAP;
const NOTCH_DEPTH = NOTCH_RADIUS - BUTTON_CENTER_Y;
const NOTCH_HALF = Math.sqrt(
  NOTCH_RADIUS * NOTCH_RADIUS - BUTTON_CENTER_Y * BUTTON_CENTER_Y
);

function getNotchGeometry(width: number) {
  const cx = width / 2;
  const left = cx - NOTCH_HALF;
  const right = cx + NOTCH_HALF;
  const base = NOTCH_DEPTH + NOTCH_PADDING;

  return { left, right, base };
}

function buildNotchStrokePath(width: number) {
  const { left, right, base } = getNotchGeometry(width);

  return [
    `M0,${base}`,
    `L${left},${base}`,
    `A${NOTCH_RADIUS},${NOTCH_RADIUS} 0 0,1 ${right},${base}`,
    `L${width},${base}`
  ].join(" ");
}

function buildNotchFillPath(width: number) {
  const { left, right, base } = getNotchGeometry(width);

  return [
    `M${left},${base}`,
    `A${NOTCH_RADIUS},${NOTCH_RADIUS} 0 0,1 ${right},${base}`,
    "Z"
  ].join(" ");
}

interface TabBarBorderProps {
  width: number;
}

export function TabBarBorder({ width }: TabBarBorderProps) {
  return (
    <Svg
      style={styles.notchLine}
      width={width}
      height={NOTCH_DEPTH + NOTCH_PADDING * 2}
      pointerEvents="none"
    >
      <Path d={buildNotchFillPath(width)} fill={colors.white} />
      <Path
        d={buildNotchStrokePath(width)}
        stroke={colors.lightGray}
        strokeWidth={NOTCH_STROKE_WIDTH}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  notchLine: {
    left: 0,
    position: "absolute",
    top: -(NOTCH_DEPTH + NOTCH_PADDING)
  }
});
