import type { RefObject } from "react";

import * as AuthSession from "expo-auth-session";

import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

export const SPOTIFY_CLIENT_ID = "5ac26743c8154bf781d819ef92f34245";
export const SPOTIFY_SCOPES = [
  "playlist-read-private",
  "playlist-read-collaborative"
];

export const SPOTIFY_DISCOVERY = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token"
};

export function getSpotifyRedirectUri() {
  return AuthSession.makeRedirectUri({
    scheme: "eventful",
    path: "callback"
  });
}

interface SpotifyTokenData {
  accessToken: string;
  expiresIn: number;
  expirationDate: string;
}

async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<SpotifyTokenData> {
  if (!codeVerifier) {
    throw new Error("Missing code verifier for PKCE");
  }

  const tokenRequestParams = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: SPOTIFY_CLIENT_ID,
    code_verifier: codeVerifier
  });

  const tokenResponse = await fetch(SPOTIFY_DISCOVERY.tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: tokenRequestParams.toString()
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.text();
    throw new Error(`Token exchange failed: ${errorData}`);
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  const expiresIn = tokenData.expires_in || 3600;

  const expirationDate = new Date(
    new Date().getTime() + expiresIn * 1000
  ).toISOString();

  return {
    accessToken,
    expiresIn,
    expirationDate
  };
}

export async function processAuthResponse(
  response: ReturnType<typeof AuthSession.useAuthRequest>[1],
  request: ReturnType<typeof AuthSession.useAuthRequest>[0],
  redirectUri: string,
  processedResponseRef: RefObject<string | null>
): Promise<SpotifyTokenData | null> {
  if (!response || !request) {
    return null;
  }

  if (response.type === "success" && request.codeVerifier) {
    const { code } = response.params;

    const responseKey = `${code}-${response.type}`;
    if (processedResponseRef.current === responseKey) {
      return null;
    }

    processedResponseRef.current = responseKey;

    try {
      const tokenData = await exchangeCodeForToken(
        code as string,
        request.codeVerifier,
        redirectUri
      );
      return tokenData;
    } catch (error) {
      processedResponseRef.current = null;
      throw error;
    }
  }

  if (response.type === "cancel") {
    return null;
  }

  if (response.type === "error") {
    log(`Spotify sign in error: ${response.error?.message}`, "error");
    showErrorToast("Error Connecting Spotify");
    throw new Error(response.error?.message ?? "Error signing into Spotify");
  }

  return null;
}
