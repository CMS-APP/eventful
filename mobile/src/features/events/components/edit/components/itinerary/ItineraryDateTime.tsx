import { useMemo } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/components/text/Text";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";
import { Event } from "@/types/Event";
import {
  calculateTimeDifferenceBetweenDates,
  formatDate,
  formatTime,
  parseDatabaseDate
} from "@/utils/date";
import { getHitSlop } from "@/utils/hitSlop";

import { EventDateTimeRangeEditor } from "../EventDateTimeRangeEditor";

interface ItineraryDateTimeProps {
  event: Event;
  editEventDateTime: boolean;
  setEvent: (event: Event) => void;
  handleAddActivity: () => void;
  handleEditDateTime: () => void;
  handleSaveChanges: () => void;
}

export function ItineraryDateTime({
  event,
  editEventDateTime,
  setEvent,
  handleAddActivity,
  handleEditDateTime,
  handleSaveChanges
}: ItineraryDateTimeProps) {
  const eventDate = parseDatabaseDate(event.date);
  const eventEndDate = event.endDate ? parseDatabaseDate(event.endDate) : null;

  const { days, hours, minutes } = useMemo(() => {
    if (!eventDate || !eventEndDate) {
      return { difference: 0, days: 0, hours: 0, minutes: 0 };
    }
    return calculateTimeDifferenceBetweenDates(eventDate, eventEndDate);
  }, [eventDate, eventEndDate]);

  const formattedTime = useMemo(() => {
    let time = "";
    if (days > 0) {
      time += `${days} day${days > 1 ? "s" : ""} `;
    }
    if (hours > 0) {
      time += `${hours} hour${hours > 1 ? "s" : ""} `;
    }
    if (minutes > 0) {
      time += `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
    return time || "0m";
  }, [days, hours, minutes]);

  if (editEventDateTime) {
    return (
      <EventDateTimeRangeEditor
        event={event}
        setEvent={setEvent}
        dark
        handleSaveChanges={handleSaveChanges}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text type="subHeader" color="white">
            Start Date
          </Text>
          <Text type="body" color="white" center style={styles.dateText}>
            {formatDate(eventDate)}, {formatTime(eventDate)}
          </Text>
        </View>

        {event.multiDate && eventEndDate && (
          <View style={styles.column}>
            <Text type="subHeader" color="white">
              End Date
            </Text>

            <Text type="body" color="white" center style={styles.dateText}>
              {formatDate(eventEndDate)}, {formatTime(eventEndDate)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.column}>
          <Text type="subHeader" color="white">
            Add Item
          </Text>
          <TouchableOpacity
            onPress={handleAddActivity}
            hitSlop={getHitSlop("medium")}
          >
            <View
              style={[styles.itemRow, styles.dateText, styles.addItemButton]}
            >
              <FontAwesome5 name="plus" size={12} color={colors.white} />
              <Text type="body" color="white" center>
                Add Item
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {event.multiDate && eventEndDate && (
          <View style={styles.column}>
            <Text type="subHeader" color="white">
              Total Time
            </Text>

            <Text type="body" color="white" center style={styles.dateText}>
              {formattedTime}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.column}>
        <Text type="subHeader" color="white">
          Edit Date & Time
        </Text>
        <TouchableOpacity
          onPress={handleEditDateTime}
          hitSlop={getHitSlop("medium")}
        >
          <View style={[styles.itemRow, styles.dateText, styles.addItemButton]}>
            <FontAwesome5 name="edit" size={12} color={colors.white} />
            <Text type="body" color="white" center>
              Edit Date & Time
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={globalStyles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  addItemButton: {
    backgroundColor: colors.primaryTint
  },
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
  row: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center"
  }
});
