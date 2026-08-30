import { useCallback, useState } from "react";

import { Platform, StyleSheet, View } from "react-native";

import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/screen/Screen";
import { Button } from "@/design-system/components/buttons/Button";
import { colors } from "@/design-system/tokens/colors";
import { usePhotoBoothCamera } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
import { usePhotoBoothPermissions } from "@/features/photo-booth/context/permissions/PhotoBoothPermissionsContext";
import { usePhotoBoothSession } from "@/features/photo-booth/context/session/PhotoBoothSessionContext";
import { PhotoBoothLockModal } from "@/features/photo-booth/modals/PhotoBoothLockModal";
import { PhotoBoothUnlockModal } from "@/features/photo-booth/modals/PhotoBoothUnlockModal";

import type { PhotoBoothStackNavigation } from "../photoBoothStackParams";

export function PhotoBoothHome() {
  const navigation = useNavigation<PhotoBoothStackNavigation>();
  const { setPhotos } = usePhotoBoothCamera();
  const { locked, setLocked, lockPin, setLockPin } = usePhotoBoothSession();
  const { ensurePermissions } = usePhotoBoothPermissions();

  const [presentLockModal, setPresentLockModal] = useState(false);
  const [presentUnlockModal, setPresentUnlockModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setPhotos([]);
      };
    }, [setPhotos])
  );

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
            leadingIcon="camera"
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
            leadingIcon="cog"
            onPress={() => {
              navigation.navigate("PhotoBoothCustomise");
            }}
            color={locked ? colors.gray : colors.primary}
            textColor={colors.white}
            disabled={locked}
          />

          <Button
            text="Photo Gallery"
            leadingIcon="cloud"
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
            text={`${locked ? "Un" : ""}Lock Photo Booth `}
            leadingIcon={locked ? "unlock" : "lock"}
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

          {Platform.OS === "ios" && !locked && (
            <Button
              text="Guided Access Info"
              leadingIcon="apple"
              onPress={() => {
                navigation.navigate("PhotoBoothGuidedAccessInfo");
              }}
              color={colors.primary}
              textColor={colors.white}
            />
          )}
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
