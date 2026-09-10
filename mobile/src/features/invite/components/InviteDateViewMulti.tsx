import { Timestamp } from "@react-native-firebase/firestore";

import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { parseDatabaseDate } from "@/utils/date";

interface InviteDateViewMultiProps {
  date: Timestamp;
  startDate: boolean;
  endDate: boolean;
}

export function InviteDateViewMulti({
  date,
  startDate = false
}: InviteDateViewMultiProps) {
  const eventDate = parseDatabaseDate(date);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleString("default", { month: "long" });
  const dayName = eventDate.toLocaleString("default", { weekday: "short" });
  const time = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric"
  });

  return (
    <View style={styles.container}>
      <Text type="caption" color={colors.gray} center>
        {startDate ? "From" : "To"}
      </Text>
      <Text type="caption" color={colors.black} center style={styles.month}>
        {month}
      </Text>
      <Text type="title" color={colors.primary} center style={styles.day}>
        {day}
      </Text>
      <Text type="caption" color={colors.black} center>
        {dayName} · {time}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  day: {
    marginVertical: 4
  },
  month: {
    marginTop: 4
  }
});
