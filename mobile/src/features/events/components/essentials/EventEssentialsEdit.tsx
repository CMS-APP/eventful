import { useSelector } from "react-redux";

import { useCallback } from "react";

import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AppStackParamList, EventsStackParamList } from "@/app/navigation";
import { BudgetCategoryGridButton } from "@/features/events/components/budget/BudgetCategoryGridButton";
import { BudgetNotesRow } from "@/features/events/components/budget/BudgetNotesRow";
import { BudgetOverviewCard } from "@/features/events/components/budget/BudgetOverviewCard";
import { CATEGORY_CONFIG, getBudgetSummary } from "@/features/events/utils/budget";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";

interface EventEssentialsEditProps {
  event: Event;
  setEvent: (event: Event) => void;
}

export function EventEssentialsEdit({
  event,
  setEvent
}: EventEssentialsEditProps) {
  const premium = useSelector((state: UserState) => state.premium);
  const eventsNavigation =
    useNavigation() as StackNavigationProp<EventsStackParamList>;
  const appNavigation = useNavigation() as StackNavigationProp<AppStackParamList>;

  const summary = getBudgetSummary(event);
  const gridDenominator = Math.max(summary.totalSpent, summary.budgetMaximum);

  const handlePaywallPress = useCallback(() => {
    appNavigation.navigate("Paywall", { type: "Premium" });
  }, [appNavigation]);

  const handleCategoryPress = useCallback(
    (screen: string) => {
      eventsNavigation.navigate(screen as any, { event });
    },
    [eventsNavigation, event]
  );

  return (
    <View style={styles.container}>
      <BudgetOverviewCard
        event={event}
        setEvent={setEvent}
        premium={premium}
        onPaywallPress={handlePaywallPress}
      />

      <View style={styles.grid}>
        {[CATEGORY_CONFIG.slice(0, 2), CATEGORY_CONFIG.slice(2, 4)].map(
          (row, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {row.map((category) => (
                <BudgetCategoryGridButton
                  key={category.field}
                  title={category.title}
                  image={category.image}
                  color={category.color}
                  spent={summary.perCategory[category.field].spent}
                  itemCount={summary.perCategory[category.field].itemCount}
                  denominator={gridDenominator}
                  onPress={() => handleCategoryPress(category.screen)}
                />
              ))}
            </View>
          )
        )}
      </View>

      <BudgetNotesRow event={event} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingHorizontal: 16
  },
  grid: {
    gap: 12
  },
  gridRow: {
    flexDirection: "row",
    gap: 12
  }
});
