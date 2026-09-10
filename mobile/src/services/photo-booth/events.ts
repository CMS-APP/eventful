import { GalleryEvent, GalleryPhoto } from "@/types/photoBoothGallery";
import { parseDatabaseDate } from "@/utils/date";

import { getCloudEvents } from "./cloudPhotos";
import { getLocalEvents } from "./localPhotos";
import { checkIfPhotoExistsInLocalEvent } from "./utils";

export function getLatestPhotoTime(event: GalleryEvent): number {
  return event.photos.reduce((latest, photo) => {
    const photoTime =
      photo.createdAt ?? (photo as GalleryPhoto & { date?: string }).date;
    const photoDate = parseDatabaseDate(photoTime);
    return photoDate && photoDate.getTime() > latest
      ? photoDate.getTime()
      : latest;
  }, 0);
}

export async function getEvents(userId: string) {
  let events: GalleryEvent[] = [];
  const [localEvents, cloudEvents] = await Promise.all([
    getLocalEvents(),
    getCloudEvents(userId)
  ]);

  events = localEvents;

  for (const event of cloudEvents) {
    const localEvent = events.find((e) => e.eventTitle === event.eventTitle);
    if (!localEvent) {
      events.push(event);
      continue;
    }

    localEvent.type = "both";
    for (const photo of event.photos) {
      let localPhoto = checkIfPhotoExistsInLocalEvent(localEvent, photo);
      if (localPhoto) {
        localPhoto.type = "both";
        localPhoto = { ...localPhoto, ...photo };
      } else {
        localEvent.photos.push({ ...photo, type: "cloud" });
      }
    }
  }

  events.sort((a, b) => getLatestPhotoTime(b) - getLatestPhotoTime(a));

  return events;
}

export async function getEvent(userId: string, eventTitle: string) {
  const events = await getEvents(userId);
  return events.find((e) => e.eventTitle === eventTitle);
}
