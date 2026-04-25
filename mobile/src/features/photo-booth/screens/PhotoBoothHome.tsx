import { useCallback, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { Button } from "@/components/buttons/Button";
import { Screen } from "@/components/views/screen/Screen";
import { PhotoBoothLockModal } from "@/features/photo-booth/modals/PhotoBoothLockModal";
import { PhotoBoothUnlockModal } from "@/features/photo-booth/modals/PhotoBoothUnlockModal";
import { colors } from "@/styles/colors";

import type { PhotoBoothStackNavigation } from "../photoBoothStackParams";
import { usePhotoBoothCamera } from "../provider/PhotoBoothCameraProvider";
import { usePhotoBoothPermissions } from "../provider/PhotoBoothPermissionsProvider";
import { usePhotoBoothSession } from "../provider/PhotoBoothSessionProvider";
import { ensurePhotoBoothPermissions } from "../utils/ensurePhotoBoothPermissions";

export function PhotoBoothHome() {
  const navigation = useNavigation<PhotoBoothStackNavigation>();
  const { setPhotos } = usePhotoBoothCamera();
  const { locked, setLocked, lockPin, setLockPin } = usePhotoBoothSession();
  const {
    cameraPermission,
    photoLibraryPermission,
    checkPhotoBoothPermission,
    photoBoothPermissionAlert,
    requestCameraPermission,
    requestPhotoLibraryPermission
  } = usePhotoBoothPermissions();

  const [presentLockModal, setPresentLockModal] = useState(false);
  const [presentUnlockModal, setPresentUnlockModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setPhotos([]);
      };
    }, [setPhotos])
  );

  const ensurePermissions = useCallback(async () => {
    return ensurePhotoBoothPermissions({
      cameraPermission,
      photoLibraryPermission,
      checkPhotoBoothPermission,
      requestCameraPermission,
      requestPhotoLibraryPermission,
      photoBoothPermissionAlert
    });
  }, [
    cameraPermission,
    photoLibraryPermission,
    checkPhotoBoothPermission,
    requestCameraPermission,
    requestPhotoLibraryPermission,
    photoBoothPermissionAlert
  ]);

  function backAction() {
    if (locked) {
      setPresentUnlockModal(true);
    } else {
      navigation.goBack();
    }
  }

  return (
    <>
      <PhotoBoothLockModal
        locked={locked}
        setLocked={setLocked}
        presentModal={presentLockModal}
        setPresentModal={setPresentLockModal}
        lockPin={lockPin}
        setLockPin={setLockPin}
      />

      <PhotoBoothUnlockModal
        locked={locked}
        setLocked={setLocked}
        presentModal={presentUnlockModal}
        setPresentModal={setPresentUnlockModal}
        lockPin={lockPin}
        setLockPin={setLockPin}
      />

      <Screen
        headerConfig={{
          type: "curvy",
          curvyHeaderProps: {
            title: "Photo Booth",
            subTitle: "Home",
            icon: "camera",
            color: colors.white,
            accountButton: false,
            backgroundColor: colors.primary,
            backAction: backAction
          }
        }}
        contentConfig={{
          tabBarPresent: false
        }}
      >
        <View style={styles.container}>
          <Button
            text="Open Photo Booth"
            icon="camera"
            onPress={async () => {
              const hasPermissions = await ensurePermissions();
              if (!hasPermissions) {
                return;
              }
              navigation.navigate("PhotoBoothCamera");
            }}
            color={colors.primary}
            textColor={colors.white}
          />

          <Button
            text="Customise"
            icon="cog"
            onPress={() => {
              navigation.navigate("PhotoBoothCustomise");
            }}
            color={locked ? colors.gray : colors.primary}
            textColor={colors.white}
            disabled={locked}
          />

          <Button
            text="Photo Gallery"
            icon="cloud"
            onPress={async () => {
              const hasPermissions = await ensurePermissions();
              if (!hasPermissions) {
                return;
              }
              navigation.navigate("PhotoBoothGallery");
            }}
            color={locked ? colors.gray : colors.primary}
            textColor={colors.white}
            disabled={locked}
          />

          <Button
            text={locked ? "Unlock Photo Booth" : "Lock Photo Booth"}
            icon={locked ? "unlock" : "lock"}
            onPress={() => {
              if (locked) {
                setPresentUnlockModal(true);
              } else {
                setPresentLockModal(true);
              }
            }}
            color={colors.primary}
            textColor={colors.white}
          />
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginTop: 52,
    paddingHorizontal: 24
  }
});
