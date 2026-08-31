import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { Alert, StyleSheet, View } from "react-native";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AppStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { Button } from "@/design-system/components/buttons/Button";
import { colors } from "@/design-system/tokens/colors";
import {
  deletePhotoCloud,
  downloadCloudPhoto,
  uploadPhotosToCloud
} from "@/services/photo-booth/cloudPhotos";
import {
  deletePhotoLocally,
  sharePhoto
} from "@/services/photo-booth/localPhotos";
import { UserState } from "@/store/UserSlice";
import { showOptionsAlert } from "@/utils/alertModal";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

import { GalleryPhotoItem } from "../components/gallery/GalleryPhotoItem";
import {
  PhotoBoothStackNavigation,
  PhotoBoothStackParamList
} from "../photoBoothStackParams";

export function PhotoBoothPhoto() {
  const { photo: initialPhoto } =
    useRoute<RouteProp<PhotoBoothStackParamList, "PhotoBoothPhoto">>().params;
  const navigation = useNavigation<PhotoBoothStackNavigation>();
  const appNavigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const userId = useSelector((state: UserState) => state.uid);
  const premium = useSelector((state: UserState) => state.premium);

  const [photo, setPhoto] = useState(initialPhoto);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  function getSubTitle() {
    if (photo.type === "cloud") {
      return "Uploaded";
    } else if (photo.type === "local") {
      return "On Device";
    } else if (photo.type === "both") {
      return "Sycnded";
    }
  }

  const subTitle = getSubTitle();

  const handleShare = useCallback(() => {
    const source = photo.url ?? photo.uri;
    if (!source?.trim()) {
      Alert.alert("Share", "No image is available to share.");
      return;
    }
    void sharePhoto(source);
  }, [photo]);

  const handleDelete = useCallback(async () => {
    try {
      if (photo.type === "cloud" || photo.type === "both") {
        await deletePhotoCloud(photo, userId);
      }
      if (photo.type === "local" || photo.type === "both") {
        await deletePhotoLocally(photo);
      }
      navigation.goBack();
    } catch (error) {
      log(`Error deleting photo: ${error} ${JSON.stringify(photo)}`, "error");
      showErrorToast("Error Deleting Photo");
    }
  }, [navigation, userId, photo]);

  const deletePhotoAlert = useCallback(() => {
    showOptionsAlert(
      "Delete Photo",
      "Are you sure you want to delete this photo?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: handleDelete }
      ]
    );
  }, [handleDelete]);

  const handlePhotoPress = useCallback(() => {
    showOptionsAlert("Photo Booth Photo", "Choose an action", [
      {
        text: "Share",
        onPress: handleShare
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: deletePhotoAlert
      },
      { text: "Cancel", style: "cancel" }
    ]);
  }, [handleShare, deletePhotoAlert]);

  const handleUpload = useCallback(async () => {
    if (!premium) {
      appNavigation.navigate("Paywall", { type: "Premium" });
      return;
    }

    try {
      setUploading(true);
      const [result] = await uploadPhotosToCloud(userId, photo.eventTitle, [
        photo
      ]);
      setPhoto({
        ...photo,
        type: "both",
        storageId: result?.storageId,
        url: result?.url,
        width: result?.width,
        height: result?.height
      });
    } catch (error) {
      log(`Error Uploading Photos: ${error}`, "error");
      showErrorToast("Error Uploading Photos");
    } finally {
      setUploading(false);
    }
  }, [photo, userId, premium, appNavigation]);

  const handleDownload = useCallback(async () => {
    try {
      setDownloading(true);
      await downloadCloudPhoto(photo, userId);
      setPhoto({ ...photo, type: "both" });
    } catch (error) {
      log(`Error Downloading Photo: ${error}`, "error");
      showErrorToast("Error Downloading Photo");
    } finally {
      setDownloading(false);
    }
  }, [photo, userId]);

  return (
    <Screen
      contentConfig={{ tabBarPresent: false }}
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Photo Booth Photo",
          subTitle: subTitle,
          icon: "image",
          color: colors.white,
          accountButton: false,
          backgroundColor: colors.primary,
          backAction: true
        }
      }}
    >
      <View style={styles.container}>
        <GalleryPhotoItem photo={photo} onPhotoPress={handlePhotoPress} />

        {photo.type === "local" && (
          <Button
            text={premium ? "Upload" : "Upgrade to upload"}
            leadingIcon="upload"
            onPress={handleUpload}
            color={colors.primary}
            textColor={colors.white}
            loading={uploading}
          />
        )}

        {photo.type === "cloud" && (
          <Button
            text="Download"
            leadingIcon="download"
            onPress={handleDownload}
            color={colors.primary}
            textColor={colors.white}
            loading={downloading}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    marginHorizontal: 24,
    paddingTop: 52
  }
});
