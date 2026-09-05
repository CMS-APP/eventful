import { Linking } from "react-native";

import { SpotifyPlaylist } from "@/types/SpotifyPlaylist";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

export async function viewSpotifyPlaylist(playlist: SpotifyPlaylist) {
  const spotifyUri = `spotify:playlist:${playlist.id}`;
  const fallbackUrl = `https://open.spotify.com/playlist/${playlist.id}`;

  try {
    const canOpen = await Linking.canOpenURL(spotifyUri);
    if (canOpen) {
      await Linking.openURL(spotifyUri);
    } else {
      await Linking.openURL(fallbackUrl);
    }
  } catch (error) {
    log(`Error Opening Playlist: ${error}`, "error");
    showErrorToast("Error Opening Playlist");
  }
}
