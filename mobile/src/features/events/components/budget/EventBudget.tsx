import { useSelector } from "react-redux";

import { useEffect, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { globalStyles } from "@/design-system/tokens/globalStyles";
import { AppStackParamList } from "@/features/app/navigationTypes";
import { SemiCircleProgressBar } from "@/features/home/components/SemiCircleProgressBar";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { getCurrencySymbolForDevice } from "@/utils/currency";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";
import { log } from "@/utils/logging";

interface EventBudgetProps {
  event: Event;
}

export function EventBudget({ event }: EventBudgetProps) {
  const [spent, setSpent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const premium = useSelector((state: UserState) => state.premium);
  const navigation = useNavigation() as StackNavigationProp<AppStackParamList>;

  useEffect(() => {
    let total = 0;

    if (event.budgetMaximum === null) {
      return;
    }

    (event.foodItems || []).forEach((item: { cost: number }) => {
      total += item.cost;
    });

    (event.drinkItems || []).forEach((item: { cost: number }) => {
      total += item.cost;
    });

    (event.decorItems || []).forEach((item: { cost: number }) => {
      total += item.cost;
    });

    (event.outfitItems || []).forEach((item: { cost: number }) => {
      total += item.cost;
    });

    setSpent(total);
    const remaining = event.budgetMaximum - total;
    setRemaining(remaining < 0 ? 0 : remaining);
    const percentage =
      event.budgetMaximum === 0
        ? 0
        : Math.min(100, (total / event.budgetMaximum) * 100);
    setPercentage(percentage);
  }, [event]);

  const handlePress = () => {
    haptics.soft();
    if (!premium) {
      log("EventBudget: Navigating to Paywall", "info");
      navigation.navigate("Paywall", { type: "Premium" });
    }

    if (premium && event.budgetMaximum === null) {
      navigation.goBack();
    }
  };

  const widgetStyle = [
    globalStyles.mediumWidget,
    styles.budgetContainer,
    {
      opacity: premium ? 1 : 0.4
    }
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.flexContainer}
      disabled={premium}
      hitSlop={getHitSlop("large")}
    >
      <View style={widgetStyle}>
        <Text type="subHeader">Budget</Text>

        {event.budgetMaximum === null ? (
          <View>
            <Text type="body" style={styles.noBudgetText}>
              No budget set
            </Text>
            <Text type="body" italic style={styles.noBudgetSubtext}>
              Head to event essentials to set a budget
            </Text>
          </View>
        ) : (
          <View style={styles.budgetContent}>
            <View style={styles.budgetDetails}>
              <Text type="body">Maximum:</Text>
              <View style={styles.priceBox}>
                <Text type="body" color="white">
                  {getCurrencySymbolForDevice()}
                  {event.budgetMaximum}
                </Text>
              </View>
              <Text type="body">Spent:</Text>
              <View style={styles.priceBox}>
                <Text type="body" color="white">
                  {getCurrencySymbolForDevice()}
                  {spent}
                </Text>
              </View>
              <Text type="body">Remaining:</Text>
              <View style={styles.priceBox}>
                <Text type="body" color="white">
                  {getCurrencySymbolForDevice()}
                  {remaining.toString()}
                </Text>
              </View>
            </View>

            <SemiCircleProgressBar
              percentage={percentage}
              title=""
              showProgress={true}
              colorScheme={[
                colors.primary,
                colors.primaryTint,
                colors.transparent
              ]}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  budgetContainer: {
    backgroundColor: colors.lightGray
  },
  budgetContent: {
    alignItems: "center",
    flexDirection: "row"
  },
  budgetDetails: {
    flex: 1
  },
  flexContainer: {
    flex: 1
  },
  noBudgetSubtext: {
    color: colors.gray,
    textAlign: "center"
  },
  noBudgetText: {
    textAlign: "center"
  },
  priceBox: {
    alignItems: "flex-start",
    backgroundColor: colors.primaryTint,
    borderRadius: 6,
    marginBottom: 6,
    padding: 6,
    width: "100%"
  }
});
