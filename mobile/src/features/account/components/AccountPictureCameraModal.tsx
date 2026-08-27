import { ActivityIndicator } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { useState } from "react";

import { Image, StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { PhotoResult } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { CameraType } from "expo-image-picker";

import { ModalView } from "@/components/views/ModalView";
import { Button } from "@/design-system/components/Button";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { computeImageHash, saveLocalImageToCache } from "@/services/cache";
import { uploadImageAsync } from "@/services/firebase/firebaseStorage";
import { updateUserInfo } from "@/services/firebase/firebaseUserFunctions";
import { UserState, setProfilePictureHash } from "@/store/UserSlice";
import { User } from "@/types/User";
import { showErrorNotification } from "@/utils/appNotifications";
import { log } from "@/utils/logging";

interface AccountPictureCameraModalProps {
  presentModal: boolean;
  setPresentModal: (presentModal: boolean) => void;
  photo: PhotoResult | null;
  facing: CameraType;
}

export function AccountPictureCameraModal({
  presentModal,
  setPresentModal,
  photo,
  facing
}: AccountPictureCameraModalProps) {
  const dispatch = useDispatch();
  const userId = useSelector((state: UserState) => state.uid);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  async function savePhoto() {
    if (!photo?.uri) return;
    if (!userId || userId === "null") {
      showErrorNotification("You're not signed in. Please sign in again.");
      return;
    }

    try {
      setIsLoading(true);
      log(`Selected Image URI: ${photo.uri}`, "info");

      // Flip the image if using front camera
      let processedImage = photo;
      if (facing === "front") {
        processedImage = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ flip: ImageManipulator.FlipType.Horizontal }],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
      }

      log("Uploading profile picture to storage...", "info");
      await uploadImageAsync(processedImage.uri, `${userId}/profilePicture`, 0);

      log("Computing image hash...", "info");
      const imageHash = await computeImageHash(processedImage.uri);

      log("Updating user profilePictureHash in Firestore...", "info");
      await updateUserInfo(userId, {
        profilePictureHash: imageHash
      } as User);

      log("Saving image to local cache...", "info");
      await saveLocalImageToCache(processedImage.uri, "profilePicture", true);
      dispatch(setProfilePictureHash(imageHash));

      navigation.goBack();
    } catch (error) {
      log(`Error saving picture: ${(error as any)?.message ?? error}`, "error");
      showErrorNotification("Error Saving Photo");
    } finally {
      setIsLoading(false);
      setPresentModal(false);
    }
  }

  return (
    <ModalView
      show={presentModal}
      setShow={setPresentModal}
      backgroundColor={colors.primary}
      borderColor={colors.lightGray + "40"}
    >
      <View style={styles.container}>
        <Text type="header" color="white">
          New Profile Picture
        </Text>
        {photo && (
          <Image
            source={{ uri: photo.uri }}
            style={[styles.image, facing === "front" && styles.flippedImage]}
          />
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.white} />
            <Text type="body" color="white" style={styles.savingText}>
              Saving photo...
            </Text>
          </View>
        ) : (
          <>
            <Button
              text="Save"
              onPress={savePhoto}
              color={colors.primaryTint}
              textColor={colors.white}
              icon="check"
            />

            <Button
              text="Cancel"
              onPress={() => setPresentModal(false)}
              color={colors.lightGray}
              textColor={colors.black}
            />
          </>
        )}
      </View>
    </ModalView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 12,
    justifyContent: "center"
  },
  flippedImage: {
    transform: [{ scaleX: -1 }]
  },
  image: {
    borderRadius: 50,
    height: 200,
    width: 200
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 24
  },
  savingText: {
    marginTop: 12
  }
});
