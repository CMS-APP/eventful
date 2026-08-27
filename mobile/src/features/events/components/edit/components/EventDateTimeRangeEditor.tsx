import { Timestamp } from "@react-native-firebase/firestore";

import { useCallback, useMemo, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { DateTimeButton } from "@/design-system/components/DateTimeButton";
import { DateTimeSelector } from "@/design-system/components/DateTimeSelector";
import { SwitchButton } from "@/design-system/components/SwitchButton";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { Event } from "@/types/Event";
import { parseDatabaseDate } from "@/utils/date";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";

type PickerType = "start" | "end";
type PickerMode = "date" | "time";

type ActivePicker = {
  type: PickerType;
  mode: PickerMode;
} | null;

interface EventDateTimeRangeEditorProps {
  event: Event;
  setEvent: (event: Event) => void;
  dark?: boolean;
  handleSaveChanges: () => void;
  showSaveChanges?: boolean;
}

export function EventDateTimeRangeEditor({
  event,
  setEvent,
  dark = false,
  handleSaveChanges,
  showSaveChanges = true
}: EventDateTimeRangeEditorProps) {
  const startDate = useMemo(() => {
    return event.date ? parseDatabaseDate(event.date) : null;
  }, [event.date]);

  const multiDate = !!event.multiDate;

  const endDate = useMemo(() => {
    if (!multiDate) return null;
    return event.endDate ? parseDatabaseDate(event.endDate) : startDate;
  }, [event.endDate, multiDate, startDate]);

  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

  const handleDatePress = useCallback(() => {
    haptics.soft();
    setActivePicker({ type: "start", mode: "date" });
  }, []);

  const handleTimePress = useCallback(() => {
    haptics.soft();
    setActivePicker({ type: "start", mode: "time" });
  }, []);

  const handleEndDatePress = useCallback(() => {
    haptics.soft();
    setActivePicker({ type: "end", mode: "date" });
  }, []);

  const handleEndTimePress = useCallback(() => {
    haptics.soft();
    setActivePicker({ type: "end", mode: "time" });
  }, []);

  const handleSwitchChange = useCallback(() => {
    if (!startDate) return;

    if (!multiDate) {
      setEvent({
        ...event,
        multiDate: true,
        endDate: Timestamp.fromDate(startDate)
      });
      return;
    }

    setEvent({
      ...event,
      multiDate: false,
      endDate: null
    });
  }, [event, multiDate, setEvent, startDate]);

  const updateStartDate = useCallback(
    (nextStart: Date) => {
      const currentEnd = endDate;
      const nextEnd =
        multiDate && currentEnd && nextStart > currentEnd
          ? nextStart
          : currentEnd;

      setEvent({
        ...event,
        date: Timestamp.fromDate(nextStart),
        endDate:
          multiDate && nextEnd
            ? Timestamp.fromDate(nextEnd)
            : (event.endDate ?? null)
      });
    },
    [endDate, event, multiDate, setEvent]
  );

  const updateEndDate = useCallback(
    (nextEnd: Date) => {
      if (!startDate) return;
      const nextStart = nextEnd < startDate ? nextEnd : startDate;

      setEvent({
        ...event,
        multiDate: true,
        date: Timestamp.fromDate(nextStart),
        endDate: Timestamp.fromDate(nextEnd)
      });
    },
    [event, setEvent, startDate]
  );

  if (!startDate) return null;

  const pickerDate =
    activePicker?.type === "end"
      ? endDate || startDate || new Date()
      : startDate || new Date();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <DateTimeButton
          date={startDate}
          title={multiDate ? "Start Date" : "Date"}
          type={"Date"}
          onPress={handleDatePress}
          dark={dark}
        />

        <DateTimeButton
          date={startDate}
          title={multiDate ? "Start Time" : "Time"}
          type={"Time"}
          onPress={handleTimePress}
          dark={dark}
        />
      </View>

      <View>
        <Text type="body" color="white" style={styles.multiDayLabel}>
          Mutli-Day
        </Text>
        <SwitchButton
          isChecked={multiDate}
          onChange={handleSwitchChange}
          title={"Multi-Day Event?"}
          dark={dark}
        />
      </View>

      {multiDate && endDate && (
        <View style={styles.row}>
          <DateTimeButton
            date={endDate}
            title={"End Date"}
            type={"Date"}
            onPress={handleEndDatePress}
            dark={dark}
          />

          <DateTimeButton
            date={endDate}
            title={"End Time"}
            type={"Time"}
            onPress={handleEndTimePress}
            dark={dark}
          />
        </View>
      )}

      {!!activePicker && (
        <DateTimeSelector
          date={new Date(pickerDate)}
          setDate={
            activePicker.type === "start" ? updateStartDate : updateEndDate
          }
          showPicker={!!activePicker}
          setShowPicker={(show) => {
            if (!show) setActivePicker(null);
          }}
          mode={activePicker.mode}
        />
      )}

      {showSaveChanges && (
        <View style={styles.column}>
          <Text type="subHeader" color="white">
            Save Changes
          </Text>
          <TouchableOpacity
            onPress={handleSaveChanges}
            hitSlop={getHitSlop("medium")}
          >
            <View style={[styles.itemRow, styles.dateText]}>
              <FontAwesome5 name="check" size={12} color={colors.white} />
              <Text type="body" color="white" center>
                Save Changes
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flexDirection: "column",
    flex: 1,
    gap: 6
  },
  container: {
    gap: 12
  },
  dateText: {
    backgroundColor: colors.primaryTint3,
    borderRadius: 12,
    paddingVertical: 12
  },
  itemRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center"
  },
  multiDayLabel: {
    marginBottom: 6
  },
  row: {
    flexDirection: "row",
    gap: 12
  }
});
