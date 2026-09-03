import { useMemo, useState } from "react";

import { Image, StyleSheet, View } from "react-native";

import { ImageBackground } from "expo-image";

import { useAppDimensions } from "@/app/hooks/useAppDimensions";
import { Screen } from "@/components/screen/Screen";
import { Button } from "@/design-system/components/buttons/Button";
import { colors } from "@/design-system/tokens/colors";
import { shadows } from "@/design-system/tokens/shadows";

const IMAGES = [
  require("@/assets/guided-access/img-1.png"),
  require("@/assets/guided-access/img-2.png"),
  require("@/assets/guided-access/img-3.png")
];

type HighlightPlacement = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const HIGHLIGHT_PLACEMENTS: HighlightPlacement[] = [
  { top: 0.17, left: 0.02, width: 0.96, height: 0.075 },
  { top: 0.72, left: 0.02, width: 0.96, height: 0.075 },
  { top: 0.096, left: 0.02, width: 0.96, height: 0.075 }
];

function getHighlightStyle(
  placement: HighlightPlacement,
  imageSize: { width: number; height: number }
) {
  const height = placement.height * imageSize.height;

  return {
    top: placement.top * imageSize.height,
    left: placement.left * imageSize.width,
    width: placement.width * imageSize.width,
    height,
    borderRadius: height * 0.25
  };
}

export function PhotoBoothGuidedAccessInfo() {
  const { screenWidth, screenHeight } = useAppDimensions();
  const [containerSize, setContainerSize] = useState({
    width: screenWidth,
    height: screenHeight * 0.65
  });

  const [currentStep, setCurrentStep] = useState(0);

  const imageSize = useMemo(() => {
    const source = Image.resolveAssetSource(IMAGES[currentStep]);
    const sourceWidth = source?.width || containerSize.width;
    const sourceHeight = source?.height || containerSize.height;
    const maxWidth = containerSize.width * 0.7;
    const maxHeight = containerSize.height * 0.7;
    const scaleFactor = Math.min(
      maxWidth / sourceWidth,
      maxHeight / sourceHeight
    );

    return {
      width: sourceWidth * scaleFactor,
      height: sourceHeight * scaleFactor
    };
  }, [containerSize, currentStep]);

  const highlightStyle = useMemo(
    () => getHighlightStyle(HIGHLIGHT_PLACEMENTS[currentStep], imageSize),
    [currentStep, imageSize]
  );

  function handlePrevious() {
    if (currentStep === 0) return;
    setCurrentStep((prev) => prev - 1);
  }

  function handleNext() {
    if (currentStep === IMAGES.length - 1) return;
    setCurrentStep((prev) => prev + 1);
  }

  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Photo Booth",
          subTitle: "Guided Access Info",
          icon: "camera",
          color: colors.white,
          accountButton: false,
          backgroundColor: colors.primary,
          backAction: true
        }
      }}
      contentConfig={{
        tabBarPresent: true
      }}
    >
      <View
        style={styles.imageContainer}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setContainerSize((prev) =>
            prev.width === width && prev.height === height
              ? prev
              : { width, height }
          );
        }}
      >
        <View style={[styles.imageShadow, imageSize]}>
          <View style={styles.imageWrapper}>
            <ImageBackground
              key={`${currentStep}-${imageSize.width}x${imageSize.height}`}
              source={IMAGES[currentStep]}
              style={styles.image}
              contentFit="fill"
            />
            <View style={[styles.highlight, highlightStyle]} />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text="Previous"
            color={currentStep === 0 ? colors.primary + "60" : colors.primary}
            textColor={colors.white}
            onPress={handlePrevious}
            size="small"
            disabled={currentStep === 0}
            flex={1}
          />

          <Button
            text="Next"
            color={
              currentStep === IMAGES.length - 1
                ? colors.primary + "60"
                : colors.primary
            }
            textColor={colors.white}
            onPress={handleNext}
            size="small"
            disabled={currentStep === IMAGES.length - 1}
            flex={1}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    width: "100%"
  },
  highlight: {
    backgroundColor: colors.primary + "10",
    borderColor: colors.primary,
    borderWidth: 1,
    position: "absolute"
  },
  image: {
    ...StyleSheet.absoluteFillObject
  },
  imageContainer: {
    alignItems: "center",
    flex: 1,
    gap: 30,
    justifyContent: "center",
    width: "100%"
  },
  imageShadow: {
    ...shadows.buttonShadow,
    backgroundColor: colors.white,
    borderRadius: 10
  },
  imageWrapper: {
    borderRadius: 10,
    flex: 1,
    overflow: "hidden",
    position: "relative"
  }
});
