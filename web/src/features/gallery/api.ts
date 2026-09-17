import { GalleryInfo } from "@/features/gallery/types";

export function parseGalleryId(galleryId: string) {
  const [userId, eventId] = decodeURIComponent(galleryId).split("=");
  return userId && eventId ? { userId, eventId } : null;
}

export async function fetchGalleryInfo(
  userId: string,
  eventId: string
): Promise<GalleryInfo | null> {
  try {
    const response = await fetch(
      `https://api.eventfulapp.com/galleryInfo?userId=${encodeURIComponent(userId)}&eventHash=${encodeURIComponent(eventId)}`
    );

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error("Error loading gallery info:", error);
    return null;
  }
}
