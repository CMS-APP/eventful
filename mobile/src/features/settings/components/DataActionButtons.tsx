import { getAuth } from "@react-native-firebase/auth";
import { useDispatch, useSelector } from "react-redux";

import { useCallback } from "react";

import { Alert } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { Button } from "@/design-system/components/Button";
import { colors } from "@/design-system/tokens/colors";
import { AllStackParamList } from "@/features/app/navigationTypes";
import { clearCache as clearImageCache } from "@/services/cache";
import {
  deleteUserData,
  updateUserInfo
} from "@/services/firebase/firebaseUserFunctions";
import {
  UserState,
  clearSpotifyData,
  clearStorage,
  setUserData
} from "@/store/UserSlice";
import { AppError } from "@/utils/error";

type DataActionButtonsProps = {
  setLoading: (isLoading: boolean) => void;
};

export function DataActionButtons({ setLoading }: DataActionButtonsProps) {
  const userId = useSelector((state: UserState) => state.uid);
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<AllStackParamList>>();

  const handleClearCache = useCallback(async () => {
    try {
      setLoading(true);
      await clearImageCache();
      Alert.alert("Success", "The cache has been cleared.");
    } catch (error) {
      new AppError(error, "Error clearing cache", true);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const clearCacheAlert = useCallback(() => {
    Alert.alert(
      "Clear Cache",
      "Are you sure? This will remove all cached images and cached data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: handleClearCache
        }
      ]
    );
  }, [handleClearCache]);

  const deleteAllUserData = useCallback(
    async (move = true) => {
      try {
        setLoading(true);
        await deleteUserData(userId);
        dispatch(clearStorage());

        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const data = {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified
          };
          dispatch(setUserData(data));
        }

        if (move) {
          Alert.alert("Success", "All your data has been deleted.");
          navigation.reset({
            index: 0,
            routes: [{ name: "Onboarding" }] as never
          });
        }
      } catch (error) {
        new AppError(error, "Error deleting data", true);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, navigation, setLoading, userId]
  );

  const deleteDataAlert = useCallback(() => {
    Alert.alert(
      "Reset Data",
      "Are you sure you want to reset all your data? This process is irreversible",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => void deleteAllUserData(true)
        }
      ]
    );
  }, [deleteAllUserData]);

  const resetSpotifyData = useCallback(async () => {
    try {
      setLoading(true);
      await updateUserInfo(userId, {
        spotifyData: {
          spotifyAccessToken: "",
          spotifyExpirationDate: ""
        }
      });
      dispatch(clearSpotifyData());
      Alert.alert("Success", "Your Spotify data has been reset.");
    } catch (error) {
      new AppError(error, "Error resetting spotify data", true);
    } finally {
      setLoading(false);
    }
  }, [dispatch, setLoading, userId]);

  const resetSpotifyDataAlert = useCallback(() => {
    Alert.alert(
      "Reset Spotify Data",
      "This will remove all your Spotify authentication data from the app. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: resetSpotifyData
        }
      ]
    );
  }, [resetSpotifyData]);

  return (
    <>
      <Button
        text="Reset Spotify Data"
        color={colors.primaryTint3}
        textColor={colors.white}
        onPress={resetSpotifyDataAlert}
        icon="spotify"
      />

      <Button
        text="Clear Cache"
        color={colors.primaryTint3}
        textColor={colors.white}
        onPress={clearCacheAlert}
        icon="database"
      />

      <Button
        text="Reset Data"
        color={colors.primaryTint3}
        textColor={colors.white}
        onPress={deleteDataAlert}
        icon="sync"
      />
    </>
  );
}
