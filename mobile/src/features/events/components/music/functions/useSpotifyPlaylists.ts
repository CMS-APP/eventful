import { useCallback, useEffect, useState } from "react";

import {
  trackSpotifyPlaylistAdded,
  trackSpotifyPlaylistRemoved
} from "@/services/analytics/events";
import { Event } from "@/types/Event";
import { SpotifyPlaylist } from "@/types/SpotifyPlaylist";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

import {
  addPlaylistToEvent,
  isPlaylistAdded,
  removePlaylistFromEvent
} from "./playlistHelpers";
import { fetchSpotifyPlaylists } from "./spotifyApi";

interface UseSpotifyPlaylistsOptions {
  event: Event;
  setEvent: (event: Event) => void;
}

export function useSpotifyPlaylists({
  event,
  setEvent
}: UseSpotifyPlaylistsOptions) {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[] | null>(null);
  const [addedPlaylists, setAddedPlaylists] = useState<SpotifyPlaylist[]>(
    event.playlists ?? []
  );

  // Sync addedPlaylists when event.playlists changes
  useEffect(() => {
    setAddedPlaylists(event.playlists ?? []);
  }, [event.playlists]);

  const getPlaylists = useCallback(async (accessToken: string) => {
    try {
      const playlistData = await fetchSpotifyPlaylists(accessToken);
      setPlaylists(playlistData);
    } catch (error) {
      log("Error Loading Playlists: " + error, "error");
      if ((error as { status?: number })?.status === 403) {
        showErrorToast(
          "A Spotify Premium account is required for this feature"
        );
      } else {
        showErrorToast("Error Loading Playlists");
      }
    }
  }, []);

  const addPlaylist = useCallback(
    (playlist: SpotifyPlaylist) => {
      setAddedPlaylists((prev) => [...prev, playlist]);
      addPlaylistToEvent(playlist, event, setEvent);
      trackSpotifyPlaylistAdded();
    },
    [event, setEvent]
  );

  const removePlaylist = useCallback(
    (playlist: SpotifyPlaylist) => {
      setAddedPlaylists((prev) =>
        prev.filter((item) => item.id !== playlist.id)
      );
      removePlaylistFromEvent(playlist, event, setEvent);
      trackSpotifyPlaylistRemoved();
    },
    [event, setEvent]
  );

  const checkPlaylist = useCallback(
    (playlist: SpotifyPlaylist) => {
      return isPlaylistAdded(playlist, addedPlaylists);
    },
    [addedPlaylists]
  );

  return {
    playlists,
    addedPlaylists,
    setPlaylists,
    getPlaylists,
    addPlaylist,
    removePlaylist,
    checkPlaylist
  };
}
