import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { BudgetSummary } from "@/features/events/utils/budget";
import { getCurrencySymbolForDevice } from "@/utils/currency";

import { BudgetSegmentedBar } from "./BudgetSegmentedBar";

interface BudgetSpendCardProps {
  title: string;
  color: string;
  spent: number;
  summary: BudgetSummary;
}

const OTHER_ESSENTIALS_COLOR = colors.primaryTint2;

export function BudgetSpendCard({
  title,
  color,
  spent,
  summary
}: BudgetSpendCardProps) {
  const currency = getCurrencySymbolForDevice();
  const percentOfEvent =
    summary.totalSpent > 0 ? Math.round((spent / summary.totalSpent) * 100) : 0;
  const otherEssentials = Math.max(summary.totalSpent - spent, 0);
  const denominator = Math.max(summary.totalSpent, summary.budgetMaximum);

  const segments = [
    { color, value: spent },
    { color: OTHER_ESSENTIALS_COLOR, value: otherEssentials }
  ];

  if (summary.overBudget) {
    segments.push({ color: colors.tertiary, value: summary.overAmount });
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.spendColumn}>
          <Text type="caption" color={colors.gray}>
            {title.toUpperCase()} SPEND
          </Text>
          <Text type="title" color={colors.primary} style={styles.amount}>
            {currency}
            {spent}
          </Text>
        </View>

        <View style={styles.overallColumn}>
          <Text type="caption" color={colors.gray}>
            {percentOfEvent}% OF EVENT
          </Text>
          <Text
            type="caption"
            color={summary.overBudget ? colors.tertiary : colors.gray}
          >
            {summary.overBudget ? "-" : ""}
            {currency}
            {Math.abs(summary.remaining)} LEFT OVERALL
          </Text>
        </View>
      </View>

      <BudgetSegmentedBar segments={segments} denominator={denominator} />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text type="caption" color={colors.gray}>
            {title.toUpperCase()}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.dot, { backgroundColor: OTHER_ESSENTIALS_COLOR }]}
          />
          <Text type="caption" color={colors.gray}>
            OTHER ESSENTIALS
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.lightGray }]} />
          <Text type="caption" color={colors.gray}>
            UNSPENT
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  amount: {
    textAlign: "left"
  },
  container: {
    ...card.medium,
    gap: 16,
    padding: 20
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  overallColumn: {
    alignItems: "flex-end",
    gap: 4
  },
  spendColumn: {
    gap: 4
  },
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between"
  }
});
