import { useDispatch, useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { Alert } from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { updateUserInfo } from "@/services/firebase/user";
import {
  clearCache as clearImageCache,
  getCacheSize
} from "@/services/local/cache";
import { UserState, clearSpotifyData } from "@/store/UserSlice";
import { showOptionsAlert } from "@/utils/alertModal";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

export function useDataActions() {
  const userId = useSelector((state: UserState) => state.uid);
  const dispatch = useDispatch();

  const [clearingCache, setClearingCache] = useState(false);
  const [resettingSpotify, setResettingSpotify] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setCacheSize(getCacheSize());
    }, [])
  );

  const handleClearCache = useCallback(async () => {
    try {
      setClearingCache(true);
      await clearImageCache();
      setCacheSize(getCacheSize());
      Alert.alert("Success", "The cache has been cleared.");
    } catch {
      log("Error Clearing Cache", "error");
      showErrorToast("Error Clearing Cache");
    } finally {
      setClearingCache(false);
    }
  }, []);

  const clearCacheAlert = useCallback(() => {
    showOptionsAlert(
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
    showOptionsAlert(
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

  return {
    cacheSize,
    clearCacheAlert,
    clearingCache,
    resetSpotifyDataAlert,
    resettingSpotify
  };
}
