import { StyleSheet, View } from "react-native";

import { Button } from "@/design-system/components/buttons/Button";
import { Divider } from "@/design-system/components/layout/Divider";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { Event } from "@/types/Event";
import { formatDate, formatTime, parseDatabaseDate } from "@/utils/date";

import { EventDateTimeRangeEditor } from "../EventDateTimeRangeEditor";

interface ItineraryDateTimeProps {
  event: Event;
  editEventDateTime: boolean;
  setEvent: (event: Event) => void;
  handleEditDateTime: () => void;
  handleSaveChanges: () => void;
}

export function ItineraryDateTime({
  event,
  editEventDateTime,
  setEvent,
  handleEditDateTime,
  handleSaveChanges
}: ItineraryDateTimeProps) {
  const eventDate = parseDatabaseDate(event.date);
  const eventEndDate = event.endDate ? parseDatabaseDate(event.endDate) : null;

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
          <Text type="body" color="white">
            Start Date
          </Text>

          <Button
            size="small"
            color={colors.primaryTint}
            textColor={colors.white}
            text={`${formatDate(eventDate)}, ${formatTime(eventDate)}`}
            onPress={handleEditDateTime}
          />
        </View>

        {event.multiDate && eventEndDate && (
          <View style={styles.column}>
            <Text type="body" color="white">
              End Date
            </Text>

            <Button
              size="small"
              color={colors.primaryTint}
              textColor={colors.white}
              text={`${formatDate(eventEndDate)}, ${formatTime(eventEndDate)}`}
              onPress={handleEditDateTime}
            />
          </View>
        )}
      </View>

      <Divider />
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
  row: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center"
  }
});
