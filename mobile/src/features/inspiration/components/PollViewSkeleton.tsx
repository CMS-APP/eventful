import { StyleSheet, View } from "react-native";

import { useAppDimensions } from "@/app/hooks/useAppDimensions";
import { Skeleton } from "@/design-system/components/feedback/Skeleton";
import { colors } from "@/design-system/tokens/colors";

export function PollViewSkeleton() {
  const { screenWidth } = useAppDimensions();
  const contentWidth = screenWidth - 48 - 32;

  return (
    <View style={styles.contentContainer}>
      <Skeleton width={contentWidth * 0.5} height={20} />
      <Skeleton
        width={contentWidth * 0.75}
        height={16}
        style={styles.subtitleSkeleton}
      />

      <View style={styles.optionsContainer}>
        <Skeleton width={contentWidth} height={44} borderRadius={12} />
        <Skeleton width={contentWidth} height={44} borderRadius={12} />
        <Skeleton width={contentWidth * 0.4} height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16
  },
  optionsContainer: {
    gap: 12,
    marginTop: 8
  },
  subtitleSkeleton: {
    marginTop: 8
  }
});
