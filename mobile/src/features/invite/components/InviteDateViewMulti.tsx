import { Timestamp } from "@react-native-firebase/firestore";

import { useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { Text } from "@/components/text/Text";
import { colors } from "@/styles/colors";
import { parseDatabaseDate } from "@/utils/date";

interface InviteDateViewMultiProps {
  date: Timestamp;
  startDate: boolean;
  endDate: boolean;
}

export function InviteDateViewMulti({
  date,
  startDate = false,
  endDate = false
}: InviteDateViewMultiProps) {
  const eventDate = parseDatabaseDate(date);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleString("default", { month: "short" });
  const time = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric"
  });
  const year = eventDate.getFullYear();
  const [color, setColor] = useState(colors.primary);

  useEffect(() => {
    if (startDate) {
      setColor(colors.primary);
    } else if (endDate) {
      setColor(colors.secondary);
    }
  }, [startDate, endDate]);

  return (
    <View style={styles.flexContainer}>
      <View style={[styles.topBar, { backgroundColor: color }]} />
      <View style={styles.boxContainer}>
        <Text type="subHeader" center>
          {time}
        </Text>
        <Text type="header" center>
          {day} {month}
        </Text>
        <Text type="subHeader" center>
          {year}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boxContainer: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
    gap: 12,
    padding: 12,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  flexContainer: {
    flex: 1
  },
  topBar: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 15,
    width: "100%"
  }
});
