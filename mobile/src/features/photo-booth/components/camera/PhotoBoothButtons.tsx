import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { colors } from "@/styles/colors";

import type { PhotoBoothStackNavigation } from "../../photoBoothStackParams";
import { usePhotoBoothCamera } from "../../provider/PhotoBoothCameraProvider";
import { usePhotoBoothSession } from "../../provider/PhotoBoothSessionProvider";
import { usePhotoBoothSettings } from "../../provider/PhotoBoothSettingsProvider";
import { PhotoBoothButton } from "./PhotoBoothButton";
import { PhotoBoothCaptureButton } from "./PhotoBoothCaptureButton";

export function PhotoBoothButtons({
  redo,
  setShowCustomiseCollageModal
}: {
  redo?: boolean;
  setShowCustomiseCollageModal: (show: boolean) => void;
}) {
  const navigation = useNavigation<PhotoBoothStackNavigation>();
  const { bottom } = useSafeAreaInsets();
  const { isBoothRunning } = usePhotoBoothSession();
  const { toggleCamera, flash, toggleFlash, isCameraReady } =
    usePhotoBoothCamera();
  const { canChangeCollage } = usePhotoBoothSettings();

  function handleBackPress() {
    navigation.goBack();
  }

  return (
    <View style={[styles.buttonsContainer, { marginBottom: bottom }]}>
      <View style={styles.buttonColumn}>
        <PhotoBoothButton
          onPress={() => setShowCustomiseCollageModal(true)}
          icon="cog"
          color={colors.darkGray}
          textColor={colors.white}
          disabled={isBoothRunning || redo || !canChangeCollage}
        />
        <PhotoBoothButton
          onPress={handleBackPress}
          icon="arrow-left"
          color={colors.darkGray}
          textColor={colors.white}
          disabled={isBoothRunning}
        />
      </View>

      <View style={styles.captureSlot}>
        <PhotoBoothCaptureButton disabled={!isCameraReady} redo={redo} />
      </View>

      <View style={styles.buttonColumn}>
        <PhotoBoothButton
          onPress={toggleFlash}
          icon={"bolt"}
          color={flash ? colors.darkGray : colors.darkGray + "40"}
          textColor={colors.white}
          disabled={isBoothRunning}
        />

        <PhotoBoothButton
          onPress={toggleCamera}
          icon="retweet"
          color={colors.darkGray}
          textColor={colors.white}
          disabled={isBoothRunning}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonColumn: {
    gap: 16
  },
  buttonsContainer: {
    alignItems: "flex-end",
    bottom: 0,
    flexDirection: "row",
    gap: 24,
    left: 0,
    paddingHorizontal: 24,
    position: "absolute",
    right: 0,
    width: "100%"
  },
  captureSlot: {
    flex: 1
  }
});
