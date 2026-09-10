import { useCallback, useState } from "react";

import {
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import {
  CATEGORY_CONFIG,
  getBudgetSummary
} from "@/features/events/utils/budget";
import { Event } from "@/types/Event";
import { getCurrencySymbolForDevice } from "@/utils/currency";

import { BudgetMaxEditModal } from "./BudgetMaxEditModal";
import { BudgetSegmentedBar } from "./BudgetSegmentedBar";

interface BudgetOverviewCardProps {
  event: Event;
  setEvent: (event: Event) => void;
  premium: boolean;
  onPaywallPress: () => void;
}

export function BudgetOverviewCard({
  event,
  setEvent,
  premium,
  onPaywallPress
}: BudgetOverviewCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const currency = getCurrencySymbolForDevice();
  const summary = getBudgetSummary(event);

  const handleEditPress = useCallback(() => {
    if (!premium) {
      onPaywallPress();
      return;
    }
    setShowEditModal(true);
  }, [premium, onPaywallPress]);

  const handleSaveBudgetMaximum = useCallback(
    (budgetMaximum: number) => {
      setEvent({ ...event, budgetMaximum });
    },
    [event, setEvent]
  );

  const denominator = Math.max(summary.totalSpent, summary.budgetMaximum);

  const segments = CATEGORY_CONFIG.map((category) => ({
    color: category.color,
    value: summary.perCategory[category.field].spent
  }));

  if (summary.overBudget) {
    segments.push({ color: colors.tertiary, value: summary.overAmount });
  }

  const opacity = premium ? 1 : 0.4;

  return (
    <TouchableWithoutFeedback onPress={!premium ? onPaywallPress : undefined}>
      <View style={[styles.container, { opacity }]}>
        <View style={styles.topRow}>
          <Text type="caption" color={colors.gray}>
            TOTAL SPENT
          </Text>
          {summary.overBudget ? (
            <Text type="caption" color={colors.tertiary}>
              {currency}
              {summary.overAmount} OVER
            </Text>
          ) : (
            <Text type="caption" color={colors.gray}>
              {summary.totalItemCount} ITEMS
            </Text>
          )}
        </View>

        <View style={styles.spentRow}>
          <Text type="title" color={colors.primary}>
            {currency}
            {summary.totalSpent}
          </Text>
          <Text type="body" color={colors.gray} style={styles.spentOfText}>
            OF {currency}
            {summary.budgetMaximum}
          </Text>
        </View>

        <BudgetSegmentedBar segments={segments} denominator={denominator} />

        <View style={styles.legend}>
          {CATEGORY_CONFIG.map((category) => (
            <View key={category.field} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: category.color }]} />
              <Text type="caption" color={colors.black}>
                {category.title.toUpperCase()} {currency}
                {summary.perCategory[category.field].spent}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <TouchableOpacity
            onPress={handleEditPress}
            style={styles.statColumn}
            hitSlop={getHitSlop("small")}
          >
            <View style={styles.statLabelRow}>
              <Text type="caption" color={colors.gray}>
                BUDGET
              </Text>
              <FontAwesome5 name="edit" size={12} color={colors.gray} />
            </View>
            <Text type="subHeader" color={colors.black}>
              {currency}
              {summary.budgetMaximum}
            </Text>
          </TouchableOpacity>

          <View style={styles.statColumn}>
            <Text type="caption" color={colors.gray}>
              LEFT
            </Text>
            <Text
              type="subHeader"
              color={summary.overBudget ? colors.tertiary : colors.black}
            >
              {summary.overBudget ? "-" : ""}
              {currency}
              {Math.abs(summary.remaining)}
            </Text>
          </View>
        </View>

        <BudgetMaxEditModal
          visible={showEditModal}
          setVisible={setShowEditModal}
          budgetMaximum={event.budgetMaximum}
          onSave={handleSaveBudgetMaximum}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    ...card.medium,
    gap: 16,
    padding: 20
  },
  divider: {
    backgroundColor: colors.lightGray,
    height: 1,
    width: "100%"
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
    gap: 8,
    width: "45%"
  },
  spentOfText: {
    marginBottom: 4
  },
  spentRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 6
  },
  statColumn: {
    flex: 1,
    gap: 4
  },
  statLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  statsRow: {
    flexDirection: "row",
    gap: 12
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  }
});
