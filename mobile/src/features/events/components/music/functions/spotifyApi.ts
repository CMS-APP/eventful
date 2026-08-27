import { SpotifyPlaylist } from "@/types/SpotifyPlaylist";
import { showErrorNotification } from "@/utils/appNotifications";

/**
 * Fetches the user's Spotify playlists
 */
export async function fetchSpotifyPlaylists(
  accessToken: string
): Promise<SpotifyPlaylist[]> {
  try {
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    const playlistData = data.items.map((playlist: SpotifyPlaylist) => ({
      name: playlist.name,
      tracks: playlist.tracks,
      icon: playlist.images?.[0]?.url ?? null,
      id: playlist.id
    }));

    return playlistData;
  } catch (error) {
    showErrorNotification("Error Loading Playlists");
    throw error;
  }
}
