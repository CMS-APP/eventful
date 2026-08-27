import { Timestamp, where } from "@react-native-firebase/firestore";

import { Alert } from "react-native";

import { formatEventAddressDisplay } from "@/services/address/eventAddress";
import { API_COLLECTIONS } from "@/services/api/constants";
import { deleteDocument } from "@/services/api/delete";
import { getDocument, getDocumentsByQuery } from "@/services/api/get";
import { setDocument, updateDocument } from "@/services/api/update";
import { sendInviteNotification } from "@/services/pushNotifications";
import { Event } from "@/types/Event";
import { EventLinkResponse } from "@/types/EventLinkResponse";
import { Guest } from "@/types/Guest";
import { Invite } from "@/types/Invite";
import { Invites } from "@/types/Invites";
import { User } from "@/types/User";
import { UserInvite } from "@/types/UserInvite";
import { isActiveEvent, parseDatabaseDate } from "@/utils/date";
import { log } from "@/utils/logging";
import { generateUUID } from "@/utils/uuid";

import { createDocument } from "../api/create";
import { getEventInfo, updateEventInDatabase } from "./firebaseEventFunctions";
import { createUpdateNotification } from "./firebaseInAppNotifications";
import { getUserInfo } from "./firebaseUserFunctions";

export async function getInviteInfo(invite: Invite): Promise<Invite | null> {
  const inviteData = await getDocument(API_COLLECTIONS.INVITE, invite.id);
  return (inviteData as Invite) || null;
}

export async function sendInvite(
  userId: string,
  name: string,
  username: string,
  recipient: User,
  event: Event
) {
  const invite = {
    id: "id",
    eventId: event.id,
    sender: userId,
    recipient: recipient.uid,
    response: "maybe"
  };

  event.invited = event.invited || [];

  if (!event.invited.includes(recipient.uid)) {
    event.invited.push(recipient.uid);
  }

  await updateEventInDatabase(event);
  const existingInvite = await getInviteFromDatabase(event, recipient.uid);
  if (existingInvite) {
    Alert.alert(
      "Invite already exists",
      "The user is already invited to the event"
    );
    return { inviteId: existingInvite.id, refresh: false };
  }

  const createdInvite = await createDocument(invite, API_COLLECTIONS.INVITE);
  const inviteId = createdInvite;

  await createUpdateNotification(
    userId,
    recipient.uid,
    event.id,
    "Event Invite",
    `${name} (${username}) invited you to a new event`,
    "invite"
  );

  await sendInviteNotification(
    recipient,
    {
      uid: userId,
      name,
      username,
      email: "",
      emailVerified: false,
      pushTokens: []
    },
    event,
    { invite, event }
  );
  return { inviteId, refresh: true };
}

export async function getEventRecipientInvites(
  eventId: string
): Promise<Invite[]> {
  const invites = await getDocumentsByQuery(
    [where("eventId", "==", eventId)],
    API_COLLECTIONS.INVITE
  );
  return invites as Invite[];
}

export async function deleteEventInvitesFromDatabase(eventId: string) {
  const invites = (await getDocumentsByQuery(
    [where("eventId", "==", eventId)],
    API_COLLECTIONS.INVITE
  )) as Invite[];

  const deletePromises = invites.map((invite: Invite) =>
    deleteDocument(API_COLLECTIONS.INVITE, invite.id)
  );
  await Promise.all(deletePromises);
}

export async function getInvitedEvents(userId: string) {
  try {
    const invites = (await getDocumentsByQuery(
      [where("recipient", "==", userId)],
      API_COLLECTIONS.INVITE
    )) as Invite[];

    const inviteList = invites.map((invite: Invite) => invite.eventId);

    const events = (await getDocumentsByQuery(
      [where("invited", "array-contains", userId)],
      API_COLLECTIONS.EVENT
    )) as Event[];

    return events
      .filter((event: Event) => inviteList.includes(event.id))
      .map((event: Event) => ({ ...event }));
  } catch (error) {
    log(
      `FirebaseFunctions: Error fetching invited events: ${(error as any)?.message ?? error}`,
      "error"
    );
    return [];
  }
}

export async function getInviteFromDatabase(
  event: Event,
  userId: string
): Promise<Invite | null> {
  try {
    const invite = (await getDocumentsByQuery(
      [where("eventId", "==", event.id), where("recipient", "==", userId)],
      API_COLLECTIONS.INVITE
    )) as Invite[];

    if (invite.length > 0) {
      return invite[0];
    } else {
      return null;
    }
  } catch (error) {
    log(
      `FirebaseFunctions: Error getting invite from database: ${(error as any)?.message ?? error}`,
      "error"
    );
    return null;
  }
}

export async function updateResponseInDatabase(
  invite: Invite,
  data: { response: string; dietary?: string }
) {
  function getResponseMessage(
    response: string,
    name: string,
    username: string,
    eventName: string
  ) {
    if (response === "accept") {
      return `${name} (${username}) accepted your invite to ${eventName}`;
    } else if (response === "decline") {
      return `${name} (${username}) declined your invite to ${eventName}`;
    } else if (response === "maybe") {
      return `${name} (${username}) has marked your invite to ${eventName} as maybe`;
    } else {
      return `${name} (${username}) changed their response to your invite to ${eventName}`;
    }
  }

  try {
    await updateDocument(data, API_COLLECTIONS.INVITE, invite.id);

    if (
      data.response === "accept" ||
      data.response === "decline" ||
      data.response === "maybe"
    ) {
      const userDetails = await getUserInfo(invite.recipient);
      const eventDetails = await getEventInfo({ id: invite.eventId } as Event);

      if (!userDetails || !eventDetails) {
        log("User or event details not found", "warn");
        return;
      }

      const title = "Event Response";
      const subTitle = getResponseMessage(
        data.response,
        userDetails.name,
        userDetails.username,
        eventDetails.name !== "" ? eventDetails.name : "your event"
      );

      await createUpdateNotification(
        invite.recipient,
        invite.sender,
        invite.eventId,
        title,
        subTitle,
        "response"
      );
    }
  } catch (error) {
    log(
      `Error updating invite response: ${(error as any)?.message ?? error}`,
      "error"
    );
  }
}

export async function getSenderInvitesFromDatabase(
  userId: string
): Promise<Invite[]> {
  try {
    const invites = await getDocumentsByQuery(
      [where("sender", "==", userId)],
      API_COLLECTIONS.INVITE
    );
    return invites as Invite[];
  } catch (error) {
    log(
      `Error getting sender invites: ${(error as any)?.message ?? error}`,
      "error"
    );
    return [];
  }
}

export async function checkInvitedToEvent(event: Event, userId: string) {
  try {
    const invite = (await getDocumentsByQuery(
      [where("eventId", "==", event.id), where("recipient", "==", userId)],
      API_COLLECTIONS.INVITE
    )) as Invite[];
    if (invite.length > 0) {
      return invite[0];
    } else {
      return null;
    }
  } catch (error) {
    log(
      `Error checking if user is invited to event: ${(error as any)?.message ?? error}`,
      "error"
    );
    return null;
  }
}

export async function deleteInviteFromDatabase(inviteId: string) {
  try {
    await deleteDocument(API_COLLECTIONS.INVITE, inviteId);
  } catch (error) {
    log(`Error deleting invite: ${(error as any)?.message ?? error}`, "error");
  }
}

export async function generateEventLink(event: Event, hostName: string) {
  try {
    const eventLink = {
      id: event.id,
      userId: event.userId,
      hostName: hostName,
      dateTime: Timestamp.fromDate(parseDatabaseDate(event.date)),
      endDateTime:
        event.multiDate && event.endDate
          ? Timestamp.fromDate(parseDatabaseDate(event.endDate))
          : null,
      address: formatEventAddressDisplay(event.address) || "No address",
      directions: event.directions ?? "No directions",
      eventName: event.name.trim() || "Event",
      theme: event.theme ?? "No theme",
      enabled: true
    };

    await setDocument(eventLink, API_COLLECTIONS.EVENT_LINKS, event.id);

    return eventLink;
  } catch (error) {
    log(
      `Error generating event link: ${(error as any)?.message ?? error}`,
      "error"
    );
    throw error;
  }
}

export async function updateEventLinkInDatabase(event: Event) {
  try {
    const eventLink = await getDocument(API_COLLECTIONS.EVENT_LINKS, event.id);

    if (!eventLink || !eventLink.enabled) {
      return;
    }

    const eventLinkData = {
      dateTime: Timestamp.fromDate(parseDatabaseDate(event.date)),
      endDateTime:
        event.multiDate && event.endDate
          ? Timestamp.fromDate(parseDatabaseDate(event.endDate))
          : null,
      address: formatEventAddressDisplay(event.address) || "No address",
      directions: event.directions ?? "No directions",
      eventName: event.name.trim() || "Event",
      theme: event.theme ?? "No theme"
    };

    await updateDocument(eventLinkData, API_COLLECTIONS.EVENT_LINKS, event.id);
  } catch (error) {
    log(
      `Error updating event link: ${(error as any)?.message ?? error}`,
      "error"
    );
  }
}

export async function getEventLinkResponses(
  eventId: string,
  userId: string
): Promise<EventLinkResponse[]> {
  try {
    const eventLinks = await getDocumentsByQuery(
      [where("eventId", "==", eventId), where("hostId", "==", userId)],
      API_COLLECTIONS.EVENT_RESPONSES
    );
    return eventLinks as EventLinkResponse[];
  } catch (error) {
    log(
      `FirebaseFunctions: Error getting event link responses: ${(error as any)?.message ?? error}`,
      "error"
    );
    return [];
  }
}

export async function updateEventLinkResponse(
  eventLinkId: string,
  response: string
) {
  try {
    await updateDocument(
      { response },
      API_COLLECTIONS.EVENT_RESPONSES,
      eventLinkId
    );
  } catch (error) {
    log(
      `FirebaseFunctions: Error updating event link response: ${(error as any)?.message ?? error}`,
      "error"
    );
  }
}

export async function deleteEventLinkResponse(eventLinkId: string) {
  try {
    await deleteDocument(API_COLLECTIONS.EVENT_RESPONSES, eventLinkId);
  } catch (error) {
    log(
      `Error deleting event link response: ${(error as any)?.message ?? error}`,
      "error"
    );
  }
}

export async function getRSVPAppUsers(event: Event): Promise<UserInvite[]> {
  try {
    // Fetch the list of users who have RSVP'd to the event from the app
    const invites = await getEventRecipientInvites(event.id);

    const refactoredInvites = await Promise.all(
      invites.map(async (invite: Invite) => {
        if (invite.response === "pending") {
          invite.response = "maybe";
        }

        invite.type = "app";
        const userDetails = await getUserInfo(invite.recipient);

        if (!userDetails) {
          log(
            "FirebaseFunctions: User not found for invite: " + invite.id,
            "warn"
          );
          return null;
        }

        return { user: userDetails, invite };
      })
    );

    return refactoredInvites.filter(
      (item): item is { user: User; invite: Invite } => item !== null
    );
  } catch (error) {
    log(
      `FirebaseFunctions: Error getting RSVP app users: ${(error as any)?.message ?? error}`,
      "error"
    );
    return [];
  }
}

export async function getRSVPWebUsers(
  event: Event,
  userId: string
): Promise<UserInvite[]> {
  try {
    // Fetch the list of users who have RSVP'd to the event from the web
    const responses = await getEventLinkResponses(event.id, userId);
    const webUsers: UserInvite[] = responses.map((response: any) => {
      const user: User = {
        uid: response.id,
        name: response.name,
        username: "",
        email: response.email,
        emailVerified: false,
        firstName: "",
        lastName: "",
        searchName: response.name,
        pushTokens: []
      };

      const invite: Invite = {
        id: response.id,
        recipient: response.id,
        sender: response.hostId,
        eventId: response.eventId,
        dietary: "",
        response: response.response,
        type: "link"
      };

      return { user, invite };
    });

    return webUsers;
  } catch (error) {
    log(
      `FirebaseFunctions: Error getting RSVP web users: ${(error as any)?.message ?? error}`,
      "error"
    );
    return [];
  }
}

export async function getRSVPManualUsers(event: Event): Promise<UserInvite[]> {
  // Fetch the list of users who have been manually added to the event
  const guestList = event.guestList || [];

  const refactoredGuestList: UserInvite[] = [];
  guestList.forEach((guest: Guest) => {
    const user: User = {
      pushTokens: [],
      uid: guest.id,
      name: guest.name,
      username: "",
      email: "",
      emailVerified: false,
      firstName: "",
      lastName: "",
      searchName: guest.name
    };

    const invite: Invite = {
      id: guest.id,
      recipient: guest.id,
      sender: event.userId,
      eventId: event.id,
      dietary: "",
      response: guest.response,
      type: "manual"
    };

    refactoredGuestList.push({
      user,
      invite
    });
  });
  return refactoredGuestList;
}

export async function getInvitesFromUser(
  recipientId: string,
  senderId: string
) {
  try {
    const invites = await getDocumentsByQuery(
      [where("recipient", "==", recipientId), where("sender", "==", senderId)],
      API_COLLECTIONS.INVITE
    );
    return invites as Invite[];
  } catch (error) {
    log(
      `FirebaseFunctions: Error getting invites from user: ${(error as any)?.message ?? error}`,
      "error"
    );
    return [];
  }
}

export async function getInvitedGuests(event: Event, userId: string) {
  const invites = (await getDocumentsByQuery(
    [where("eventId", "==", event.id), where("recipient", "!=", userId)],
    API_COLLECTIONS.INVITE
  )) as Invite[];

  const users = await Promise.all(
    invites.map(async (invite: Invite) => {
      const userData = (await getDocument(
        API_COLLECTIONS.USER,
        invite.recipient
      )) as User;
      return { invite: invite, user: userData };
    })
  );

  return users as UserInvite[];
}

export async function getEventInvites(event: Event): Promise<UserInvite[]> {
  const invites = (await getDocumentsByQuery(
    [where("eventId", "==", event.id)],
    API_COLLECTIONS.INVITE
  )) as Invite[];
  const userInvites: UserInvite[] = [];
  for (const invite of invites) {
    const user = await getUserInfo(invite.recipient);
    if (user) {
      userInvites.push({ user, invite });
    }
  }
  return userInvites;
}

export async function getEventResponses(event: Event): Promise<UserInvite[]> {
  if (!event) {
    return [];
  }

  const invites = (await getDocumentsByQuery(
    [where("eventId", "==", event.id)],
    API_COLLECTIONS.INVITE
  )) as Invite[];
  const invitePromises = invites.map(async (invite: Invite) => {
    if (invite.response === "accept") {
      const user = await getUserInfo(invite.recipient);
      if (user) {
        return { invite, user };
      }
    }
    return null;
  });
  const inviteResponses = (await Promise.all(invitePromises)).filter(
    (response): response is UserInvite => response !== null
  );

  const guestList = event.guestList;
  const guestPromises = guestList.map(async (guest: Guest) => {
    if (guest.response === "accept") {
      const invite: Invite = {
        response: "maybe",
        recipient: guest.id,
        sender: "",
        eventId: event.id,
        id: generateUUID(),
        type: "manual"
      };
      const user: User = {
        uid: guest.id,
        name: guest.name,
        username: guest.name,
        pushTokens: [],
        emailVerified: false
      };

      return { invite, user };
    }
    return null;
  });

  const guests = (await Promise.all(guestPromises)).filter(
    (response): response is UserInvite => response !== null
  );

  const webUsers = (await getRSVPWebUsers(event, event.userId)).filter(
    (user: UserInvite) => user.invite.response === "accept"
  );

  const responses = [...inviteResponses, ...guests, ...webUsers];
  return responses;
}

export async function getInvitationsForUser(userId: string) {
  const invites = (await getDocumentsByQuery(
    [where("recipient", "==", userId)],
    API_COLLECTIONS.INVITE
  )) as Invite[];

  const eventPromises = invites.map(async (invite: Invite) => {
    const event = await getDocument(API_COLLECTIONS.EVENT, invite.eventId);
    if (!event || !isActiveEvent(event as Event)) {
      return null;
    }

    return { invite, event: event as Event };
  });

  const results = await Promise.all(eventPromises);
  const validResults = results.filter(
    (result): result is { invite: Invite; event: Event } => result !== null
  );

  const events: Invites = { respond: [], noRespond: [] };

  validResults.forEach(({ invite, event }) => {
    if (invite.response === "pending" || invite.response === "maybe") {
      events.noRespond.push({ invite, event });
    } else if (invite.response === "accept" || invite.response === "decline") {
      events.respond.push({ invite, event });
    }
  });

  return events;
}
