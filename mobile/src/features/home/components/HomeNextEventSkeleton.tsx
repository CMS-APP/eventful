import { StyleSheet, View } from "react-native";

import { useAppDimensions } from "@/app/hooks/useAppDimensions";
import { Skeleton } from "@/design-system/components/feedback/Skeleton";

export function HomeNextEventSkeleton() {
  const { screenWidth } = useAppDimensions();
  const contentWidth = screenWidth - 48;

  return (
    <View style={styles.contentContainer}>
      <Skeleton
        width={contentWidth * 0.5}
        height={22}
        style={styles.headerSkeleton}
      />

      <View style={styles.invitesRow}>
        <Skeleton width={106} height={50} borderRadius={20} />
        <Skeleton width={150} height={40} borderRadius={24} />
      </View>

      <View style={styles.row}>
        <Skeleton width={contentWidth * 0.62} height={110} borderRadius={24} />
        <Skeleton width={contentWidth * 0.32} height={110} borderRadius={24} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: 4,
    paddingHorizontal: 24
  },
  headerSkeleton: {
    alignSelf: "center",
    marginBottom: 8,
    marginTop: 12
  },
  invitesRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12
  },
  row: {
    flexDirection: "row",
    gap: 6
  }
});
