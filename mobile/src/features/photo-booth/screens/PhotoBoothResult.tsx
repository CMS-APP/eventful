import { useSafeAreaInsets } from "react-native-safe-area-context";

import { type RefObject, useMemo, useRef, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { FontAwesome5 } from "@expo/vector-icons";

import { PanSnapGestureRoot } from "@/app/context/panSnap/PanSnapGestureRoot";
import { PanSnapScrollHint } from "@/app/context/panSnap/PanSnapScrollHint";
import type { PhotoBoothStackNavigation } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { usePhotoBoothCamera } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";
import { showOptionsAlert } from "@/utils/alertModal";

import { PhotoBoothCollage } from "../components/result/PhotoBoothCollage";
import { PhotoBoothResultsButtons } from "../components/result/PhotoBoothResultsButtons";
import { ScaledCollage } from "../components/result/ScaledCollage";
import type { CollageSize } from "../components/result/collageScale";
import { filters } from "../filters";

export function PhotoBoothResult() {
  const { setPhotos } = usePhotoBoothCamera();
  const { filter: savedFilter } = usePhotoBoothSettings();
  const navigation = useNavigation<PhotoBoothStackNavigation>();
  const insets = useSafeAreaInsets();

  const savedFilterIndex = useMemo(() => {
    const i = filters.indexOf(savedFilter);
    return i >= 0 ? i : 0;
  }, [savedFilter]);

  const [index, setIndex] = useState(savedFilterIndex);
  const [captureSize, setCaptureSize] = useState<CollageSize | null>(null);

  const viewRef = useRef<View>(null);

  function handleBackAction() {
    setPhotos([]);
    navigation.goBack();
  }

  function handleIndexChange(index: number) {
    setIndex(index);
  }

  function handlePhotoPress(index: number) {
    showOptionsAlert(
      "Redo Photo",
      `Would you like to redo photo ${index + 1}?`,
      [
        {
          text: "Yes",
          onPress: () => navigation.navigate("PhotoBoothRedoPhoto", { index })
        },
        { text: "No", style: "cancel" }
      ]
    );
  }

  return (
    <PanSnapGestureRoot
      count={filters.length}
      initialIndex={savedFilterIndex}
      onIndexChange={handleIndexChange}
    >
      <View style={styles.root}>
        <Screen
          headerConfig={{
            type: "curvy",
            curvyHeaderProps: {
              title: "Photo Booth",
              subTitle: "Result",
              icon: "camera",
              color: colors.white,
              accountButton: false,
              backgroundColor: colors.primary,
              backAction: handleBackAction
            }
          }}
          contentConfig={{
            tabBarPresent: false,
            paddingBottom: 0,
            bottomMargin: false
          }}
        >
          <View style={styles.container}>
            <ScaledCollage captureRef={viewRef} onSizeChange={setCaptureSize}>
              <PhotoBoothCollage
                filter={filters[index]}
                onPhotoPress={handlePhotoPress}
              />
            </ScaledCollage>
          </View>

          <View style={styles.redoContainer}>
            <FontAwesome5 name="redo" size={20} color={colors.black} />
            <Text type="body" center>
              Tap on a photo to redo
            </Text>
          </View>
        </Screen>

        <View
          style={[
            styles.resultsButtonsContainer,
            { paddingBottom: insets.bottom + 12 }
          ]}
        >
          <PanSnapScrollHint labels={filters} />
          <PhotoBoothResultsButtons
            viewRef={viewRef as RefObject<View | null>}
            captureSize={captureSize}
          />
        </View>
      </View>
    </PanSnapGestureRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginTop: 52,
    paddingHorizontal: 24
  },
  redoContainer: {
    ...card.medium,
    alignItems: "center",
    flexDirection: "column",
    gap: 8,
    marginHorizontal: 24,
    marginVertical: 12,
    paddingVertical: 16
  },
  resultsButtonsContainer: {
    backgroundColor: colors.white,
    gap: 16
  },
  root: {
    flex: 1,
    minHeight: 0
  }
});
