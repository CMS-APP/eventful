import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { Event } from "@/types/Event";
import { Itinerary } from "@/types/Itinerary";
import {
  formatDate,
  formatTime,
  humanDurationShortBetween,
  parseDatabaseDate
} from "@/utils/date";

import { ItineraryItem, ItineraryTheme } from "./ItineraryItem";
import {
  ItineraryTimelineBlock,
  buildItineraryTimelineBlocks
} from "./itineraryTimeline";

interface ItineraryListProps {
  event: Event;
  itinerary: Itinerary[];
  onActivityPress: (activity: Itinerary) => void;
  theme?: ItineraryTheme;
  disabled?: boolean;
}

export function ItineraryList({
  event,
  itinerary,
  onActivityPress,
  disabled = false
}: ItineraryListProps) {
  const eventStart = parseDatabaseDate(event.date);
  const eventEnd = event.endDate ? parseDatabaseDate(event.endDate) : null;

  if (!eventStart) {
    return null;
  }

  const { blocks, overlaps } = buildItineraryTimelineBlocks({
    eventStart,
    eventEnd,
    itinerary
  });

  return (
    <View style={styles.container}>
      {blocks.map((b: ItineraryTimelineBlock, index: number) => {
        if (b.kind === "day") {
          return (
            <View key={`${b.key}-${index}`} style={styles.dayHeader}>
              <Text style={styles.dayHeaderText}>{formatDate(b.day)}</Text>
              <View style={styles.dayHeaderLine} />
            </View>
          );
        }

        if (b.kind === "activity") {
          return (
            <View key={`${b.key}-${index}`} style={styles.block}>
              <View style={styles.timeCol}>
                <Text style={styles.timePrimary}>{formatTime(b.start)}</Text>
                <Text style={styles.timeSecondary}>{formatTime(b.end)}</Text>
              </View>

              <ItineraryItem
                activity={b.activity}
                durationLabel={humanDurationShortBetween(b.start, b.end)}
                location={b.activity.location}
                notes={b.activity.notes}
                isOverlap={overlaps.has(b.activity.id)}
                onPress={() => onActivityPress(b.activity)}
                disabled={disabled}
              />
            </View>
          );
        }

        if (!disabled) {
          return (
            <View key={`${b.key}-${index}`} style={styles.block}>
              <View style={styles.timeCol}>
                <Text style={styles.timePrimary}>{formatTime(b.start)}</Text>
                <Text style={styles.timeSecondary}>{formatTime(b.end)}</Text>
              </View>

              <View style={[styles.card, styles.freeCard]}>
                <Text style={styles.cardTitle}>
                  Free time ({humanDurationShortBetween(b.start, b.end)})
                </Text>
                <Text type="body" color="white">
                  {b.hint ?? "Tap Add Activity to drop something in this gap."}
                </Text>
              </View>
            </View>
          );
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: "flex-start",
    flexDirection: "row"
  },
  card: {
    backgroundColor: colors.primaryTint3,
    borderRadius: 14,
    flex: 1,
    padding: 14
  },
  cardTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  container: {
    gap: 12,
    paddingHorizontal: 24
  },
  dayHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 4,
    marginTop: 12
  },
  dayHeaderLine: {
    backgroundColor: colors.lightGray,
    flex: 1,
    height: 1
  },
  dayHeaderText: {
    color: colors.white,
    fontSize: 12,
    letterSpacing: 2,
    marginRight: 10,
    opacity: 0.75,
    textTransform: "uppercase"
  },
  freeCard: {
    backgroundColor: colors.primaryTint2,
    borderColor: colors.secondaryTint,
    borderWidth: 1
  },
  timeCol: {
    marginRight: 12,
    paddingTop: 10,
    width: 88
  },
  timePrimary: {
    color: colors.white,
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 6,
    textTransform: "uppercase"
  },
  timeSecondary: {
    color: colors.white,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase"
  }
});
