import { Event } from "@/types/Event";
import { SpotifyPlaylist } from "@/types/SpotifyPlaylist";

export function isPlaylistAdded(
  playlist: SpotifyPlaylist,
  addedPlaylists: SpotifyPlaylist[]
): boolean {
  const playlistIds = addedPlaylists.map((p) => p.id);
  return playlistIds.includes(playlist.id);
}

export function addPlaylistToEvent(
  playlist: SpotifyPlaylist,
  event: Event,
  setEvent: (event: Event) => void
): Event {
  const newPlaylists = event.playlists
    ? [...event.playlists, playlist]
    : [playlist];

  const updatedEvent = {
    ...event,
    playlists: newPlaylists
  };

  setEvent(updatedEvent);
  return updatedEvent;
}

export function removePlaylistFromEvent(
  playlist: SpotifyPlaylist,
  event: Event,
  setEvent: (event: Event) => void
): Event {
  const newPlaylists = event.playlists.filter(
    (item: SpotifyPlaylist) => item.id !== playlist.id
  );

  const updatedEvent = {
    ...event,
    playlists: newPlaylists
  };

  setEvent(updatedEvent);
  return updatedEvent;
}
