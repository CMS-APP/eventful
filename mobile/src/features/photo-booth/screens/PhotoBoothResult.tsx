import { useSafeAreaInsets } from "react-native-safe-area-context";

import { type RefObject, useMemo, useRef, useState } from "react";

import { Alert, StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { FontAwesome5 } from "@expo/vector-icons";

import { PanSnapGestureRoot } from "@/app/context/panSnap/PanSnapGestureRoot";
import { PanSnapScrollHint } from "@/app/context/panSnap/PanSnapScrollHint";
import { useAppDimensions } from "@/app/hooks/useAppDimensions";
import { Screen } from "@/components/screen/Screen";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { usePhotoBoothCamera } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

import { PhotoBoothColumnCollage } from "../components/result/PhotoBoothColumnCollage";
import { PhotoBoothGridCollage } from "../components/result/PhotoBoothGridCollage";
import { PhotoBoothResultsButtons } from "../components/result/PhotoBoothResultsButtons";
import { PhotoBoothRowCollage } from "../components/result/PhotoBoothRowCollage";
import { filters } from "../filters";
import type { PhotoBoothStackNavigation } from "../photoBoothStackParams";

export function PhotoBoothResult() {
  const { setPhotos } = usePhotoBoothCamera();
  const { collageStyle, filter: savedFilter } = usePhotoBoothSettings();
  const navigation = useNavigation<PhotoBoothStackNavigation>();
  const insets = useSafeAreaInsets();
  const width = useAppDimensions().screenWidth;

  const savedFilterIndex = useMemo(() => {
    const i = filters.indexOf(savedFilter);
    return i >= 0 ? i : 0;
  }, [savedFilter]);

  const [index, setIndex] = useState(savedFilterIndex);

  const viewRef = useRef<View>(null);

  function handleBackAction() {
    setPhotos([]);
    navigation.goBack();
  }

  function handleIndexChange(index: number) {
    setIndex(index);
  }

  function handlePhotoPress(index: number) {
    Alert.alert("Redo Photo", `Would you like to redo photo ${index + 1}?`, [
      {
        text: "Yes",
        onPress: () => navigation.navigate("PhotoBoothRedoPhoto", { index })
      },
      { text: "No", style: "cancel" }
    ]);
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
          contentConfig={{ tabBarPresent: false }}
        >
          <View style={styles.container}>
            <View
              ref={viewRef}
              collapsable={false}
              style={[styles.finalImageContainer, { maxWidth: width - 24 }]}
            >
              {collageStyle === "row" ? (
                <PhotoBoothRowCollage
                  filter={filters[index]}
                  onPhotoPress={handlePhotoPress}
                />
              ) : collageStyle === "column" ? (
                <PhotoBoothColumnCollage
                  filter={filters[index]}
                  onPhotoPress={handlePhotoPress}
                />
              ) : collageStyle === "square" ? (
                <PhotoBoothGridCollage
                  filter={filters[index]}
                  onPhotoPress={handlePhotoPress}
                />
              ) : null}
            </View>
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
            { paddingBottom: insets.bottom }
          ]}
        >
          <PanSnapScrollHint labels={filters} />
          <PhotoBoothResultsButtons
            viewRef={viewRef as RefObject<View | null>}
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
  finalImageContainer: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6
  },
  redoContainer: {
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    flexDirection: "column",
    gap: 8,
    marginHorizontal: 24,
    marginTop: 24,
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
