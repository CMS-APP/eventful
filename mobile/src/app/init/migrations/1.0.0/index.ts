import { where } from "@react-native-firebase/firestore";

import { API_COLLECTIONS } from "@/services/api/constants";
import { getDocument, getDocumentsByQuery } from "@/services/api/get";
import { setDocument, updateDocument } from "@/services/api/update";
import { getData, removeData } from "@/services/local/async";
import { Event } from "@/types/Event";

export async function convertLocalEventsToDatabase(userId: string) {
  const events = await getData("events");
  if (events && events.length > 0) {
    const eventPromises = events.map(async (event: Event) => {
      const eventDoc = await getDocument(API_COLLECTIONS.EVENT, event.id);
      if (!eventDoc) {
        const data = { ...event, userId };
        await setDocument(data, API_COLLECTIONS.EVENT, event.id);
      }
    });

    await Promise.all(eventPromises);
    await removeData("events");
  }
}

export async function convertEventEventToEvent(userId: string) {
  const events = (await getDocumentsByQuery(
    [where("userId", "==", userId)],
    API_COLLECTIONS.EVENT
  )) as Event[];

  const updatePromises = events.map(async (event: Event) => {
    const eventData = event as any;
    if (eventData.event) {
      eventData.event = undefined;
      return updateDocument(eventData, API_COLLECTIONS.EVENT, event.id);
    } else {
      return null;
    }
  });
  await Promise.all(updatePromises);
}
