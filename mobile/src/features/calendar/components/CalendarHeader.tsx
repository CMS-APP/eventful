import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { IconButton } from "@/design-system/components/IconButton";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { haptics } from "@/utils/haptics";

interface CalendarHeaderProps {
  currentMonth: number;
  currentYear: number;
  monthChange: (direction: number) => void;
  refresh: () => void;
}

export function CalendarHeader({
  currentMonth,
  currentYear,
  monthChange,
  refresh
}: CalendarHeaderProps) {
  function getMonthName(month: number) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    return months[month];
  }

  const handlePreviousPress = () => {
    haptics.soft();
    monthChange(-1);
  };

  const handleNextPress = () => {
    haptics.soft();
    monthChange(1);
  };

  const handleRefreshPress = () => {
    haptics.soft();
    refresh();
  };

  return (
    <View style={styles.container}>
      <View style={styles.flex} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handlePreviousPress}
          hitSlop={getHitSlop("small")}
        >
          <FontAwesome5 name="chevron-left" size={32} color={colors.black} />
        </TouchableOpacity>

        <View style={styles.monthYearText}>
          <Text type="header" color={colors.black}>
            {getMonthName(currentMonth)}
          </Text>
          <Text type="subHeader" color={colors.black}>
            {currentYear}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleNextPress}
          hitSlop={getHitSlop("small")}
        >
          <FontAwesome5 name="chevron-right" size={32} color={colors.black} />
        </TouchableOpacity>
      </View>

      <View style={styles.flex}>
        <IconButton
          iconName="sync"
          onPress={handleRefreshPress}
          size="small"
          color={colors.primary}
          marginTop={0}
          marginBottom={0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    paddingHorizontal: 24
  },
  flex: {
    alignItems: "flex-end",
    flex: 1
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    flex: 2,
    justifyContent: "center"
  },
  monthYearText: {
    alignItems: "center",
    width: 100
  }
});
