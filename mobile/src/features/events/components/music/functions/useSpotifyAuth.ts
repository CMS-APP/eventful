import { useDispatch } from "react-redux";

import { useEffect, useRef } from "react";

import * as AuthSession from "expo-auth-session";

import { updateUserInfo } from "@/services/firebase/user";
import { setSpotifyData } from "@/store/UserSlice";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_DISCOVERY,
  SPOTIFY_SCOPES,
  getSpotifyRedirectUri,
  processAuthResponse
} from "./spotifyAuth";

interface UseSpotifyAuthOptions {
  userId: string;
  onSuccess: (accessToken: string) => void;
}

export function useSpotifyAuth({ userId, onSuccess }: UseSpotifyAuthOptions) {
  const dispatch = useDispatch();
  const redirectUri = getSpotifyRedirectUri();
  const processedResponseRef = useRef<string | null>(null);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SPOTIFY_SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true
    },
    SPOTIFY_DISCOVERY
  );

  useEffect(() => {
    const handleAuthResponse = async () => {
      try {
        const tokenData = await processAuthResponse(
          response,
          request,
          redirectUri,
          processedResponseRef
        );

        if (tokenData) {
          const data = {
            spotifyAccessToken: tokenData.accessToken,
            spotifyExpirationDate: tokenData.expirationDate
          };

          await updateUserInfo(userId, {
            spotifyData: data
          });

          dispatch(setSpotifyData(data));
          onSuccess(tokenData.accessToken);
        }
      } catch (error) {
        // Reset processed ref on error
        if (response?.type === "success" && response.params?.code) {
          processedResponseRef.current = null;
        }
        log(`Error signing into Spotify: ${error}`, "error");
        showErrorToast("Error Connecting Spotify");
      }
    };

    if (response) {
      handleAuthResponse();
    }
  }, [response, request, redirectUri, userId, onSuccess, dispatch]);

  const resetProcessedResponse = () => {
    processedResponseRef.current = null;
  };

  return {
    promptAsync,
    resetProcessedResponse
  };
}
