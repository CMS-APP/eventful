import { useCallback } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "@/components/text/Text";
import { colors } from "@/styles/colors";
import { shadows } from "@/styles/shadows";
import { getHitSlop } from "@/utils/hitSlop";

import { usePhotoBoothCamera } from "../../provider/PhotoBoothCameraProvider";
import { usePhotoBoothSession } from "../../provider/PhotoBoothSessionProvider";

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

  const buttonStyle = [
    styles.buttonContainer,
    {
      opacity: disabled ? 0.5 : 1
    }
  ];

  const handlePress = useCallback(() => {
    setIsBoothRunning(!isBoothRunning);
    if (!redo) {
      setPhotos([]);
    }
  }, [isBoothRunning, redo, setIsBoothRunning, setPhotos]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!isCameraReady}
      hitSlop={getHitSlop("small")}
    >
      <View style={buttonStyle}>
        <Text type="subHeader" color={colors.white}>
          {isBoothRunning ? "Stop" : "Capture"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    backgroundColor: colors.black,
    borderColor: colors.buttonBorder,
    borderRadius: 12,
    borderWidth: 0.5,
    justifyContent: "center",
    minHeight: 50,
    padding: 12,
    ...shadows.buttonShadow
  }
});
