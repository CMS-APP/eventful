import {
  Timestamp,
  doc,
  updateDoc,
  where
} from "@react-native-firebase/firestore";

import { Event } from "@/types/Event";
import { Invite } from "@/types/Invite";
import { User } from "@/types/User";
import { AppError } from "@/utils/error";
import { generateUUID } from "@/utils/uuid";

import { API_COLLECTIONS } from "../api/constants";
import { getDocument, getDocumentsByQuery } from "../api/get";
import { setDocument, updateDocument } from "../api/update";
import { getData, removeData } from "../async";
import { FIRESTORE_DB } from "../firebase/firebase";
import { getEventsFromDatabase } from "../firebase/firebaseEventFunctions";
import {
  getPollInDatabase,
  getVoteForUserInDatabase
} from "../firebase/firebaseInspirationFunctions";
import { getSenderInvitesFromDatabase } from "../firebase/firebaseInviteFunctions";
import { followUser, getUserInfo } from "../firebase/firebaseUserFunctions";

export async function convertLocalEventsToDatabase(userId: string) {
  try {
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
  } catch (error) {
    throw new AppError(error, "Error converting local events to database");
  }
}

export async function convertEventEventToEvent(userId: string) {
  try {
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
  } catch (error) {
    throw new AppError(error, "Error converting event event to event");
  }
}

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

export async function convertEventGuestList(user: User) {
  const { upcomingEvents, pastEvents } = await getEventsFromDatabase(user.uid);
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

export async function convertUserFollowingToDatabaseFollowing(userId: string) {
  try {
    const user = (await getUserInfo(userId)) as any;

    if (user?.following && Array.isArray(user.following)) {
      await Promise.all(
        user.following.map((following: string) =>
          followUser(userId, following, false)
        )
      );
    }
  } catch (error) {
    new AppError(
      error,
      "DatabaseUpdates: Error converting user following to database following"
    );
  }
}

export async function convertPollVotesToDatabasePollVotes(userId: string) {
  try {
    const poll = await getPollInDatabase();

    if (!poll) {
      return;
    }

    const pollVote = await getVoteForUserInDatabase(poll, userId);

    if (!pollVote) {
      return;
    }

    const docRef = doc(FIRESTORE_DB, "pollVote", pollVote.pollId);
    updateDoc(docRef, {
      userId: userId
    });
  } catch (error) {
    new AppError(
      error,
      "DatabaseUpdates: Error converting poll votes to database poll votes"
    );
  }
}

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
