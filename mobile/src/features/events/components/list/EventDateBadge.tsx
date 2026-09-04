import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { parseDatabaseDate } from "@/utils/date";

interface EventDateBadgeProps {
  date: any;
  endDate: any;
  multiDate: boolean;
  color: string;
}

export function EventDateBadge({
  date,
  endDate,
  multiDate,
  color
}: EventDateBadgeProps) {
  const startDate = parseDatabaseDate(date);
  const endDateParsed = endDate ? parseDatabaseDate(endDate) : null;

  if (!startDate) return null;

  const isMultiDay = multiDate && !!endDateParsed;

  const weekday = startDate
    .toLocaleDateString("en-GB", { weekday: "short" })
    .toUpperCase();
  const month = startDate
    .toLocaleDateString("en-GB", { month: "short" })
    .toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      {isMultiDay ? (
        <>
          <Text type="caption" color={colors.white}>
            {month}
          </Text>
          <Text type="header" color={colors.white}>
            {startDate.getDate().toString().padStart(2, "0")}
          </Text>
          <View style={styles.divider} />
          <Text type="header" color={colors.white}>
            {endDateParsed!.getDate().toString().padStart(2, "0")}
          </Text>
        </>
      ) : (
        <>
          <Text type="caption" color={colors.white}>
            {weekday}
          </Text>
          <Text type="header" color={colors.white}>
            {startDate.getDate().toString().padStart(2, "0")}
          </Text>
          <Text type="caption" color={colors.white}>
            {month}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: 16,
    gap: 4,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  divider: {
    backgroundColor: colors.white,
    height: 1,
    opacity: 0.5,
    width: 20
  }
});
