import { Timestamp } from "@react-native-firebase/firestore";

import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { parseDatabaseDate } from "@/utils/date";

interface InviteDateViewProps {
  date: Timestamp;
}

export function InviteDateView({ date }: InviteDateViewProps) {
  const eventDate = parseDatabaseDate(date);
  const day = eventDate.getDate();
  const dayName = eventDate.toLocaleString("default", { weekday: "long" });
  const month = eventDate.toLocaleString("default", { month: "long" });
  const time = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric"
  });
  const year = eventDate.getFullYear();

  return (
    <View>
      <Text type="subHeader" style={styles.monthText}>
        {month}
      </Text>
      <View style={styles.dateTimeContainer}>
        <View style={styles.lineContainer}>
          <View style={styles.line} />
          <Text type="subHeader" style={styles.dayName}>
            {dayName}
          </Text>
          <View style={styles.line} />
        </View>
        <Text type="header" style={styles.day}>
          {day}
        </Text>
        <View style={styles.lineContainer}>
          <View style={styles.line} />
          <Text type="subHeader" style={styles.time}>
            {time}
          </Text>
          <View style={styles.line} />
        </View>
      </View>
      <Text type="subHeader" style={styles.yearText}>
        {year}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dateTimeContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12
  },
  day: {
    flex: 1,
    fontSize: 50,
    textAlign: "center"
  },
  dayName: {
    fontSize: 12,
    textAlign: "center"
  },
  line: {
    backgroundColor: colors.black,
    height: 2
  },
  lineContainer: {
    flex: 1,
    gap: 12
  },
  monthText: {
    marginTop: 12,
    textAlign: "center"
  },
  time: {
    fontSize: 12,
    textAlign: "center"
  },
  yearText: {
    marginTop: 12,
    textAlign: "center"
  }
});
