import { useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { Event } from "@/types/Event";
import { calculateTimeDifference, parseDatabaseDate } from "@/utils/date";

interface NextEventCountdownProps {
  event: Event;
}

function calculateRemainingTime(event: Event) {
  if (!event) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  const { difference, days, hours, minutes } = calculateTimeDifference(
    parseDatabaseDate(event.date)
  );

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  return { days, hours, minutes };
}

export function NextEventCountdown({ event }: NextEventCountdownProps) {
  const [remaining, setRemaining] = useState(() => calculateRemainingTime(event));

  const [prevEvent, setPrevEvent] = useState(event);
  if (event !== prevEvent) {
    setPrevEvent(event);
    setRemaining(calculateRemainingTime(event));
  }

  useEffect(() => {
    if (!event) return;

    const interval = setInterval(() => {
      setRemaining(calculateRemainingTime(event));
    }, 1000);
    return () => clearInterval(interval);
  }, [event]);

  const {
    days: remainingDays,
    hours: remainingHours,
    minutes: remainingMinutes
  } = remaining;

  return (
    <View style={styles.countdownContainer}>
      <View style={styles.countdownInnerContainer}>
        <Text type="subHeader" color={colors.black}>
          Countdown
        </Text>

        <View style={styles.countdownRow}>
          {remainingDays > 0 && (
            <View style={styles.countdownItem}>
              <Text type="header" color={colors.primaryTint}>
                {remainingDays}
              </Text>
              <Text type="body" color={colors.black}>
                {remainingDays === 1 ? "day" : "days"}
              </Text>
            </View>
          )}

          {(remainingDays > 0 || remainingHours > 0) && (
            <View style={styles.countdownItem}>
              <Text type="header" color={colors.secondary}>
                {remainingHours}
              </Text>
              <Text type="body" color={colors.black}>
                {remainingHours === 1 ? "hr" : "hrs"}
              </Text>
            </View>
          )}

          {(remainingHours > 0 || remainingMinutes > 0) && (
            <View style={styles.countdownItem}>
              <Text type="header" color={colors.primary}>
                {remainingMinutes}
              </Text>
              <Text type="body" color={colors.black}>
                {remainingMinutes === 1 ? "min" : "mins"}
              </Text>
            </View>
          )}

          {remainingDays === 0 &&
            remainingHours === 0 &&
            remainingMinutes === 0 && (
              <Text type="body" color={colors.secondary} center>
                Event has happened!
              </Text>
            )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  countdownContainer: {
    ...card.small,
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 24,
    flex: 2,
    justifyContent: "center"
  },
  countdownInnerContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12
  },
  countdownItem: {
    alignItems: "center",
    width: 50
  },
  countdownRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 12,
    marginTop: 6
  }
});
