import { useSelector } from "react-redux";

import { useCallback, useMemo, useState } from "react";

import { Alert, Clipboard, StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AppStackParamList } from "@/app/navigation";
import { Button } from "@/design-system/components/buttons/Button";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import {
  downloadCloudPhotos,
  uploadPhotosToCloud
} from "@/services/photo-booth/cloudPhotos";
import { convertEventTitleToHash } from "@/services/photo-booth/utils";
import { UserState } from "@/store/UserSlice";
import { GalleryEvent, GalleryPhoto } from "@/types/photoBoothGallery";
import { showErrorToast } from "@/utils/toast";

type PhotoState = {
  local: GalleryPhoto[];
  cloud: GalleryPhoto[];
  both: GalleryPhoto[];
};

export function UploadProgress({
  event,
  refreshEvent
}: {
  event: GalleryEvent;
  refreshEvent: (event: GalleryEvent) => Promise<void>;
}) {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const premium = useSelector((state: UserState) => state.premium);
  const userId = useSelector((state: UserState) => state.uid);

  const photoState = useMemo<PhotoState>(() => {
    const next: PhotoState = { local: [], cloud: [], both: [] };
    for (const photo of event.photos) {
      next[photo.type].push(photo);
    }
    return next;
  }, [event.photos]);

  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isSyncing = uploading || downloading;
  const noPhotos = event.photos.length === 0;
  const allSynced =
    !noPhotos &&
    photoState.local.length === 0 &&
    photoState.cloud.length === 0 &&
    photoState.both.length > 0;

  const canCopyWebGalleryLink =
    !noPhotos && (photoState.cloud.length > 0 || photoState.both.length > 0);

  const downloadPhotos = useCallback(async () => {
    if (isSyncing || photoState.cloud.length === 0) return;
    try {
      setDownloading(true);
      await downloadCloudPhotos(event, photoState.cloud);
      await refreshEvent(event);
    } catch {
      showErrorToast("Error Downloading Photos");
    } finally {
      setDownloading(false);
    }
  }, [event, isSyncing, photoState.cloud, refreshEvent]);

  const uploadPhotos = useCallback(async () => {
    if (isSyncing || photoState.local.length === 0) return;
    try {
      setUploading(true);
      await uploadPhotosToCloud(userId, event.eventTitle, photoState.local);
      await refreshEvent(event);
    } catch {
      showErrorToast("Error Uploading Photos");
    } finally {
      setUploading(false);
    }
  }, [event, isSyncing, photoState.local, refreshEvent, userId]);

  const copyWebGalleryLink = useCallback(async () => {
    if (!userId || !canCopyWebGalleryLink || isSyncing) return;
    try {
      const hash = await convertEventTitleToHash(event.eventTitle);
      const url = `https://app.eventfulapp.com/gallery/${userId}=${hash}`;
      Clipboard.setString(url);
      Alert.alert(
        "Link copied",
        "The gallery link has been copied to your clipboard."
      );
    } catch {
      showErrorToast("Error Copying Link");
    }
  }, [canCopyWebGalleryLink, event.eventTitle, isSyncing, userId]);

  const nonPremiumContent = (
    <Button
      text="Upgrade to sync to the cloud"
      onPress={() => {
        navigation.navigate("Paywall", { type: "Premium" });
      }}
      color={colors.primary}
      textColor={colors.white}
    />
  );

  const premiumContent = (
    <>
      {photoState.local.length > 0 && (
        <Button
          text={`Sync ${photoState.local.length} photo${photoState.local.length > 1 ? "s" : ""}`}
          onPress={uploadPhotos}
          color={colors.primary}
          textColor={colors.white}
          loading={uploading}
          disabled={downloading}
        />
      )}

      {photoState.cloud.length > 0 && (
        <Button
          text={`Download ${photoState.cloud.length} photo${photoState.cloud.length > 1 ? "s" : ""}`}
          onPress={downloadPhotos}
          color={colors.primary}
          textColor={colors.white}
          loading={downloading}
          disabled={uploading}
        />
      )}
    </>
  );

  const statusSection = (() => {
    if (noPhotos) {
      return (
        <Text type="body" color={colors.darkGray} numberOfLines={3}>
          No photos for this event yet.
        </Text>
      );
    }
    if (allSynced) {
      return (
        <Text type="body" color={colors.darkGray} numberOfLines={3}>
          All photos are synced across your device and the cloud.
        </Text>
      );
    }
    return (
      <View style={styles.chipRow}>
        {photoState.local.length > 0 && (
          <View
            style={[
              styles.chip,
              { backgroundColor: colors.primaryTint + "35" }
            ]}
          >
            <Text type="caption" color={colors.primaryDark}>
              {photoState.local.length} on device
            </Text>
          </View>
        )}
        {photoState.cloud.length > 0 && (
          <View
            style={[styles.chip, { backgroundColor: colors.buttonBlue + "28" }]}
          >
            <Text type="caption" color={colors.darkGray}>
              {photoState.cloud.length} in cloud
            </Text>
          </View>
        )}
        {photoState.both.length > 0 && (
          <View style={[styles.chip, { backgroundColor: colors.green + "30" }]}>
            <Text type="caption" color={colors.primaryDark}>
              {photoState.both.length} synced
            </Text>
          </View>
        )}
      </View>
    );
  })();

  return (
    <View style={styles.container}>
      <Text type="subHeader">Sync status</Text>

      {statusSection}
      {canCopyWebGalleryLink && (
        <Button
          text="Copy link"
          onPress={copyWebGalleryLink}
          color={colors.primary}
          textColor={colors.white}
          disabled={isSyncing}
        />
      )}
      {!premium && nonPremiumContent}
      {premium && premiumContent}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  container: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    flex: 1,
    gap: 6,
    justifyContent: "center",
    padding: 16
  }
});
