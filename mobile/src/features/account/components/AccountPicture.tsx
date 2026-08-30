import { deleteField } from "@react-native-firebase/firestore";
import { ActivityIndicator } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import {
  ILoadingModalContext,
  useLoadingModal
} from "@/app/context/loading/LoadingModalContext";
import { AllStackParamList } from "@/app/navigation";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import {
  deleteImageAsync,
  uploadImageAsync
} from "@/services/firebase/storage";
import { getUserInfo, updateUserInfo } from "@/services/firebase/user";
import {
  computeImageHash,
  deleteCachedImage,
  saveLocalImageToCache,
  syncUserPicture
} from "@/services/local/cache";
import { UserState, setProfilePictureHash } from "@/store/UserSlice";
import { User } from "@/types/User";
import { haptics } from "@/utils/haptics";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

export function AccountPicture() {
  const [permission, requestPermission] = useCameraPermissions();
  const [image, setImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  const { setLoading } = useLoadingModal() as ILoadingModalContext;
  const userId = useSelector((state: UserState) => state.uid);
  const dispatch = useDispatch();

  const navigation = useNavigation<StackNavigationProp<AllStackParamList>>();

  const syncPicture = useCallback(async () => {
    setImage(null);

    if (!userId) {
      setLoading(false);
      setImageLoading(false);
      return;
    }

    const user = (await getUserInfo(userId)) as User;
    const imageUri = await syncUserPicture(user, true);
    setImage(imageUri as string);
    setLoading(false);
    setImageLoading(false);
  }, [userId, setLoading, setImageLoading]);

  useFocusEffect(
    useCallback(() => {
      syncPicture();
    }, [syncPicture])
  );

  const openImagePicker = useCallback(async () => {
    try {
      setLoading(true);
      setImageLoading(true);

      setTimeout(async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0
        });

        if (!result.canceled) {
          const uri = result.assets[0].uri;

          await saveLocalImageToCache(uri, "profilePicture", true);
          setImage(uri);
          await uploadImageAsync(uri, `${userId}/profilePicture`, 0);

          const imageHash = await computeImageHash(uri);
          await updateUserInfo(userId, {
            profilePictureHash: imageHash
          } as User);
          dispatch(setProfilePictureHash(imageHash));
        }
      }, 10);
    } catch (error) {
      log(`Error Opening Photos: ${error}`, "error");
      showErrorToast("Error Opening Photos");
    } finally {
      setLoading(false);
      setImageLoading(false);
    }
  }, [userId, setLoading, dispatch]);

  const requestPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === "granted") {
      openImagePicker();
    } else {
      Alert.alert(
        "Permission Denied",
        "You need to grant permission to access your photos."
      );
    }
  }, [openImagePicker]);

  const deleteImage = useCallback(async () => {
    try {
      setLoading(true);
      setImage(null);
      await deleteCachedImage("profilePicture");
      await updateUserInfo(userId, {
        profilePictureHash: deleteField() as any
      });
      await deleteImageAsync(`${userId}/profilePicture`);
      dispatch(setProfilePictureHash(undefined));
    } catch (error) {
      log(`Error Deleting Photo: ${error}`, "error");
      showErrorToast("Error Deleting Photo");
    } finally {
      setLoading(false);
    }
  }, [userId, setLoading, dispatch]);

  const cameraAlertButton = useCallback(async () => {
    if (permission?.granted) {
      navigation.navigate("AccountPictureCamera" as never);
      return;
    }

    const result = await requestPermission();
    if (!result?.granted && permission) {
      Alert.alert(
        "Permission Denied",
        "You need to grant permission to access your camera."
      );
      return;
    }
    navigation.navigate("AccountPictureCamera" as never);
  }, [permission, navigation, requestPermission]);

  const buttonPress = useCallback(() => {
    Alert.alert(
      "Profile Picture",
      "Would you like to use your camera or photo library?",
      [
        { text: "Camera", onPress: cameraAlertButton },
        { text: "Photo Library", onPress: requestPermissions },
        { text: "Cancel", style: "destructive" }
      ]
    );
  }, [cameraAlertButton, requestPermissions]);

  const photoAlert = useCallback(() => {
    Alert.alert(
      "Profile Picture",
      "Would you like to edit or remove your picture?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Edit", onPress: buttonPress },
        { text: "Remove", style: "destructive", onPress: deleteImage }
      ]
    );
  }, [buttonPress, deleteImage]);

  const addPhoto = useCallback(() => {
    haptics.soft();
    if (image) {
      photoAlert();
    } else {
      buttonPress();
    }
  }, [image, photoAlert, buttonPress]);

  const renderImage = useCallback(() => {
    if (imageLoading) {
      return (
        <View style={styles.image}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      );
    }
    if (image) {
      return (
        <Image
          source={{ uri: image }}
          style={styles.image}
          onError={() => {
            log("Error Loading Photo", "error");
            showErrorToast("Error Loading Photo");
          }}
        />
      );
    }
    return <FontAwesome5 name="camera" size={44} color={colors.primary} />;
  }, [imageLoading, image]);

  return (
    <TouchableOpacity onPress={addPhoto} hitSlop={getHitSlop("medium")}>
      <View style={styles.imageContainer}>
        <View style={styles.image}>{renderImage()}</View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  image: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.white,
    borderRadius: 120,
    height: 100,
    justifyContent: "center",
    width: 100
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center"
  }
});
