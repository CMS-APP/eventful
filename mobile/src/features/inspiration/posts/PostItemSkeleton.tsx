import { StyleSheet, View } from "react-native";

import { useAppDimensions } from "@/app/hooks/useAppDimensions";
import { Skeleton } from "@/design-system/components/feedback/Skeleton";
import { colors } from "@/design-system/tokens/colors";

export function PostItemSkeleton() {
  const { screenWidth } = useAppDimensions();
  const contentWidth = screenWidth - 48 - 32;

  return (
    <View style={styles.postItem}>
      <View style={styles.header}>
        <Skeleton width={36} height={36} borderRadius={18} />
        <View style={styles.authorSection}>
          <Skeleton width={contentWidth * 0.35} height={14} />
          <Skeleton
            width={contentWidth * 0.2}
            height={12}
            style={styles.timeSkeleton}
          />
        </View>
      </View>

      <Skeleton width={contentWidth} height={contentWidth * 0.75} />

      <View style={styles.textSection}>
        <Skeleton width={contentWidth * 0.5} height={16} />
        <Skeleton
          width={contentWidth * 0.85}
          height={14}
          style={styles.descriptionSkeleton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  authorSection: {
    alignItems: "flex-start",
    gap: 6
  },
  descriptionSkeleton: {
    marginTop: 6
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  postItem: {
    backgroundColor: colors.white,
    borderRadius: 16,
    gap: 12,
    padding: 16
  },
  textSection: {
    gap: 6
  },
  timeSkeleton: {
    marginTop: 2
  }
});
