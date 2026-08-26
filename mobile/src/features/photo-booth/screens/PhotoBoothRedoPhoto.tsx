import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCallback, useEffect, useRef } from "react";

import { StyleSheet, View } from "react-native";

import {
  type RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";

import { CameraView, PhotoResult } from "expo-camera";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { globalStyles } from "@/design-system/tokens/globalStyles";

import { PhotoBoothButtons } from "../components/camera/PhotoBoothButtons";
import {
  PhotoBoothTimer,
  PhotoBoothTimerHandle
} from "../components/camera/PhotoBoothTimer";
import type {
  PhotoBoothStackNavigation,
  PhotoBoothStackParamList
} from "../photoBoothStackParams";
import { usePhotoBoothCamera } from "../provider/PhotoBoothCameraProvider";
import { usePhotoBoothSession } from "../provider/PhotoBoothSessionProvider";
import { usePhotoBoothSettings } from "../provider/PhotoBoothSettingsProvider";

type RedoPhotoRoute = RouteProp<
  PhotoBoothStackParamList,
  "PhotoBoothRedoPhoto"
>;

export function PhotoBoothRedoPhoto() {
  const navigation = useNavigation<PhotoBoothStackNavigation>();
  const { top } = useSafeAreaInsets();

  const { params } = useRoute<RedoPhotoRoute>();
  const { index } = params;

  const { facing, flash, setIsCameraReady, setPhotos } = usePhotoBoothCamera();
  const { isBoothRunning, setIsBoothRunning } = usePhotoBoothSession();
  const { timerDuration } = usePhotoBoothSettings();

  const flashMode = flash ? "on" : "off";

  const cameraRef = useRef<CameraView>(null);
  const photoBoothTimerRef = useRef<PhotoBoothTimerHandle>(null);

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
    <View style={styles.container}>
      <CameraView
        key={facing}
        ref={cameraRef}
        facing={facing}
        flash={flashMode}
        mirror={facing === "front"}
        onCameraReady={() => {
          setIsCameraReady(true);
        }}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="box-none" style={styles.overlay}>
        {!isBoothRunning && (
          <View style={[globalStyles.largeWidget, { top }]}>
            <View style={styles.headerContent}>
              <Text type="header" color={colors.white}>
                Photo Booth
              </Text>
              <Text type="subHeader" color={colors.white}>
                Redo Photo {index + 1}
              </Text>
            </View>
          </View>
        )}

        {isBoothRunning ? (
          <PhotoBoothTimer
            ref={photoBoothTimerRef}
            durationMs={timerDuration * 1000}
            onComplete={onTimerComplete}
          />
        ) : null}

        <PhotoBoothButtons redo setShowCustomiseCollageModal={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerContent: {
    alignItems: "center",
    backgroundColor: colors.black,
    borderRadius: 24,
    opacity: 0.8,
    padding: 20
  },
  overlay: {
    ...StyleSheet.absoluteFillObject
  }
});
