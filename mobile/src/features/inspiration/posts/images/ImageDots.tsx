import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";
import { Photo } from "@/types/Photo";

export function ImageDots({
  photos,
  currentIndex
}: {
  photos: Photo[];
  currentIndex: number;
}) {
  return (
    <View style={styles.dotsContainer}>
      <View style={styles.dotsWrapper}>
        {photos.map((_, index) => (
          <View
            key={`dot-${index}`}
            style={[
              styles.dot,
              index === currentIndex ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeDot: {
    opacity: 1
  },
  dot: {
    backgroundColor: colors.white,
    borderRadius: 4,
    height: 8,
    width: 8
  },
  dotsContainer: {
    alignSelf: "center"
  },
  dotsWrapper: {
    alignItems: "center",
    backgroundColor: colors.blackTransparent,
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  inactiveDot: {
    opacity: 0.5
  }
});
