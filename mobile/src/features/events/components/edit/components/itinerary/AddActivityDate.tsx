import { useCallback, useMemo, useState } from "react";

import { StyleSheet, View } from "react-native";

import { DateTimeButton } from "@/components/buttons/DateTimeButton";
import { DateTimeSelector } from "@/design-system/components/DateTimeSelector";
import { Input } from "@/design-system/components/Input";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { Event } from "@/types/Event";
import {
  calculateTimeDifferenceBetweenDates,
  formatTime,
  parseDatabaseDate
} from "@/utils/date";
import { haptics } from "@/utils/haptics";

interface AddActivityDateProps {
  event: Event;
  activityStartTime: Date;
  setActivityStartTime: (startTime: Date) => void;
  durationMinutesText: string;
  setDurationMinutesText: (minutes: string) => void;
}

export function AddActivityDate({
  event,
  activityStartTime,
  setActivityStartTime,
  durationMinutesText,
  setDurationMinutesText
}: AddActivityDateProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDatePress = useCallback(() => {
    haptics.soft();
    setShowDatePicker(true);
  }, [setShowDatePicker]);

  const handleTimePress = useCallback(() => {
    haptics.soft();
    setShowTimePicker(true);
  }, [setShowTimePicker]);

  const beforeEventStart = useMemo(() => {
    return activityStartTime < parseDatabaseDate(event.date);
  }, [activityStartTime, event.date]);

  const durationMinutes = useMemo(() => {
    const n = Number(durationMinutesText);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.floor(n));
  }, [durationMinutesText]);

  const computedEndTime = useMemo(() => {
    return new Date(activityStartTime.getTime() + durationMinutes * 60000);
  }, [activityStartTime, durationMinutes]);

  const durationLabel = useMemo(() => {
    const { days, hours, minutes } = calculateTimeDifferenceBetweenDates(
      activityStartTime,
      computedEndTime
    );
    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    return parts.length ? parts.join(" ") : "0m";
  }, [activityStartTime, computedEndTime]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <DateTimeButton
          date={activityStartTime}
          title={"Start Date"}
          type={"Date"}
          onPress={handleDatePress}
          dark
        />

        <DateTimeButton
          date={activityStartTime}
          title={"Start Time"}
          type={"Time"}
          onPress={handleTimePress}
          dark
        />
      </View>

      {beforeEventStart && (
        <Text type="footnote" style={styles.errorText}>
          Warning: Activity start time is before event start
        </Text>
      )}

      <Input
        placeholder="Duration (minutes)"
        value={durationMinutesText}
        onChangeText={setDurationMinutesText}
        keyboardType="number-pad"
        dark
      />

      <Text type="footnote" style={styles.endTimeText}>
        Ends at {formatTime(computedEndTime)} • {durationLabel}
      </Text>

      {showDatePicker && (
        <DateTimeSelector
          date={new Date(activityStartTime || new Date())}
          setDate={setActivityStartTime}
          showPicker={showDatePicker}
          setShowPicker={setShowDatePicker}
          mode="date"
        />
      )}

      {showTimePicker && (
        <DateTimeSelector
          date={new Date(activityStartTime || new Date())}
          setDate={setActivityStartTime}
          showPicker={showTimePicker}
          setShowPicker={setShowTimePicker}
          mode="time"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    width: "100%"
  },
  endTimeText: {
    color: colors.white,
    marginTop: 2,
    opacity: 0.8
  },
  errorText: {
    color: colors.red
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12
  }
});
