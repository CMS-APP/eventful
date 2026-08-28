import { Timestamp, doc, updateDoc } from "@react-native-firebase/firestore";

import { FIRESTORE_DB } from "@/app/init/firebase";
import { getEventsFromDatabase } from "@/services/firebase/event";

export async function convertDateToTimestamp(userId: string) {
  const { upcomingEvents, pastEvents } = await getEventsFromDatabase(userId);
  const allEvents = [...upcomingEvents, ...pastEvents];
  const eventsWithDate = allEvents.filter((event: any) => event.date);

  const updatePromises = eventsWithDate.map((event: any) => {
    const docRef = doc(FIRESTORE_DB, "event", event.id);

    if (event.date.seconds) {
      event.date = Timestamp.fromDate(new Date(event.date.seconds * 1000));
    } else {
      event.date = Timestamp.fromDate(new Date(event.date as any));
    }

    return updateDoc(docRef, {
      date: event.date
    });
  });

  await Promise.all(updatePromises);
}
