import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { Alert, StyleSheet, View } from "react-native";

import {
  ILoadingModalContext,
  useLoadingModal
} from "@/app/context/loading/LoadingModalContext";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { SpotifyPlaylist } from "@/types/SpotifyPlaylist";
import { haptics } from "@/utils/haptics";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

import { SpotifyPlaylistItem } from "./SpotifyPlaylistItem";
import { viewSpotifyPlaylist } from "./SpotifyService";
import { SpotifySignInButton } from "./SpotifySignInButton";
import { useSpotifyPlaylists } from "./functions/useSpotifyPlaylists";

interface SpotifyPlaylistsProps {
  event: Event;
  setEvent: (event: Event) => void;
}

export function SpotifyPlaylists({ event, setEvent }: SpotifyPlaylistsProps) {
  const userId = useSelector((state: UserState) => state.uid);
  const spotifyData = useSelector((state: UserState) => state.spotify);

  const [signedIn, setSignedIn] = useState(false);
  const { setLoading } = useLoadingModal() as ILoadingModalContext;

  const {
    playlists,
    addedPlaylists,
    setPlaylists,
    getPlaylists,
    addPlaylist,
    removePlaylist,
    checkPlaylist
  } = useSpotifyPlaylists({ event, setEvent });

  useEffect(() => {
    if (
      spotifyData &&
      spotifyData.spotifyAccessToken &&
      new Date(spotifyData.spotifyExpirationDate) > new Date()
    ) {
      getPlaylists(spotifyData.spotifyAccessToken);
      setSignedIn(true);
    }
  }, [spotifyData, getPlaylists]);

  const viewPlaylist = useCallback(
    async (playlist: SpotifyPlaylist) => {
      try {
        setLoading(true);
        await viewSpotifyPlaylist(playlist);
      } catch (error) {
        log(`Error Opening Playlist: ${error}`, "error");
        showErrorToast("Error Opening Playlist");
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const addedPlaylistPressAlert = useCallback(
    (playlist: SpotifyPlaylist) => {
      Alert.alert(
        "Spotify Playlist",
        `Would you like to remove or view the playlist: ${playlist.name}?`,
        [
          {
            text: "Remove",
            onPress: () => removePlaylist(playlist),
            style: "destructive"
          },
          {
            text: "View",
            onPress: () => viewPlaylist(playlist)
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    },
    [removePlaylist, viewPlaylist]
  );

  const playlistPressAlert = useCallback(
    (playlist: SpotifyPlaylist) => {
      Alert.alert(
        "Spotify Playlist",
        `Would you like to add or view the playlist: ${playlist.name}?`,
        [
          {
            text: "Add",
            onPress: () => addPlaylist(playlist)
          },
          {
            text: "View",
            onPress: () => viewPlaylist(playlist)
          },

          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    },
    [addPlaylist, viewPlaylist]
  );

  return (
    <View style={styles.container}>
      <SpotifySignInButton
        userId={userId}
        signedIn={signedIn}
        setSignedIn={setSignedIn}
        setPlaylists={setPlaylists}
        getPlaylists={getPlaylists}
      />

      <Text type="subHeader" style={styles.addedPlaylistsHeader}>
        Added Spotify Playlists
      </Text>

      <View style={styles.addedPlaylistsContainer}>
        {addedPlaylists.length > 0 ? (
          addedPlaylists.map((playlist: SpotifyPlaylist) => (
            <SpotifyPlaylistItem
              key={playlist.id}
              onPress={() => {
                haptics.soft();
                addedPlaylistPressAlert(playlist);
              }}
              added
              playlist={playlist}
            />
          ))
        ) : (
          <SpotifyPlaylistItem
            added={false}
            playlist={{
              name: "No playlist added yet",
              tracks: { total: 0 },
              icon: null
            }}
            onPress={() => {}}
          />
        )}
      </View>

      {playlists && (
        <View>
          <Text type="subHeader" style={styles.yourPlaylistsHeader}>
            Your Spotify Playlists
          </Text>
          {playlists.map((playlist: SpotifyPlaylist) => (
            <View key={playlist.id}>
              {!checkPlaylist(playlist) && (
                <View style={styles.playlistItemContainer}>
                  <SpotifyPlaylistItem
                    onPress={() => {
                      haptics.soft();
                      playlistPressAlert(playlist);
                    }}
                    playlist={playlist}
                    added={false}
                  />
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addedPlaylistsContainer: {
    gap: 6
  },
  addedPlaylistsHeader: {
    color: colors.white,
    marginVertical: 6,
    textAlign: "center"
  },
  container: {
    flex: 1,
    gap: 6
  },
  playlistItemContainer: {
    marginTop: 6
  },
  yourPlaylistsHeader: {
    color: colors.white,
    marginVertical: 12,
    textAlign: "center"
  }
});
