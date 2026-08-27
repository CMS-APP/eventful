import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { Itinerary } from "@/types/Itinerary";

export type ItineraryTheme = "dark" | "light";

interface ItineraryItemProps {
  activity: Itinerary;
  onPress: () => void;
  durationLabel: string;
  location?: string;
  notes?: string;
  isOverlap?: boolean;
  theme?: ItineraryTheme;
  disabled?: boolean;
}

export function ItineraryItem({
  activity,
  onPress,
  durationLabel,
  location,
  notes,
  isOverlap = false,
  theme = "dark",
  disabled = false
}: ItineraryItemProps) {
  const isLight = theme === "light";
  const titleStyle = [styles.title, isLight && styles.titleLight];
  const metaStyle = [styles.meta, isLight && styles.metaLight];
  const notesStyle = [styles.notes, isLight && styles.notesLight];
  const cardStyle = [styles.card, isLight && styles.cardLight];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.touchable}
      disabled={disabled}
      hitSlop={getHitSlop("medium")}
    >
      <View style={cardStyle}>
        <View style={styles.cardTop}>
          <Text style={titleStyle}>{activity.name || "Untitled"}</Text>
          {isOverlap && (
            <View style={styles.badgeWarn}>
              <Text style={styles.badgeWarnText}>Overlaps</Text>
            </View>
          )}
        </View>

        <Text style={metaStyle}>
          {durationLabel}
          {!!location && `  •  ${location}`}
        </Text>

        {!!notes && (
          <Text style={notesStyle} numberOfLines={3}>
            {notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badgeWarn: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondaryTint,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  badgeWarnText: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  card: {
    backgroundColor: colors.primaryTint3,
    borderRadius: 14,
    minHeight: 86,
    padding: 14
  },
  cardLight: {
    backgroundColor: colors.lightGray,
    borderColor: colors.grayTint,
    borderWidth: 1
  },
  cardTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  meta: {
    color: colors.white,
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 8,
    opacity: 0.8,
    textTransform: "uppercase"
  },
  metaLight: {
    color: colors.darkGray,
    fontSize: 12,
    letterSpacing: 0.5,
    opacity: 1,
    textTransform: "none"
  },
  notes: {
    color: colors.white,
    fontSize: 12,
    letterSpacing: 2,
    lineHeight: 16,
    marginTop: 8,
    opacity: 0.7,
    textTransform: "uppercase"
  },
  notesLight: {
    color: colors.darkGray,
    fontSize: 12,
    letterSpacing: 0.5,
    opacity: 1,
    textTransform: "none"
  },
  title: {
    color: colors.white,
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  titleLight: {
    color: colors.black,
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: "none"
  },
  touchable: {
    flex: 1
  }
});
