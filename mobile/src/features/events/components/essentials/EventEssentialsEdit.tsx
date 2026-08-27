import { useCallback } from "react";

import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { EventsStackParamList } from "@/app/navigation";
import { Input } from "@/design-system/components/Input";
import { colors } from "@/design-system/tokens/colors";
import { EventBudget } from "@/features/events/components/budget/EventBudget";
import { Event } from "@/types/Event";
import { getCurrencySymbolForDevice } from "@/utils/currency";

import { EventEssentialsButton } from "./EventEssentialsButton";

const essentialsButtons = [
  {
    title: "Food",
    image: require("@/assets/icons/food.png"),
    screen: "EventEditFood"
  },
  {
    title: "Drink",
    image: require("@/assets/icons/drink.png"),
    screen: "EventEditDrink"
  },
  {
    title: "Decor",
    image: require("@/assets/icons/decor.png"),
    screen: "EventEditDecor"
  },
  {
    title: "Outfit",
    image: require("@/assets/icons/outfit.png"),
    screen: "EventEditOutfit"
  },
  {
    title: "Notes",
    image: require("@/assets/icons/notes.png"),
    screen: "EventEditNotes"
  }
];

interface EventEssentialsEditProps {
  event: Event;
  setEvent: (event: Event) => void;
}

export function EventEssentialsEdit({
  event,
  setEvent
}: EventEssentialsEditProps) {
  const navigation =
    useNavigation() as StackNavigationProp<EventsStackParamList>;
  const setBudgetMaximum = useCallback(
    (text: string) => {
      setEvent({ ...event, budgetMaximum: Number(text) });
    },
    [event, setEvent]
  );

  const handlePress = useCallback(
    (screen: string) => {
      navigation.navigate(screen as any, {
        event
      });
    },
    [navigation, event]
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.row}>
          {essentialsButtons.slice(0, 2).map((button) => (
            <EventEssentialsButton
              key={button.screen}
              title={button.title}
              image={button.image}
              onPress={() => handlePress(button.screen)}
            />
          ))}
        </View>

        <View style={styles.row}>
          {essentialsButtons.slice(2, 4).map((button) => (
            <EventEssentialsButton
              key={button.screen}
              title={button.title}
              image={button.image}
              onPress={() => handlePress(button.screen)}
            />
          ))}
        </View>

        <View style={styles.row}>
          {essentialsButtons.slice(4, 5).map((button) => (
            <EventEssentialsButton
              key={button.screen}
              title={button.title}
              image={button.image}
              onPress={() => handlePress(button.screen)}
            />
          ))}
          <View style={styles.flex1} />
        </View>

        <Input
          placeholder={`Budget (${getCurrencySymbolForDevice()})`}
          value={event.budgetMaximum?.toString() ?? ""}
          onChangeText={setBudgetMaximum}
          keyboardType="numeric"
          dark
          backgroundColor={colors.lightGray}
          textColor={colors.black}
        />

        <EventBudget event={event} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryTint,
    flex: 1,
    gap: 12
  },
  contentContainer: {
    gap: 12,
    paddingHorizontal: 24
  },
  flex1: {
    flex: 1
  },
  row: {
    flexDirection: "row",
    gap: 12
  }
});
