import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/Text";

import { QuickAddButton } from "./QuickAddButton";

const QUICK_ADD_BUTTONS = [
  "Arrivals",
  "Setup",
  "Food",
  "Drinks",
  "Photos",
  "Speeches",
  "Games",
  "Clean up",
  "Taxi / travel"
];

export function ItineraryQuickAdd({
  onQuickAdd
}: {
  onQuickAdd: (title: string) => void;
}) {
  return (
    <View style={styles.container}>
      <Text type="body" color="white" style={styles.title}>
        Itinerary Quick Add
      </Text>
      <View style={styles.buttonsContainer}>
        {QUICK_ADD_BUTTONS.map((button) => (
          <QuickAddButton
            key={button}
            title={button}
            onPress={() => onQuickAdd(button)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  container: {
    gap: 12
  },
  title: {
    textAlign: "left"
  }
});
