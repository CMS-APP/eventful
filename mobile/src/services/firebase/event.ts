import { limit, orderBy, where } from "@react-native-firebase/firestore";

import { API_COLLECTIONS } from "@/services/api/constants";
import { getDocument, getDocumentsByQuery } from "@/services/api/get";
import { setDocument, updateDocument } from "@/services/api/update";
import { createNotificationForEvent } from "@/services/pushNotifications";
import { Event } from "@/types/Event";
import { Invite } from "@/types/Invite";
import { isActiveEvent, parseDatabaseDate } from "@/utils/date";
import { log } from "@/utils/logging";

import { deleteDocument } from "../api/delete";
import { incrementEventCount } from "./backend";

export async function getEventInfo(event: Event): Promise<Event | null> {
  const eventData = await getDocument(API_COLLECTIONS.EVENT, event.id || "");
  return (eventData as Event) || null;
}

export async function createEventInDatabase(data: Event, user: any) {
  await setDocument(data, API_COLLECTIONS.EVENT, data.id);
  await createNotificationForEvent(data);
  incrementEventCount(user);
}

export async function updateEventInDatabase(event: Partial<Event>) {
  await updateDocument(event, API_COLLECTIONS.EVENT, event?.id || "");
}

export async function deleteEventFromDatabase(eventId: string) {
  await deleteDocument(API_COLLECTIONS.EVENT, eventId);
}

export async function getEventsFromDatabase(userId: string) {
  try {
    const events = (await getDocumentsByQuery(
      [where("userId", "==", userId)],
      API_COLLECTIONS.EVENT
    )) as Event[];

    let upcomingEvents: Event[] = [];
    let pastEvents: Event[] = [];

    events.forEach((event: Event) => {
      if (isActiveEvent(event)) {
        upcomingEvents.push(event);
      } else {
        pastEvents.push(event);
      }
    });

    upcomingEvents.sort(
      (a, b) => parseDatabaseDate(a.date) - parseDatabaseDate(b.date)
    );
    pastEvents.sort(
      (a, b) => parseDatabaseDate(b.date) - parseDatabaseDate(a.date)
    );

    return { upcomingEvents, pastEvents };
  } catch (error) {
    log(
      `FirebaseFunctions: Error getting events: ${(error as any)?.message ?? error}`,
      "error"
    );
    return { upcomingEvents: [], pastEvents: [] };
  }
}

export async function getNextEvent(userId: string) {
  const events = (await getDocumentsByQuery(
    [
      where("userId", "==", userId),
      where("date", ">=", new Date()),
      orderBy("date", "asc"),
      limit(1)
    ],
    API_COLLECTIONS.EVENT
  )) as Event[];
  return events[0] || null;
}

export async function getAllEvents(userId: string) {
  const { upcomingEvents, pastEvents } = await getEventsFromDatabase(userId);
  const {
    upcomingEvents: upcomingInvitedEvents,
    pastEvents: pastInvitedEvents
  } = await getSortedInvites(userId);

  const { declinedEvents } = await getDeclinedEvents(userId);
  const declinedEventIds = new Set(declinedEvents.map((e) => e.id));

  const filteredUpcomingInvitedEvents = upcomingInvitedEvents.filter(
    (event) => !declinedEventIds.has(event.id)
  );
  const filteredPastInvitedEvents = pastInvitedEvents.filter(
    (event) => !declinedEventIds.has(event.id)
  );

  const allUpcomingEvents = [
    ...upcomingEvents,
    ...filteredUpcomingInvitedEvents
  ];
  const allPastEvents = [...pastEvents, ...filteredPastInvitedEvents];

  allUpcomingEvents.sort(
    (a, b) => parseDatabaseDate(a.date) - parseDatabaseDate(b.date)
  );
  allPastEvents.sort(
    (a, b) => parseDatabaseDate(b.date) - parseDatabaseDate(a.date)
  );

  return {
    upcomingEvents: allUpcomingEvents,
    pastEvents: allPastEvents,
    declineEvents: declinedEvents
  };
}

export async function changeEventEnabledStatus(
  eventId: string,
  status: boolean
) {
  await updateDocument(
    { enabled: status },
    API_COLLECTIONS.EVENT_LINKS,
    eventId
  );
}

export async function getFutureEventsFromDatabase(userId: string) {
  const events = (await getDocumentsByQuery(
    [where("userId", "==", userId)],
    API_COLLECTIONS.EVENT
  )) as Event[];

  const activeEvents = events.filter((event: Event) => isActiveEvent(event));
  return activeEvents.sort(
    (a: Event, b: Event) =>
      parseDatabaseDate(a.date) - parseDatabaseDate(b.date)
  );
}

export async function getFutureEventsFromDatabaseByIds(
  eventIds: string[]
): Promise<Event[]> {
  const eventPromises = eventIds.map(async (eventId: string) => {
    const event = await getDocument(API_COLLECTIONS.EVENT, eventId);
    if (event && isActiveEvent(event as Event)) {
      return event;
    } else {
      return null;
    }
  });

  const events = await Promise.all(eventPromises);
  const filteredEvents = events.filter(
    (event): event is Event => event !== null
  );

  return filteredEvents.sort(
    (a: Event, b: Event) =>
      parseDatabaseDate(b.date) - parseDatabaseDate(a.date)
  );
}

export async function getSortedInvites(userId: string) {
  const invites = (await getDocumentsByQuery(
    [where("recipient", "==", userId)],
    API_COLLECTIONS.INVITE
  )) as Invite[];

  const upcomingEvents: Event[] = [];
  const pastEvents: Event[] = [];

  const eventPromises = invites.map(async (invite: Invite) => {
    const event = (await getDocument(
      API_COLLECTIONS.EVENT,
      invite.eventId
    )) as Event;
    if (event) {
      if (isActiveEvent(event)) {
        upcomingEvents.push(event);
      } else {
        pastEvents.push(event);
      }
    }
  });

  await Promise.all(eventPromises);

  upcomingEvents.sort((a: Event, b: Event) => {
    return parseDatabaseDate(a.date) - parseDatabaseDate(b.date);
  });
  pastEvents.sort((a: Event, b: Event) => {
    return parseDatabaseDate(b.date) - parseDatabaseDate(a.date);
  });

  return { upcomingEvents, pastEvents };
}

async function getDeclinedEvents(userId: string) {
  const invites = (await getDocumentsByQuery(
    [where("recipient", "==", userId), where("response", "==", "decline")],
    API_COLLECTIONS.INVITE
  )) as Invite[];

  const eventIds = [
    ...new Set(invites.map((invite: Invite) => invite.eventId))
  ];

  if (eventIds.length === 0) {
    return { declinedEvents: [] as Event[] };
  }

  const events = (
    await Promise.all(
      eventIds.map(async (eventId) => {
        const data = await getDocument(API_COLLECTIONS.EVENT, eventId);
        return data ? (data as Event) : null;
      })
    )
  ).filter((e): e is Event => e !== null);

  return { declinedEvents: events };
}
