import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/Text";

export function CalendarDayHeader() {
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  return (
    <View style={styles.daysRow}>
      {days.map((day) => (
        <View key={day} style={styles.day}>
          <Text type="body" style={styles.dayText}>
            {day}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  day: {
    flex: 1
  },
  dayText: {
    fontSize: 12,
    textAlign: "center"
  },
  daysRow: {
    flexDirection: "row",
    marginBottom: 12
  }
});
