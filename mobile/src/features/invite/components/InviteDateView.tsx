import { Timestamp } from "@react-native-firebase/firestore";

import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
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
      <Text type="caption" color={colors.gray} style={styles.monthText} center>
        {month}
      </Text>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text type="subHeader" center>
            {dayName}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.column}>
          <Text type="title" color={colors.primary} center>
            {day}
          </Text>
          <Text type="caption" color={colors.gray} center>
            {year}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.column}>
          <Text type="subHeader" center>
            {time}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  },
  divider: {
    backgroundColor: colors.lightGray,
    height: "100%",
    width: 1
  },
  monthText: {
    marginBottom: 8
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center"
  }
});
