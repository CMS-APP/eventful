export interface SpotifyPlaylist {
  name: string;
  tracks: { total: number };
  images: { url: string }[];
  icon: string | null;
  id: string;
}
