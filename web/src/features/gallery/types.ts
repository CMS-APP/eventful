export interface GalleryImage {
  name: string;
  url: string;
  fullPath: string;
  size: number;
  timeCreated: string | null;
}

export interface GalleryInfo {
  eventTitle: string;
  date: string | null;
  hostName: string | null;
}
