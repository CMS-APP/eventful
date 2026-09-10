import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";

export interface BudgetSegment {
  color: string;
  value: number;
}

interface BudgetSegmentedBarProps {
  segments: BudgetSegment[];
  denominator: number;
  trackColor?: string;
  height?: number;
}

export function BudgetSegmentedBar({
  segments,
  denominator,
  trackColor = colors.lightGray,
  height = 8
}: BudgetSegmentedBarProps) {
  const visibleSegments = segments.filter((segment) => segment.value > 0);
  const usedValue = visibleSegments.reduce(
    (sum, segment) => sum + segment.value,
    0
  );
  const unspentValue = Math.max(denominator - usedValue, 0);

  const spentFlex = (segment: BudgetSegment) => {
    return denominator > 0 ? segment.value / denominator : 1;
  };

  const unspentFlex = denominator > 0 ? unspentValue / denominator : 0;

  return (
    <View style={[styles.container, { height }]}>
      {visibleSegments.map((segment, index) => (
        <View
          key={`${segment.color}-${index}`}
          style={[
            styles.segment,
            {
              flex: spentFlex(segment),
              backgroundColor: segment.color,
              height
            }
          ]}
        />
      ))}

      {unspentValue > 0 && (
        <View
          style={[
            styles.segment,
            {
              flex: unspentFlex,
              backgroundColor: trackColor,
              height
            }
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 4,
    width: "100%"
  },
  segment: {
    borderRadius: 8
  }
});
