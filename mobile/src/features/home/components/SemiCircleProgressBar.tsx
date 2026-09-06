import Svg, { Path } from "react-native-svg";

import { StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

interface SemiCircleProgressBarProps {
  percentage: number;
  title: string;
  showProgress: boolean;
  colorScheme: string[];
}

export function SemiCircleProgressBar({
  percentage = 60,
  title,
  showProgress = true,
  colorScheme = [colors.primary, colors.primaryTint, colors.transparent]
}: SemiCircleProgressBarProps) {
  const firstArc = { startAngle: -90, endAngle: 1.8 * percentage - 90 };
  const secondArc = { startAngle: 1.8 * percentage - 90, endAngle: 90 };
  const thirdArc = {
    startAngle: 1.8 * percentage - 92,
    endAngle: 1.8 * percentage - 88
  };

  let arcs = [firstArc, secondArc, thirdArc];

  if (percentage > 98) {
    arcs = [firstArc];
  }

  return (
    <View style={styles.mainContainer}>
      {title && (
        <View style={styles.titleContainer}>
          <FontAwesome5 name="clock" size={14} color={colors.black} />
          <Text type="body" color={colors.black}>
            Progress
          </Text>
        </View>
      )}
      <ArcComponent
        arcs={arcs}
        radius={30}
        strokeColors={colorScheme}
        strokeWidth={10}
      />
      {showProgress && (
        <Text type="header" color={colors.black} style={styles.progressText}>
          {`${parseInt(percentage.toString())}%`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  arcContainer: {
    height: 45,
    marginTop: 12
  },
  mainContainer: {
    alignItems: "center",
    gap: 0,
    marginVertical: 20
  },
  progressText: {
    bottom: -10,
    position: "absolute",
    top: null,
    transform: [{ translateX: 2.5 }]
  },
  titleContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  }
});

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  const d = [
    `M ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
  ].join(" ");

  return d;
}

function ArcComponent({
  arcs,
  radius,
  strokeColors,
  strokeWidth
}: {
  arcs: { startAngle: number; endAngle: number }[];
  radius: number;
  strokeColors: string[];
  strokeWidth: number;
}) {
  const centerX = 100;
  const centerY = 36;

  return (
    <View style={styles.arcContainer}>
      <Svg viewBox="50 0 100 100" width="125" height="125">
        {arcs.map((arc, index) => (
          <Path
            key={`arc-${index}`}
            d={describeArc(
              centerX,
              centerY,
              radius,
              arc.startAngle,
              arc.endAngle
            )}
            fill="none"
            stroke={strokeColors[index]}
            strokeWidth={
              index === arcs.length - 1 ? strokeWidth + 1 : strokeWidth
            }
          />
        ))}
      </Svg>
    </View>
  );
}
