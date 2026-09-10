import { useCallback, useMemo } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { FontAwesome5 } from "@expo/vector-icons";

import { PhotoBoothStackNavigation } from "@/app/navigation";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { getLatestPhotoTime } from "@/services/photo-booth/events";
import { GalleryEvent } from "@/types/photoBoothGallery";
import { formatDate } from "@/utils/date";

interface GalleryEventListItemProps {
  event: GalleryEvent;
}

type PillVariant = "outline" | "cloud" | "phone";

const PILL_TEXT_COLOR: Record<PillVariant, string> = {
  outline: colors.primary,
  cloud: colors.white,
  phone: colors.primaryDark
};

function CountPill({
  icon,
  label,
  variant
}: {
  icon: keyof typeof FontAwesome5.glyphMap;
  label: string;
  variant: PillVariant;
}) {
  const textColor = PILL_TEXT_COLOR[variant];
  const variantStyle =
    variant === "outline"
      ? styles.pillOutline
      : variant === "cloud"
        ? styles.pillCloud
        : styles.pillPhone;

  return (
    <View style={[styles.pill, variantStyle]}>
      <FontAwesome5 name={icon} size={12} color={textColor} />
      <Text type="caption" color={textColor}>
        {label}
      </Text>
    </View>
  );
}

export function GalleryEventListItem({ event }: GalleryEventListItemProps) {
  const navigation = useNavigation<PhotoBoothStackNavigation>();

  const { eventTitle, photos, date } = event;

  const cloudCount = photos.filter(
    (photo) => photo.type === "cloud" || photo.type === "both"
  ).length;
  const phoneCount = photos.filter(
    (photo) => photo.type === "local" || photo.type === "both"
  ).length;

  const lastPhotoDate = useMemo(() => {
    const latest = getLatestPhotoTime(event);
    return latest > 0 ? new Date(latest) : null;
  }, [event]);

  const handlePress = useCallback(() => {
    navigation.navigate("PhotoBoothEventGallery", { event });
  }, [navigation, event]);

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={getHitSlop("medium")}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Text type="subHeader" color={colors.black}>
            {lastPhotoDate ? formatDate(lastPhotoDate) : eventTitle}
          </Text>

          <CountPill
            icon="images"
            label={`${photos.length} Photo${photos.length === 1 ? "" : "s"}`}
            variant="outline"
          />
        </View>

        <Text type="caption" color={colors.gray}>
          Event {formatDate(date)}
        </Text>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <View style={styles.pillRow}>
            {cloudCount > 0 && (
              <CountPill
                icon="cloud"
                label={`${cloudCount} Cloud`}
                variant="cloud"
              />
            )}
            {phoneCount > 0 && (
              <CountPill
                icon="mobile-alt"
                label={`${phoneCount} Phone`}
                variant="phone"
              />
            )}
          </View>

          <FontAwesome5 name="chevron-right" size={16} color={colors.gray} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bottomRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  container: {
    ...card.small,
    gap: 8,
    padding: 16
  },
  divider: {
    backgroundColor: colors.lightGray,
    height: 1,
    width: "100%"
  },
  pill: {
    alignItems: "center",
    borderRadius: 20,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  pillCloud: {
    backgroundColor: colors.primary
  },
  pillOutline: {
    backgroundColor: colors.transparent,
    borderColor: colors.primary,
    borderWidth: 1
  },
  pillPhone: {
    backgroundColor: colors.secondaryTint
  },
  pillRow: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  }
});
