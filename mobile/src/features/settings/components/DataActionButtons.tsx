import { getAuth } from "@react-native-firebase/auth";
import { useDispatch, useSelector } from "react-redux";

import { useCallback, useState } from "react";

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
import { showErrorNotification } from "@/utils/appNotifications";
import { log } from "@/utils/logging";

export function DataActionButtons() {
  const userId = useSelector((state: UserState) => state.uid);
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<AllStackParamList>>();

  const [clearingCache, setClearingCache] = useState(false);
  const [resettingData, setResettingData] = useState(false);
  const [resettingSpotify, setResettingSpotify] = useState(false);

  const handleClearCache = useCallback(async () => {
    try {
      setClearingCache(true);
      await clearImageCache();
      Alert.alert("Success", "The cache has been cleared.");
    } catch (error) {
      log(`Error clearing cache: ${(error as any)?.message ?? error}`, "error");
      showErrorNotification("Error Clearing Cache");
    } finally {
      setClearingCache(false);
    }
  }, []);

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
        setResettingData(true);
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
        log(`Error deleting data: ${(error as any)?.message ?? error}`, "error");
        showErrorNotification("Error Deleting Data");
      } finally {
        setResettingData(false);
      }
    },
    [dispatch, navigation, userId]
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
      setResettingSpotify(true);
      await updateUserInfo(userId, {
        spotifyData: {
          spotifyAccessToken: "",
          spotifyExpirationDate: ""
        }
      });
      dispatch(clearSpotifyData());
      Alert.alert("Success", "Your Spotify data has been reset.");
    } catch (error) {
      log(`Error resetting spotify data: ${(error as any)?.message ?? error}`, "error");
      showErrorNotification("Error Resetting Spotify Data");
    } finally {
      setResettingSpotify(false);
    }
  }, [dispatch, userId]);

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
        loading={resettingSpotify}
      />

      <Button
        text="Clear Cache"
        color={colors.primaryTint3}
        textColor={colors.white}
        onPress={clearCacheAlert}
        icon="database"
        loading={clearingCache}
      />

      <Button
        text="Reset Data"
        color={colors.primaryTint3}
        textColor={colors.white}
        onPress={deleteDataAlert}
        icon="sync"
        loading={resettingData}
      />
    </>
  );
}
