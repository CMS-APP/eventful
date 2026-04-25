import { useRef, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { CameraView, PhotoResult } from "expo-camera";
import { CameraType } from "expo-image-picker";

import { Text } from "@/components/text/Text";
import { AccountStackParamList } from "@/features/app/navigationTypes";
import { colors } from "@/styles/colors";
import { getHitSlop } from "@/utils/hitSlop";

import { AccountPictureCameraModal } from "../components/AccountPictureCameraModal";

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
  const [facing, setFacing] = useState(CameraType.front);
  const [photo, setPhoto] = useState<PhotoResult | null>(null);
  const [presentModal, setPresentModal] = useState(false);

  function flipCamera() {
    setFacing((prev) =>
      prev === CameraType.front ? CameraType.back : CameraType.front
    );
  }

  async function takePhoto() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhoto(photo);
      setPresentModal(true);
    }
  }

  return (
    <View style={styles.container}>
      <AccountPictureCameraModal
        presentModal={presentModal}
        setPresentModal={setPresentModal}
        photo={photo}
        facing={facing}
      />

      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
          hitSlop={getHitSlop("medium")}
        >
          <FontAwesome5 name="arrow-left" size={20} color={colors.black} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={takePhoto}
          hitSlop={getHitSlop("medium")}
        >
          <Text type="subHeader" style={styles.takePhotoText}>
            Take Photo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={flipCamera}
          hitSlop={getHitSlop("medium")}
        >
          <FontAwesome5 name="exchange-alt" size={20} color={colors.black} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.white,
    borderRadius: 50,
    paddingHorizontal: 24,
    paddingVertical: 12
  },
  buttonContainer: {
    alignItems: "center",
    bottom: 88,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    position: "absolute",
    width: "100%"
  },
  camera: {
    flex: 1,
    height: "100%",
    width: "100%"
  },
  container: {
    flex: 1,
    paddingBottom: 72
  },
  takePhotoText: {
    height: 20
  }
});
