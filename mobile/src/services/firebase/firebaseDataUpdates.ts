import AsyncStorage from "@react-native-async-storage/async-storage";
import { Timestamp, doc, updateDoc } from "@react-native-firebase/firestore";

import { getPhotosDataLocally } from "@/services/photo-booth/localPhotos";
import { Event } from "@/types/Event";
import { Invite } from "@/types/Invite";
import { User } from "@/types/User";
import { GalleryPhoto } from "@/types/photoBoothGallery";
import { parseDatabaseDate } from "@/utils/date";
import { generateUUID } from "@/utils/uuid";

import { FIRESTORE_DB } from "./firebase";
import { getEventsFromDatabase } from "./firebaseEventFunctions";
import {
  getPollInDatabase,
  getVoteForUserInDatabase
} from "./firebaseInspirationFunctions";
import { getSenderInvitesFromDatabase } from "./firebaseInviteFunctions";
import { followUser, getUserInfo } from "./firebaseUserFunctions";

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

export async function convertDateToTimestamp(userId: string) {
  const { upcomingEvents, pastEvents } = await getEventsFromDatabase(userId);
  const allEvents = [...upcomingEvents, ...pastEvents];
  // Any here because the date is a string in the database
  const eventsWithDate = allEvents.filter((event: any) => event.date);

  // Any here because the date is a string in the database
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

export async function convertUserFollowingToDatabaseFollowing(userId: string) {
  const user = (await getUserInfo(userId)) as any;

  if (user?.following && Array.isArray(user.following)) {
    await Promise.all(
      user.following.map((following: string) =>
        followUser(userId, following, false)
      )
    );
  }
}

export async function convertPollVotesToDatabasePollVotes(userId: string) {
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
}

export async function convertPhotoDataToGalleryPhotoData(userId: string) {
  const photoData = await getPhotosDataLocally();

  const newPhotoData: GalleryPhoto[] = [];
  for (const photo of photoData) {
    if (photo.id) {
      newPhotoData.push({
        photoId: photo.id,
        eventTitle: photo.title,
        uri: photo.uri,
        userId: userId,
        createdAt: parseDatabaseDate(photo.date),
        type: "local"
      });
    } else {
      newPhotoData.push(photo);
    }
  }

  await AsyncStorage.setItem("photosData", JSON.stringify(newPhotoData));
}
