import { Event } from "@/types/Event";
import { SpotifyPlaylist } from "@/types/SpotifyPlaylist";

/**
 * Checks if a playlist is already in the added playlists list
 */
export function isPlaylistAdded(
  playlist: SpotifyPlaylist,
  addedPlaylists: SpotifyPlaylist[]
): boolean {
  const playlistIds = addedPlaylists.map((p) => p.id);
  return playlistIds.includes(playlist.id);
}

/**
 * Adds a playlist to an event
 */
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

/**
 * Removes a playlist from an event
 */
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
