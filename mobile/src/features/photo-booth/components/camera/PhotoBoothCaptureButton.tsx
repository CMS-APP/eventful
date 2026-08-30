import { useCallback } from "react";

import { CameraActionButton } from "@/components/camera/CameraActionButton";
import { usePhotoBoothCamera } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
import { usePhotoBoothSession } from "@/features/photo-booth/context/session/PhotoBoothSessionContext";

interface PhotoBoothCaptureButtonProps {
  disabled?: boolean;
  redo?: boolean;
}

export function PhotoBoothCaptureButton({
  disabled = false,
  redo = false
}: PhotoBoothCaptureButtonProps) {
  const { isBoothRunning, setIsBoothRunning } = usePhotoBoothSession();
  const { isCameraReady, setPhotos } = usePhotoBoothCamera();

  const handlePress = useCallback(() => {
    setIsBoothRunning(!isBoothRunning);
    if (!redo) {
      setPhotos([]);
    }
  }, [isBoothRunning, redo, setIsBoothRunning, setPhotos]);

  return (
    <CameraActionButton
      label={isBoothRunning ? "Stop" : "Capture"}
      onPress={handlePress}
      disabled={disabled || !isCameraReady}
    />
  );
}
