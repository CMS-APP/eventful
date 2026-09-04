import { useCallback } from "react";

import { Linking, StyleSheet, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { EventInviteStackParamList } from "@/app/navigation";
import { FlatHeader } from "@/components/screen/FlatHeader";
import { KeyboardScrollView } from "@/components/views/KeyboardScrollView";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { SpotifyPlaylistItem } from "@/features/events/components/music/SpotifyPlaylistItem";
import { SpotifyPlaylist } from "@/types/SpotifyPlaylist";

type Props = NativeStackScreenProps<
  EventInviteStackParamList,
  "EventInviteMusic"
>;

export function EventInviteMusicScreen({ navigation, route }: Props) {
  const { event } = route.params;

  const openPlaylist = useCallback((playlist: SpotifyPlaylist) => {
    Linking.openURL(`https://open.spotify.com/playlist/${playlist.id}`);
  }, []);

  const headerConfig = {
    title: "Music",
    backgroundColor: colors.primary,
    dark: true,
    backAction: true,
    icon: "play-circle"
  };

  return (
    <View style={styles.container}>
      <KeyboardScrollView
        tabBarPresent={false}
        handleScroll={() => {}}
        _handleScroll={() => {}}
        backgroundColor={colors.primary}
      >
        <View style={styles.headerContainer}>
          <FlatHeader {...headerConfig} />
        </View>

        <View style={styles.playlistsContainer}>
          {event.music && (
            <Text type="subHeader" color="white">
              {event.music}
            </Text>
          )}

          <Text type="subHeader" color="white" center>
            Playlists
          </Text>

          {event.playlists?.length > 0 ? (
            event.playlists.map((playlist) => (
              <SpotifyPlaylistItem
                key={playlist.id}
                onPress={() => openPlaylist(playlist)}
                added={false}
                playlist={playlist}
              />
            ))
          ) : (
            <View style={styles.noPlaylistsContainer}>
              <Text type="body" color="white">
                No playlists found
              </Text>
              <FontAwesome5 name="play-circle" size={24} color={colors.white} />
            </View>
          )}
        </View>
      </KeyboardScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flex: 1
  },
  headerContainer: {
    paddingTop: 24
  },
  noPlaylistsContainer: {
    alignItems: "center",
    gap: 12
  },
  playlistsContainer: {
    gap: 12,
    paddingHorizontal: 24
  }
});
