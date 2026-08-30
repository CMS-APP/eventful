import { SpotifyPlaylist } from "@/types/SpotifyPlaylist";

export async function fetchSpotifyPlaylists(
  accessToken: string
): Promise<SpotifyPlaylist[]> {
  const response = await fetch("https://api.spotify.com/v1/me/playlists", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(
      `Spotify playlists request failed (${response.status}): ${body}`
    );
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const data = await response.json();
  const playlistData = data.items.map((playlist: SpotifyPlaylist) => ({
    name: playlist.name,
    tracks: playlist.tracks,
    icon: playlist.images?.[0]?.url ?? null,
    id: playlist.id
  }));

  return playlistData;
}
