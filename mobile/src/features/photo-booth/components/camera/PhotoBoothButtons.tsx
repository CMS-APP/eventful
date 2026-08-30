import { useNavigation } from "@react-navigation/native";

import { CameraControlsBar } from "@/components/camera/CameraControlsBar";
import { CameraFlashButton } from "@/components/camera/CameraFlashButton";
import { CameraIconButton } from "@/components/camera/CameraIconButton";
import { usePhotoBoothCamera } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
import { usePhotoBoothSession } from "@/features/photo-booth/context/session/PhotoBoothSessionContext";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

import type { PhotoBoothStackNavigation } from "../../photoBoothStackParams";
import { PhotoBoothCaptureButton } from "./PhotoBoothCaptureButton";

export function PhotoBoothButtons({
  redo,
  setShowCustomiseCollageModal
}: {
  redo?: boolean;
  setShowCustomiseCollageModal: (show: boolean) => void;
}) {
  const navigation = useNavigation<PhotoBoothStackNavigation>();
  const { isBoothRunning } = usePhotoBoothSession();
  const { toggleCamera, flash, toggleFlash, isCameraReady } =
    usePhotoBoothCamera();
  const { canChangeCollage } = usePhotoBoothSettings();

  function handleBackPress() {
    navigation.goBack();
  }

  return (
    <CameraControlsBar
      left={
        <>
          <CameraIconButton
            onPress={() => setShowCustomiseCollageModal(true)}
            icon="cog"
            disabled={isBoothRunning || redo || !canChangeCollage}
          />
          <CameraIconButton
            onPress={handleBackPress}
            icon="arrow-left"
            disabled={isBoothRunning}
          />
        </>
      }
      center={<PhotoBoothCaptureButton disabled={!isCameraReady} redo={redo} />}
      right={
        <>
          <CameraFlashButton
            onPress={toggleFlash}
            enabled={flash}
            disabled={isBoothRunning}
          />
          <CameraIconButton
            onPress={toggleCamera}
            icon="retweet"
            disabled={isBoothRunning}
          />
        </>
      }
    />
  );
}
