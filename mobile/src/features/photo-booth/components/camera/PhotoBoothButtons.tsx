import { useNavigation } from "@react-navigation/native";

import { PhotoBoothStackNavigation } from "@/app/navigation";
import { CameraControlsBar } from "@/components/camera/CameraControlsBar";
import { CameraFlashButton } from "@/components/camera/CameraFlashButton";
import { CameraIconButton } from "@/components/camera/CameraIconButton";
import { CameraLensToggleButton } from "@/components/camera/CameraLensToggleButton";
import { usePhotoBoothCamera } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
import { usePhotoBoothSession } from "@/features/photo-booth/context/session/PhotoBoothSessionContext";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

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
  const {
    toggleCamera,
    flash,
    toggleFlash,
    isCameraReady,
    isUltraWideAvailable,
    isUltraWideActive,
    toggleUltraWide
  } = usePhotoBoothCamera();
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
          {isUltraWideAvailable ? (
            <CameraLensToggleButton
              active={isUltraWideActive}
              onPress={toggleUltraWide}
              disabled={isBoothRunning}
            />
          ) : null}
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
