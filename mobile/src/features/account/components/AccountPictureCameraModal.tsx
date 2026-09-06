import { ActivityIndicator } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { useState } from "react";

import { Image, StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { PhotoResult } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";

import { Button } from "@/design-system/components/buttons/Button";
import { ModalView } from "@/design-system/components/overlays/ModalView";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { uploadImageAsync } from "@/services/firebase/storage";
import { updateUserInfo } from "@/services/firebase/user";
import {
  computeImageHash,
  saveLocalImageToCache
} from "@/services/local/cache";
import { UserState, setProfilePictureHash } from "@/store/UserSlice";
import { User } from "@/types/User";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";
import { isValidUserId } from "@/utils/userId";

interface AccountPictureCameraModalProps {
  presentModal: boolean;
  setPresentModal: (presentModal: boolean) => void;
  photo: PhotoResult | null;
  facing: "front" | "back";
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
    if (!photo?.uri || !isValidUserId(userId)) {
      return;
    }

    try {
      setIsLoading(true);

      let processedImage = photo;
      if (facing === "front") {
        processedImage = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ flip: ImageManipulator.FlipType.Horizontal }],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
      }

      await uploadImageAsync(processedImage.uri, `${userId}/profilePicture`, 0);

      const imageHash = await computeImageHash(processedImage.uri);

      await updateUserInfo(userId, {
        profilePictureHash: imageHash
      } as User);

      await saveLocalImageToCache(processedImage.uri, "profilePicture", true);
      dispatch(setProfilePictureHash(imageHash));

      navigation.goBack();
    } catch (error) {
      log(`Error Saving Photo: ${error}`, "error");
      showErrorToast("Error Saving Photo");
    } finally {
      setIsLoading(false);
      setPresentModal(false);
    }
  }

  return (
    <ModalView
      show={presentModal}
      setShow={setPresentModal}
      backgroundColor={colors.white}
      borderColor={colors.lightGray + "40"}
    >
      <View style={styles.container}>
        <Text type="header" color={colors.black}>
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
            <Text type="body" color={colors.black}>
              Saving photo...
            </Text>
            <ActivityIndicator size="large" color={colors.black} />
          </View>
        ) : (
          <>
            <Button
              text="Save"
              onPress={savePhoto}
              color={colors.primary}
              textColor={colors.white}
              leadingIcon="check"
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
    gap: 12
  }
});
