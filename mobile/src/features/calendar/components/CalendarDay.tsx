import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { CalendarDate } from "@/types/CalendarDate";

interface CalendarDayProps {
  dateObj: CalendarDate;
  index: number;
  activeEventDays: boolean[];
  activeInviteDays: boolean[];
  onPress: (date: Date, type: string) => void;
}

export function CalendarDay({
  dateObj,
  index,
  activeEventDays,
  activeInviteDays,
  onPress
}: CalendarDayProps) {
  function combinedView() {
    return {};
  }

  function normalView() {
    return { borderRadius: 12 };
  }

  function previousMatch() {
    return {
      borderBottomRightRadius: 10,
      borderTopRightRadius: 10
    };
  }

  function nextMatch() {
    return {
      borderBottomLeftRadius: 10,
      borderTopLeftRadius: 10
    };
  }

  function getViewType() {
    if (!activeEventDays[index] && !activeInviteDays[index])
      return normalView();

    let previous;
    let next;
    if (index === 0) {
      previous = false;
    } else {
      previous = activeEventDays[index - 1] || activeInviteDays[index - 1];
    }

    if (index === activeEventDays.length - 1) {
      next = false;
    } else {
      next = activeEventDays[index + 1] || activeInviteDays[index + 1];
    }

    if (previous && next) return combinedView();
    if (previous) return previousMatch();
    if (next) return nextMatch();
    return normalView();
  }

  function isCombined() {
    if (activeEventDays[index] && activeInviteDays[index]) {
      return true;
    } else {
      return false;
    }
  }

  function getActiveColor() {
    if (active) {
      if (type === "current") {
        return colors.primary;
      } else {
        return colors.primary + "99";
      }
    } else if (!active && activeInvite) {
      if (type === "current") {
        return colors.primaryTint;
      } else {
        return colors.primaryTint + "99";
      }
    }
  }

  function textColor() {
    if (active) {
      if (type === "current") return colors.white;
      if (type !== "current") return colors.lightGray;
    } else if (activeInvite) {
      if (type === "current") return colors.white;
      if (type !== "current") return "gray";
    } else if (type !== "current") {
      return colors.gray;
    }
  }

  const isToday = new Date().toDateString() === dateObj.date.toDateString();
  const active = activeEventDays[index];
  const activeInvite = activeInviteDays[index];
  const type = dateObj.type;
  const activeColor = getActiveColor();

  const style = getViewType();
  const combined = isCombined();
  const date = dateObj.date;

  const dayContainerStyle = [
    style,
    styles.dayContainer,
    {
      padding: isToday ? 0 : 2,
      backgroundColor: activeColor,
      borderWidth: isToday ? 2 : 0,
      borderColor: isToday ? colors.black : colors.transparent
    }
  ];

  const combinedContainerStyle = [
    style,
    styles.combinedContainer,
    {
      height: isToday ? 13.5 : 15,
      backgroundColor: colors.primaryTint
    }
  ];

  return (
    <TouchableOpacity
      style={styles.flexContainer}
      onPress={() => {
        onPress(date, type);
      }}
      hitSlop={getHitSlop("medium")}
    >
      <View style={dayContainerStyle}>
        {combined && <View style={combinedContainerStyle} />}
        <Text type="body" style={(styles.dayText, { color: textColor() })}>
          {date.getDate()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  combinedContainer: {
    alignItems: "center",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0
  },
  dayContainer: {
    alignItems: "center",
    height: 30,
    justifyContent: "center"
  },
  dayText: {
    textAlign: "center"
  },
  flexContainer: {
    flex: 1
  }
});
