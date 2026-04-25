import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Platform, StyleSheet, View } from "react-native";

import {
  useFocusEffect,
  useIsFocused,
  useNavigation
} from "@react-navigation/native";

import { CameraView } from "expo-camera";

import { colors } from "@/styles/colors";

import { CameraHeader } from "../components/camera/CameraHeader";
import { CameraPictureRow } from "../components/camera/CameraPictureRow";
import { PhotoBoothButtons } from "../components/camera/PhotoBoothButtons";
import {
  PhotoBoothTimer,
  PhotoBoothTimerHandle
} from "../components/camera/PhotoBoothTimer";
import type { PhotoBoothStackNavigation } from "../photoBoothStackParams";
import { usePhotoBoothCamera } from "../provider/PhotoBoothCameraProvider";
import { usePhotoBoothSession } from "../provider/PhotoBoothSessionProvider";
import { usePhotoBoothSettings } from "../provider/PhotoBoothSettingsProvider";

export function PhotoBoothCamera() {
  const navigation = useNavigation<PhotoBoothStackNavigation>();
  const isFocused = useIsFocused();
  const { facing, flash, setIsCameraReady, setPhotos } = usePhotoBoothCamera();
  const { isBoothRunning, setIsBoothRunning } = usePhotoBoothSession();
  const { collageStyle, timerDuration } = usePhotoBoothSettings();
  const cameraRef = useRef<CameraView>(null);
  const photoBoothTimerRef = useRef<PhotoBoothTimerHandle>(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [cameraSessionKey, setCameraSessionKey] = useState(0);
  const [canRenderCamera, setCanRenderCamera] = useState(true);
  const [showCustomiseCollageModal, setShowCustomiseCollageModal] =
    useState(false);

  const flashMode = flash ? "on" : "off";

  const maxPhotos = useMemo(() => {
    return collageStyle === "row" || collageStyle === "column" ? 3 : 4;
  }, [collageStyle]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsBoothRunning(false);
        setIsCameraReady(false);
      };
    }, [setIsBoothRunning, setIsCameraReady])
  );

  useEffect(() => {
    if (!isBoothRunning) return;
    photoBoothTimerRef.current?.start();
  }, [isBoothRunning]);

  useEffect(() => {
    setIsCameraReady(false);
  }, [facing, isFocused, setIsCameraReady]);

  useEffect(() => {
    if (!isLayoutReady || !isFocused) return;
    if (Platform.OS !== "android") return;

    setCanRenderCamera(false);
    const timer = setTimeout(() => {
      setCameraSessionKey((prev) => prev + 1);
      setCanRenderCamera(true);
    }, 80);

    return () => {
      clearTimeout(timer);
    };
  }, [facing, isFocused, isLayoutReady]);

  async function onTimerComplete() {
    const result = await cameraRef.current?.takePictureAsync();

    if (result) {
      let totalPhotos = 0;
      setPhotos((prev) => {
        totalPhotos = prev.length + 1;
        return [...prev, result];
      });

      if (totalPhotos >= maxPhotos) {
        setIsBoothRunning(false);
        photoBoothTimerRef.current?.stop();
        navigation.navigate("PhotoBoothResult");
      } else {
        photoBoothTimerRef.current?.reset();
        photoBoothTimerRef.current?.start();
      }
    }
  }

  return (
    <View
      style={styles.container}
      onLayout={() => {
        setIsLayoutReady(true);
      }}
    >
      {isLayoutReady && isFocused && canRenderCamera ? (
        <CameraView
          key={`${facing}-${cameraSessionKey}`}
          ref={cameraRef}
          facing={facing}
          flash={flashMode}
          mirror={facing === "front"}
          onCameraReady={() => {
            setIsCameraReady(true);
          }}
          style={[StyleSheet.absoluteFill, styles.camera]}
        />
      ) : null}

      <View pointerEvents="box-none" style={styles.overlay}>
        <CameraHeader
          show={showCustomiseCollageModal}
          setShow={setShowCustomiseCollageModal}
        />

        {isBoothRunning ? (
          <PhotoBoothTimer
            ref={photoBoothTimerRef}
            durationMs={timerDuration * 1000}
            onComplete={onTimerComplete}
          />
        ) : null}

        <CameraPictureRow />

        <PhotoBoothButtons
          setShowCustomiseCollageModal={setShowCustomiseCollageModal}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    backgroundColor: colors.black
  },
  container: {
    backgroundColor: colors.black,
    flex: 1
  },
  overlay: {
    ...StyleSheet.absoluteFillObject
  }
});
