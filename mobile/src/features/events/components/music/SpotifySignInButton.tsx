import { deleteField } from "@react-native-firebase/firestore";

import { useCallback } from "react";

import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { padding } from "@/design-system/tokens/padding";
import { updateUserInfo } from "@/services/firebase/user";
import { SpotifyPlaylist } from "@/types/SpotifyPlaylist";
import { haptics } from "@/utils/haptics";

import { useSpotifyAuth } from "./functions/useSpotifyAuth";

interface SpotifySignInButtonProps {
  userId: string;
  signedIn: boolean;
  setSignedIn: (signedIn: boolean) => void;
  setPlaylists: (playlists: SpotifyPlaylist[]) => void;
  getPlaylists: (accessToken: string) => void;
}

export function SpotifySignInButton({
  userId,
  signedIn,
  setSignedIn,
  setPlaylists,
  getPlaylists
}: SpotifySignInButtonProps) {
  const { promptAsync, resetProcessedResponse } = useSpotifyAuth({
    userId,
    onSuccess: (accessToken) => {
      getPlaylists(accessToken);
      setSignedIn(true);
    }
  });

  const signOutOfSpotify = useCallback(() => {
    haptics.error();
    resetProcessedResponse();
    updateUserInfo(userId, {
      spotifyData: deleteField() as any
    });
    setSignedIn(false);
    setPlaylists([]);
  }, [userId, setSignedIn, setPlaylists, resetProcessedResponse]);

  const signIntoSpotify = useCallback(() => {
    haptics.success();
    promptAsync();
  }, [promptAsync]);

  const signOutOfSpotifyAlert = useCallback(() => {
    haptics.soft();
    Alert.alert("Sign Out", "Are you sure you want to sign out of Spotify?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: signOutOfSpotify
      }
    ]);
  }, [signOutOfSpotify]);

  return (
    <TouchableOpacity
      onPress={signedIn ? signOutOfSpotifyAlert : signIntoSpotify}
      hitSlop={getHitSlop("medium")}
    >
      <View style={[padding.largeWidget, styles.container]}>
        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/logos/spotify-logo-green.png")}
            style={styles.image}
          />
        </View>

        <Text type="body" style={styles.text}>
          Sign {signedIn ? "Out Of" : "Into"} Spotify
        </Text>

        {signedIn && (
          <View style={styles.closeButton}>
            <FontAwesome5 name="times" size={24} color="red" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    alignItems: "center",
    height: 30,
    justifyContent: "center",
    width: 30
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.lightGray,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12
  },
  image: {
    height: 30,
    width: 30
  },
  imageContainer: {
    padding: 12
  },
  text: {
    flex: 1
  }
});
