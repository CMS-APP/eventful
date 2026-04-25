import { StyleSheet, TouchableOpacity } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { colors } from "@/styles/colors";
import { Photo } from "@/types/Photo";
import { getHitSlop } from "@/utils/hitSlop";

export function ImageButtons({
  currentIndex,
  photos,
  setCurrentIndex
}: {
  currentIndex: number;
  photos: Photo[];
  setCurrentIndex: (index: number) => void;
}) {
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.navButton,
          styles.leftButton,
          currentIndex === 0
            ? styles.navButtonDisabled
            : styles.navButtonEnabled
        ]}
        onPress={goToPrevious}
        disabled={currentIndex === 0}
        hitSlop={getHitSlop("small")}
      >
        <FontAwesome5 name="arrow-left" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navButton,
          styles.rightButton,
          currentIndex === photos.length - 1
            ? styles.navButtonDisabled
            : styles.navButtonEnabled
        ]}
        onPress={goToNext}
        disabled={currentIndex === photos.length - 1}
        hitSlop={getHitSlop("small")}
      >
        <FontAwesome5 name="arrow-right" size={24} color="white" />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  leftButton: {
    left: 10
  },
  navButton: {
    alignItems: "center",
    backgroundColor: colors.blackTransparent,
    borderRadius: 24,
    height: 40,
    justifyContent: "center",
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 50
  },
  navButtonDisabled: {
    opacity: 0.5
  },
  navButtonEnabled: {
    opacity: 1
  },
  rightButton: {
    right: 10
  }
});
