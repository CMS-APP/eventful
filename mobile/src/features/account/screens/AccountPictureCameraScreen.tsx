import { useEffect, useRef, useState } from "react";

import { StackNavigationProp } from "@react-navigation/stack";

import { CameraView, PhotoResult } from "expo-camera";

import { AccountStackParamList } from "@/app/navigation";
import { CameraActionButton } from "@/components/camera/CameraActionButton";
import { CameraControlsBar } from "@/components/camera/CameraControlsBar";
import { CameraFlashButton } from "@/components/camera/CameraFlashButton";
import { CameraIconButton } from "@/components/camera/CameraIconButton";
import { CameraOverlayHeader } from "@/components/camera/CameraOverlayHeader";
import {
  CameraScreenLayout,
  cameraPreviewStyle
} from "@/components/camera/CameraScreenLayout";

import { AccountPictureCameraModal } from "../components/AccountPictureCameraModal";

type CameraFacing = "front" | "back";

interface AccountPictureCameraScreenProps {
  navigation: StackNavigationProp<
    AccountStackParamList,
    "AccountPictureCamera"
  >;
}

export function AccountPictureCameraScreen({
  navigation
}: AccountPictureCameraScreenProps) {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraFacing>("front");
  const [photo, setPhoto] = useState<PhotoResult | null>(null);
  const [presentModal, setPresentModal] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [flash, setFlash] = useState(false);

  const flashMode = flash ? "on" : "off";

  useEffect(() => {
    setIsCameraReady(false);
  }, [facing]);

  function flipCamera() {
    setFacing((prev) => (prev === "front" ? "back" : "front"));
  }

  function toggleFlash() {
    setFlash((prev) => !prev);
  }

  async function takePhoto() {
    if (!cameraRef.current || !isCameraReady) return;

    const nextPhoto = await cameraRef.current.takePictureAsync();
    setPhoto(nextPhoto);
    setPresentModal(true);
  }

  return (
    <>
      <AccountPictureCameraModal
        presentModal={presentModal}
        setPresentModal={setPresentModal}
        photo={photo}
        facing={facing}
      />

      <CameraScreenLayout
        preview={
          <CameraView
            ref={cameraRef}
            facing={facing}
            flash={flashMode}
            mirror={facing === "front"}
            onCameraReady={() => {
              setIsCameraReady(true);
            }}
            style={cameraPreviewStyle}
          />
        }
      >
        <CameraOverlayHeader title="Profile Picture" subtitle="Take a Photo" />

        <CameraControlsBar
          left={
            <CameraIconButton
              onPress={() => navigation.goBack()}
              icon="arrow-left"
            />
          }
          center={
            <CameraActionButton
              label="Take Photo"
              onPress={takePhoto}
              disabled={!isCameraReady}
            />
          }
          right={
            <>
              <CameraFlashButton enabled={flash} onPress={toggleFlash} />
              <CameraIconButton onPress={flipCamera} icon="retweet" />
            </>
          }
        />
      </CameraScreenLayout>
    </>
  );
}
