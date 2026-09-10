import { StyleSheet, View } from "react-native";

import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { Text } from "@/design-system/components/text/Text";
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
  theme = "dark",
  disabled = false
}: ItineraryListProps) {
  const isLight = theme === "light";
  const dayHeaderTextStyle = [
    styles.dayHeaderText,
    isLight && styles.dayHeaderTextLight
  ];
  const timePrimaryStyle = [
    styles.timePrimary,
    isLight && styles.timePrimaryLight
  ];
  const timeSecondaryStyle = [
    styles.timeSecondary,
    isLight && styles.timeSecondaryLight
  ];
  const freeCardStyle = [
    styles.card,
    isLight ? styles.freeCardLight : styles.freeCard
  ];
  const cardTitleStyle = [
    styles.cardTitle,
    isLight && styles.cardTitleLight
  ];

  const eventStart = parseDatabaseDate(event.date);
  const eventEnd = event.endDate ? parseDatabaseDate(event.endDate) : null;

  if (!eventStart) {
    return null;
  }

  if (disabled && itinerary.length === 0) {
    return (
      <EmptyStateContainer
        title="No Activities Yet"
        description="The host hasn't added any activities to this event yet."
        icon="calendar"
      />
    );
  }

  const { blocks, overlaps } = buildItineraryTimelineBlocks({
    eventStart,
    eventEnd,
    itinerary
  });

  const activeDayKeys = new Set(
    blocks
      .filter((b) => b.kind === "activity")
      .map((b) => `day-${b.start.toISOString().slice(0, 10)}`)
  );

  const visibleBlocks = disabled
    ? blocks.filter((b) => b.kind !== "day" || activeDayKeys.has(b.key))
    : blocks;

  return (
    <View style={styles.container}>
      {visibleBlocks.map((b: ItineraryTimelineBlock, index: number) => {
        if (b.kind === "day") {
          return (
            <View key={`${b.key}-${index}`} style={styles.dayHeader}>
              <Text style={dayHeaderTextStyle}>{formatDate(b.day)}</Text>
              <View style={styles.dayHeaderLine} />
            </View>
          );
        }

        if (b.kind === "activity") {
          return (
            <View key={`${b.key}-${index}`} style={styles.block}>
              <View style={styles.timeCol}>
                <Text style={timePrimaryStyle}>{formatTime(b.start)}</Text>
                <Text style={timeSecondaryStyle}>{formatTime(b.end)}</Text>
              </View>

              <ItineraryItem
                activity={b.activity}
                durationLabel={humanDurationShortBetween(b.start, b.end)}
                location={b.activity.location}
                notes={b.activity.notes}
                isOverlap={overlaps.has(b.activity.id)}
                onPress={() => onActivityPress(b.activity)}
                theme={theme}
                disabled={disabled}
              />
            </View>
          );
        }

        if (!disabled) {
          return (
            <View key={`${b.key}-${index}`} style={styles.block}>
              <View style={styles.timeCol}>
                <Text style={timePrimaryStyle}>{formatTime(b.start)}</Text>
                <Text style={timeSecondaryStyle}>{formatTime(b.end)}</Text>
              </View>

              <View style={freeCardStyle}>
                <Text style={cardTitleStyle}>
                  Free time ({humanDurationShortBetween(b.start, b.end)})
                </Text>
                <Text type="body" color={isLight ? colors.darkGray : colors.white}>
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
  cardTitleLight: {
    color: colors.black,
    letterSpacing: 0.5,
    textTransform: "none"
  },
  container: {
    gap: 12
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
  dayHeaderTextLight: {
    color: colors.gray,
    opacity: 1
  },
  freeCard: {
    backgroundColor: colors.primaryTint2,
    borderColor: colors.secondaryTint,
    borderWidth: 1
  },
  freeCardLight: {
    backgroundColor: colors.lightGray,
    borderColor: colors.grayTint,
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
  timePrimaryLight: {
    color: colors.black,
    letterSpacing: 0.5,
    textTransform: "none"
  },
  timeSecondary: {
    color: colors.white,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  timeSecondaryLight: {
    color: colors.gray,
    letterSpacing: 0.5,
    textTransform: "none"
  }
});
