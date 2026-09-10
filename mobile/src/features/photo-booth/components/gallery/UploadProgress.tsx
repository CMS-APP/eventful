import { useSelector } from "react-redux";

import { useCallback, useMemo, useState } from "react";

import { Clipboard, StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { usePhotoBoothUpload } from "@/app/context/photoBoothUpload/PhotoBoothUploadContext";
import { AppStackParamList } from "@/app/navigation";
import { Button } from "@/design-system/components/buttons/Button";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { downloadCloudPhotos } from "@/services/photo-booth/cloudPhotos";
import { convertEventTitleToHash } from "@/services/photo-booth/utils";
import { UserState } from "@/store/UserSlice";
import { GalleryEvent, GalleryPhoto } from "@/types/photoBoothGallery";
import { log } from "@/utils/logging";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

import { SyncActionRow } from "./SyncActionRow";

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
  const { queueUpload, isUploading: isUploadingGlobal } = usePhotoBoothUpload();

  const isSyncing = uploading || downloading;
  const noPhotos = event.photos.length === 0;
  const totalPhotos = event.photos.length;
  const allSynced =
    !noPhotos &&
    photoState.local.length === 0 &&
    photoState.cloud.length === 0 &&
    photoState.both.length > 0;

  const showSyncRow = photoState.local.length > 0;
  const showDownloadRow = photoState.cloud.length > 0;
  const canCopyWebGalleryLink =
    !noPhotos && (photoState.cloud.length > 0 || photoState.both.length > 0);

  const handlePaywallPress = useCallback(() => {
    navigation.navigate("Paywall", { type: "Premium" });
  }, [navigation]);

  const downloadPhotos = useCallback(async () => {
    if (isSyncing || photoState.cloud.length === 0) return;
    try {
      setDownloading(true);
      await downloadCloudPhotos(event, photoState.cloud);
      await refreshEvent(event);
    } catch (error) {
      log(`Error Downloading Photos: ${error}`, "error");
      showErrorToast("Error Downloading Photos");
    } finally {
      setDownloading(false);
    }
  }, [event, isSyncing, photoState.cloud, refreshEvent]);

  const uploadPhotos = useCallback(async () => {
    if (isSyncing || isUploadingGlobal || photoState.local.length === 0) return;
    try {
      setUploading(true);
      await queueUpload(userId, event.eventTitle, photoState.local);
      await refreshEvent(event);
    } finally {
      setUploading(false);
    }
  }, [
    event,
    isSyncing,
    isUploadingGlobal,
    photoState.local,
    queueUpload,
    refreshEvent,
    userId
  ]);

  const copyWebGalleryLink = useCallback(async () => {
    if (!userId || !canCopyWebGalleryLink || isSyncing) return;
    try {
      const hash = await convertEventTitleToHash(event.eventTitle);
      const url = `https://app.eventfulapp.com/gallery/${userId}=${hash}`;
      Clipboard.setString(url);
      showSuccessToast("Gallery link copied to clipboard");
    } catch (error) {
      log(`Error Copying Link: ${error}`, "error");
      showErrorToast("Error Copying Link");
    }
  }, [canCopyWebGalleryLink, event.eventTitle, isSyncing, userId]);

  const attachLinkToSync = showSyncRow && canCopyWebGalleryLink;
  const attachLinkToDownload =
    !showSyncRow && showDownloadRow && canCopyWebGalleryLink;
  const showStandaloneLink =
    !showSyncRow && !showDownloadRow && canCopyWebGalleryLink;

  return (
    <View style={styles.container}>
      {noPhotos && (
        <Text type="body" color={colors.darkGray} numberOfLines={3}>
          No photos for this event yet.
        </Text>
      )}

      {allSynced && (
        <Text type="body" color={colors.darkGray} numberOfLines={3}>
          All photos are synced across your device and the cloud.
        </Text>
      )}

      {showSyncRow && (
        <SyncActionRow
          icon="cloud"
          progress={
            totalPhotos > 0
              ? ((totalPhotos - photoState.local.length) / totalPhotos) * 100
              : 0
          }
          title={`Sync ${photoState.local.length} of ${totalPhotos}`}
          subtitle={
            uploading
              ? "Uploading…"
              : isUploadingGlobal
                ? "Waiting for other upload to finish…"
                : "Tap to sync"
          }
          actionLabel={`Sync ${photoState.local.length} photo${photoState.local.length === 1 ? "" : "s"}`}
          actionIcon="cloud-upload-alt"
          caption="Keeps your photos backed up in the cloud"
          onPress={uploadPhotos}
          loading={uploading}
          disabled={downloading || isUploadingGlobal}
          premium={premium}
          onPaywallPress={handlePaywallPress}
          secondaryIcon={attachLinkToSync ? "link" : undefined}
          onSecondaryPress={attachLinkToSync ? copyWebGalleryLink : undefined}
        />
      )}

      {showDownloadRow && (
        <SyncActionRow
          icon="cloud-download-alt"
          progress={
            totalPhotos > 0
              ? ((totalPhotos - photoState.cloud.length) / totalPhotos) * 100
              : 0
          }
          title={`Download ${photoState.cloud.length} of ${totalPhotos}`}
          subtitle={downloading ? "Downloading…" : "Tap to download"}
          actionLabel={`Download ${photoState.cloud.length} photo${photoState.cloud.length === 1 ? "" : "s"}`}
          actionIcon="download"
          caption="Saves the cloud photos to this device"
          onPress={downloadPhotos}
          loading={downloading}
          disabled={uploading}
          premium={premium}
          onPaywallPress={handlePaywallPress}
          secondaryIcon={attachLinkToDownload ? "link" : undefined}
          onSecondaryPress={attachLinkToDownload ? copyWebGalleryLink : undefined}
        />
      )}

      {showStandaloneLink && (
        <Button
          text="Copy gallery link"
          onPress={premium ? copyWebGalleryLink : handlePaywallPress}
          color={colors.primary}
          textColor={colors.white}
          disabled={premium && isSyncing}
          leadingIcon={"link"}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...card.small,
    gap: 16,
    padding: 16
  }
});
