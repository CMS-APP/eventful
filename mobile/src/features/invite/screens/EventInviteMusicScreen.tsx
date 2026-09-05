import { useCallback } from "react";

import { Linking, StyleSheet, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EventInviteStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { SpotifyPlaylistItem } from "@/features/events/components/music/SpotifyPlaylistItem";
import { SpotifyPlaylist } from "@/types/SpotifyPlaylist";

type Props = NativeStackScreenProps<
  EventInviteStackParamList,
  "EventInviteMusic"
>;

export function EventInviteMusicScreen({ route }: Props) {
  const { event } = route.params;

  const openPlaylist = useCallback((playlist: SpotifyPlaylist) => {
    Linking.openURL(`https://open.spotify.com/playlist/${playlist.id}`);
  }, []);

  return (
    <Screen
      headerConfig={{
        type: "flat",
        backgroundColor: colors.primary,
        flatHeaderProps: {
          title: "Music",
          backgroundColor: colors.primary,
          dark: true,
          backAction: true,
          icon: "play-circle"
        }
      }}
      contentConfig={{
        backgroundColor: colors.primary
      }}
    >
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
          <EmptyStateContainer
            title="No playlists found"
            description="No playlists found"
            icon="play-circle"
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  playlistsContainer: {
    gap: 12,
    paddingHorizontal: 24
  }
});
