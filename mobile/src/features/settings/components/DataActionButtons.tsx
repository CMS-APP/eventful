import { useDispatch, useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { Alert } from "react-native";

import { Button } from "@/design-system/components/buttons/Button";
import { colors } from "@/design-system/tokens/colors";
import { updateUserInfo } from "@/services/firebase/user";
import { clearCache as clearImageCache } from "@/services/local/cache";
import { UserState, clearSpotifyData } from "@/store/UserSlice";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

export function DataActionButtons() {
  const userId = useSelector((state: UserState) => state.uid);
  const dispatch = useDispatch();

  const [clearingCache, setClearingCache] = useState(false);
  const [resettingSpotify, setResettingSpotify] = useState(false);

  const handleClearCache = useCallback(async () => {
    try {
      setClearingCache(true);
      await clearImageCache();
      Alert.alert("Success", "The cache has been cleared.");
    } catch {
      log("Error Clearing Cache", "error");
      showErrorToast("Error Clearing Cache");
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
      log(`Error Resetting Spotify Data: ${error}`, "error");
      showErrorToast("Error Resetting Spotify Data");
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
        leadingIcon="spotify"
        loading={resettingSpotify}
      />

      <Button
        text="Clear Cache"
        color={colors.primaryTint3}
        textColor={colors.white}
        onPress={clearCacheAlert}
        leadingIcon="database"
        loading={clearingCache}
      />
    </>
  );
}
