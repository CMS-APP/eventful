import { useCallback, useEffect, useRef, useState } from "react";

import { Platform } from "react-native";

import {
  type RouteProp,
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useRoute
} from "@react-navigation/native";

import { CameraView, PhotoResult } from "expo-camera";

import { CameraOverlayHeader } from "@/components/camera/CameraOverlayHeader";
import {
  CameraScreenLayout,
  cameraPreviewStyle
} from "@/components/camera/CameraScreenLayout";
import { usePhotoBoothCamera } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
import { usePhotoBoothSession } from "@/features/photo-booth/context/session/PhotoBoothSessionContext";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

import { PhotoBoothButtons } from "../components/camera/PhotoBoothButtons";
import {
  PhotoBoothTimer,
  PhotoBoothTimerHandle
} from "../components/camera/PhotoBoothTimer";
import type {
  PhotoBoothStackNavigation,
  PhotoBoothStackParamList
} from "../photoBoothStackParams";

type RedoPhotoRoute = RouteProp<
  PhotoBoothStackParamList,
  "PhotoBoothRedoPhoto"
>;

export function PhotoBoothRedoPhoto() {
  const navigation = useNavigation<PhotoBoothStackNavigation>();
  const isFocused = useIsFocused();

  const { params } = useRoute<RedoPhotoRoute>();
  const { index } = params;

  const { facing, flash, setIsCameraReady, setPhotos } = usePhotoBoothCamera();
  const { isBoothRunning, setIsBoothRunning } = usePhotoBoothSession();
  const { timerDuration } = usePhotoBoothSettings();

  const flashMode = flash ? "on" : "off";

  const cameraRef = useRef<CameraView>(null);
  const photoBoothTimerRef = useRef<PhotoBoothTimerHandle>(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [cameraSessionKey, setCameraSessionKey] = useState(0);
  const [canRenderCamera, setCanRenderCamera] = useState(true);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsBoothRunning(false);
      };
    }, [setIsBoothRunning])
  );

  useEffect(() => {
    if (!isBoothRunning) return;
    photoBoothTimerRef.current?.start();
  }, [isBoothRunning]);

  useEffect(() => {
    setIsCameraReady(false);
  }, [facing, isFocused, setIsCameraReady]);

  // On Android the native camera view can size itself against a stale
  // parent layout right after a screen transition, filling only part of
  // the screen. Remounting it once the container's real layout has
  // settled forces it to re-measure correctly. See PhotoBoothCamera.tsx
  // for the same workaround.
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
    setIsBoothRunning(false);

    const result = await cameraRef.current?.takePictureAsync();

    if (result) {
      setPhotos((prev: PhotoResult[]) => {
        const newPhotos = [...prev];
        newPhotos[index] = result;
        return newPhotos;
      });

      navigation.goBack();
    }
  }

  return (
    <CameraScreenLayout
      onLayout={() => {
        setIsLayoutReady(true);
      }}
      preview={
        isLayoutReady && isFocused && canRenderCamera ? (
          <CameraView
            key={`${facing}-${cameraSessionKey}`}
            ref={cameraRef}
            facing={facing}
            flash={flashMode}
            mirror={facing === "front"}
            onCameraReady={() => {
              setIsCameraReady(true);
            }}
            style={cameraPreviewStyle}
          />
        ) : null
      }
    >
      <CameraOverlayHeader
        title="Photo Booth"
        subtitle={`Redo Photo ${index + 1}`}
        visible={!isBoothRunning}
      />

      {isBoothRunning ? (
        <PhotoBoothTimer
          ref={photoBoothTimerRef}
          durationMs={timerDuration * 1000}
          onComplete={onTimerComplete}
        />
      ) : null}

      <PhotoBoothButtons redo setShowCustomiseCollageModal={() => {}} />
    </CameraScreenLayout>
  );
}
