import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { padding } from "@/design-system/tokens/padding";
import { SpotifyPlaylist } from "@/types/SpotifyPlaylist";
import { getHitSlop } from "@/utils/hitSlop";

interface SpotifyPlaylistItemProps {
  playlist:
    | SpotifyPlaylist
    | { name: string; tracks: { total: number }; icon: string | null };
  onPress: () => void;
  added: boolean;
}

export function SpotifyPlaylistItem({
  playlist,
  onPress,
  added
}: SpotifyPlaylistItemProps) {
  const trackText = playlist?.tracks?.total === 1 ? "Track" : "Tracks";

  return (
    <TouchableOpacity onPress={onPress} hitSlop={getHitSlop("medium")}>
      <View style={[padding.largeWidget, styles.container]}>
        {playlist?.icon ? (
          <Image
            source={{ uri: playlist?.icon }}
            style={styles.playlistImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <FontAwesome5 name="play-circle" size={24} color={colors.gray} />
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text type="body" style={styles.playlistName}>
            {playlist?.name}
          </Text>
          <Text type="body" style={styles.trackCount}>
            {playlist?.tracks.total} {trackText}
          </Text>
        </View>

        {added && (
          <View style={styles.removeButton}>
            <FontAwesome5 name="times" size={24} color="red" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightGray,
    flexDirection: "row",
    gap: 12
  },
  infoContainer: {
    flex: 1
  },
  placeholderImage: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    width: 50
  },
  playlistImage: {
    height: 50,
    width: 50
  },
  playlistName: {
    color: colors.black,
    flexWrap: "wrap",
    fontSize: 12
  },
  removeButton: {
    alignItems: "center",
    height: 30,
    justifyContent: "center",
    marginLeft: "auto",
    width: 30
  },
  trackCount: {
    color: colors.black,
    flexWrap: "wrap",
    fontSize: 12
  }
});
