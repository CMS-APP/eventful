import {
  FirebaseFirestoreTypes,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where
} from "@react-native-firebase/firestore";

import { FIRESTORE_DB } from "@/app/init/firebase";
import { Event } from "@/types/Event";
import { Invite } from "@/types/Invite";
import { Invites } from "@/types/Invites";
import { isActiveEvent } from "@/utils/date";
import { log } from "@/utils/logging";

export function getInvitationsFromDatabaseSnapshot(
  userId: string,
  callback: (events: Invites) => void
) {
  const inviteRef = collection(FIRESTORE_DB, "invite");
  const queryRef = query(inviteRef, where("recipient", "==", userId));

  return onSnapshot(
    queryRef,
    async (querySnapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
      const events: Invites = { respond: [], noRespond: [] };
      const eventPromises = querySnapshot.docs.map(
        async (document: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          const invite = { ...document.data(), id: document.id } as Invite;
          const eventRef = doc(FIRESTORE_DB, "event", invite.eventId as string);

          try {
            const event = await getDoc(eventRef);
            if (event.exists()) {
              const eventData = event.data() as Event;

              if (isActiveEvent(eventData)) {
                if (
                  invite.response === "pending" ||
                  invite.response === "maybe"
                ) {
                  events.noRespond.push({ invite, event: eventData });
                } else if (
                  invite.response === "accept" ||
                  invite.response === "decline"
                ) {
                  events.respond.push({ invite, event: eventData });
                }
              }
            }
          } catch (error) {
            log(
              `Error getting event in listener: ${(error as any)?.message ?? error}`,
              "error"
            );
          }
        }
      );

      await Promise.all(eventPromises);
      callback(events);
    },
    (error) => {
      log(
        `Error in invitations listener: ${(error as any)?.message ?? error}`,
        "error"
      );
    }
  );
}
