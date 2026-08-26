import { useCallback, useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { Event } from "@/types/Event";
import { calculateTimeDifference, parseDatabaseDate } from "@/utils/date";

interface NextEventCountdownProps {
  event: Event;
}

export function NextEventCountdown({ event }: NextEventCountdownProps) {
  const [remainingDays, setRemainingDays] = useState(0);
  const [remainingHours, setRemainingHours] = useState(0);
  const [remainingMinutes, setRemainingMinutes] = useState(0);

  const getRemainingTime = useCallback(() => {
    if (!event) return;

    const { difference, days, hours, minutes } = calculateTimeDifference(
      parseDatabaseDate(event.date)
    );

    if (difference <= 0) {
      setRemainingDays(0);
      setRemainingHours(0);
      setRemainingMinutes(0);
    } else {
      setRemainingDays(days);
      setRemainingHours(hours);
      setRemainingMinutes(minutes);
    }
  }, [event]);

  useEffect(() => {
    if (event) {
      getRemainingTime();
      const interval = setInterval(() => getRemainingTime(), 1000);
      return () => clearInterval(interval);
    }
  }, [event, getRemainingTime]);

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
