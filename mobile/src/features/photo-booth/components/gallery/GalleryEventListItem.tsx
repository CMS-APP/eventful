import { useCallback } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { GalleryEvent } from "@/types/photoBoothGallery";
import { formatDate } from "@/utils/date";

import { PhotoBoothStackNavigation } from "../../photoBoothStackParams";

interface GalleryEventListItemProps {
  event: GalleryEvent;
}

export function GalleryEventListItem({ event }: GalleryEventListItemProps) {
  const navigation = useNavigation<PhotoBoothStackNavigation>();

  const { eventTitle, photos, date, type } = event;
  const parsedDate = formatDate(date);

  const handlePress = useCallback(() => {
    navigation.navigate("PhotoBoothEventGallery", { event, type });
  }, [navigation, event]);

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={getHitSlop("medium")}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text type="subHeader">{eventTitle}</Text>

          {type === "both" ? (
            <View style={styles.typeContainer}>
              <FontAwesome5 name="cloud" size={20} color={colors.primary} />
              <FontAwesome5 name="folder" size={20} color={colors.primary} />
            </View>
          ) : (
            <FontAwesome5
              name={type === "cloud" ? "cloud" : "folder"}
              size={20}
              color={colors.primary}
            />
          )}
        </View>
        <Text type="body">Date: {parsedDate}</Text>
        <Text type="body">Photos: {photos.length}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    gap: 6,
    padding: 12
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12
  }
});
