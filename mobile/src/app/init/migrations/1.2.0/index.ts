import { doc, updateDoc } from "@react-native-firebase/firestore";

import { FIRESTORE_DB } from "@/app/init/firebase";
import { getEventsFromDatabase } from "@/services/firebase/event";
import { getSenderInvitesFromDatabase } from "@/services/firebase/invite";
import { Event } from "@/types/Event";
import { Invite } from "@/types/Invite";
import { generateUUID } from "@/utils/uuid";

export async function convertEventInvites(userId: string) {
  const invites = await getSenderInvitesFromDatabase(userId);

  const updatePromises = invites.map((invite: Invite) => {
    if (invite.response === "accepted") {
      invite.response = "accept";
    } else if (invite.response === "declined") {
      invite.response = "decline";
    } else if (invite.response === "pending") {
      invite.response = "maybe";
    }

    const docRef = doc(FIRESTORE_DB, "invite", invite.id);
    return updateDoc(docRef, {
      response: invite.response
    });
  });

  await Promise.all(updatePromises);
}

export async function convertEventGuestList(userId: string) {
  const { upcomingEvents, pastEvents } = await getEventsFromDatabase(userId);
  const allEvents = [...upcomingEvents, ...pastEvents];
  const eventsWithGuestList = allEvents.filter(
    (event) => event.guestList && event.guestList.length > 0
  );

  const updatePromises = eventsWithGuestList.map((event: Event) => {
    const newGuestList = event.guestList.map((guest: any) => {
      if (guest.item) {
        let response = "maybe";
        if (guest.coming) {
          response = "accept";
        } else if (guest.notComing) {
          response = "decline";
        }

        return {
          id: generateUUID(),
          name: guest.item,
          response: response
        };
      } else {
        return guest;
      }
    });

    const docRef = doc(FIRESTORE_DB, "event", event.id);
    return updateDoc(docRef, {
      guestList: newGuestList
    });
  });

  await Promise.all(updatePromises);
}
