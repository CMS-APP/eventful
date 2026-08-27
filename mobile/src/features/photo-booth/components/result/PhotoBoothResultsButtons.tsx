import { captureRef } from "react-native-view-shot";

import { type RefObject, useEffect, useState } from "react";

import { Alert, StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { PhotoResult } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";

import { colors } from "@/design-system/tokens/colors";
import { usePhotoBoothCamera } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";
import {
  savePhotoDataLocally,
  sharePhoto
} from "@/services/photo-booth/localPhotos";
import { saveIndividualPhoto } from "@/services/photo-booth/photos";

import type { PhotoBoothStackNavigation } from "../../photoBoothStackParams";
import { PhotoBoothResultsButton } from "./PhotoBoothResultsButton";

export function PhotoBoothResultsButtons({
  viewRef
}: {
  viewRef: RefObject<View | null>;
}) {
  const navigation = useNavigation<PhotoBoothStackNavigation>();

  const { photos, setPhotos } = usePhotoBoothCamera();
  const {
    title,
    subTitle,
    flipPhotosHorizontally,
    setFlipPhotosHorizontally,
    saveIndividualPhotos,
    autoSave
  } = usePhotoBoothSettings();
  const [loading, setLoading] = useState(false);

  const handleRetake = () => {
    setPhotos([]);
    navigation.goBack();
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (!viewRef.current) {
        Alert.alert("Error", "Nothing to save");
        return;
      }

      if (saveIndividualPhotos) {
        for (const photo of photos) {
          await saveIndividualPhoto(photo as PhotoResult);
        }
      }

      const capturedUri = await captureRef(viewRef.current, {
        format: "png",
        quality: 0.8
      });

      const cacheDir = FileSystem.cacheDirectory;
      const destUri = `${cacheDir}photo-booth-${Date.now()}.png`;
      await FileSystem.copyAsync({ from: capturedUri, to: destUri });
      const combinedAsset = await MediaLibrary.createAssetAsync(destUri);

      await savePhotoDataLocally(
        combinedAsset.id,
        title,
        subTitle,
        new Date(),
        combinedAsset.uri
      );

      Alert.alert(
        "Photo saved",
        "Your photo has been saved to your camera roll"
      );
    } catch {
      Alert.alert("Error", "Failed to save photo");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (!viewRef.current) {
        Alert.alert("Error", "Nothing to share");
        return;
      }

      const capturedUri = await captureRef(viewRef.current, {
        format: "png",
        quality: 0.8
      });

      await sharePhoto(capturedUri);
    } catch {
      Alert.alert("Error", "Failed to share photo");
    }
  };

  useEffect(() => {
    if (autoSave) {
      setTimeout(() => {
        handleSave();
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSave]);

  return (
    <>
      <View style={styles.buttonRow}>
        <PhotoBoothResultsButton
          onPress={handleRetake}
          icon="arrow-left"
          title="Retake"
          color={colors.primary}
          textColor={colors.white}
        />

        <PhotoBoothResultsButton
          onPress={handleSave}
          icon="save"
          title="Save"
          color={colors.primary}
          textColor={colors.white}
          loading={loading}
        />

        <PhotoBoothResultsButton
          onPress={handleShare}
          icon="share-alt"
          title="Share"
          color={colors.primary}
          textColor={colors.white}
        />

        <PhotoBoothResultsButton
          onPress={() => setFlipPhotosHorizontally(!flipPhotosHorizontally)}
          icon="retweet"
          title="Flip"
          color={colors.primary}
          textColor={colors.white}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 12
  }
});
