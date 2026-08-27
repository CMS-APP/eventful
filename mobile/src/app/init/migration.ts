import { updateUserInfo } from "@/services/firebase/firebaseUserFunctions";
import { User } from "@/types/User";

import { convertPhotoDataToGalleryPhotoData } from "../../services/firebase/firebaseDataUpdates";
import {
  convertEventEventToEvent,
  convertLocalEventsToDatabase
} from "./migrations/1.0.0";
import {
  convertEventGuestList,
  convertEventInvites
} from "./migrations/1.2.0";
import { convertUserFollowingToDatabaseFollowing } from "./migrations/1.4.0";
import { convertPollVotesToDatabasePollVotes } from "./migrations/1.5.0";
import { convertDateToTimestamp } from "./migrations/1.6.0";

type ConversionFn = (userId: string) => Promise<void>;

type UpdateStep = {
  fromVersions: string[];
  toVersion: string;
  conversions: {
    fn: ConversionFn;
  }[];
};

const UPDATE_STEPS: UpdateStep[] = [
  {
    fromVersions: [],
    toVersion: "1.0.0",
    conversions: [
      { fn: convertLocalEventsToDatabase },
      { fn: convertEventEventToEvent }
    ]
  },
  {
    fromVersions: ["1.0.0", "1.1.0"],
    toVersion: "1.2.0",
    conversions: [{ fn: convertEventInvites }, { fn: convertEventGuestList }]
  },
  {
    fromVersions: ["1.3.0", "1.2.0"],
    toVersion: "1.4.0",
    conversions: [{ fn: convertUserFollowingToDatabaseFollowing }]
  },
  {
    fromVersions: ["1.4.0"],
    toVersion: "1.5.0",
    conversions: [{ fn: convertPollVotesToDatabasePollVotes }]
  },
  {
    fromVersions: ["1.5.0"],
    toVersion: "1.6.0",
    conversions: [{ fn: convertDateToTimestamp }]
  },
  {
    fromVersions: ["1.6.0"],
    toVersion: "1.7.0",
    conversions: [{ fn: convertPhotoDataToGalleryPhotoData }]
  }
];

export async function appDatabaseUpdate(finalData: User) {
  let currentVersion = finalData.databaseUpdate || null;

  for (const step of UPDATE_STEPS) {
    const shouldRun =
      step.fromVersions.length === 0
        ? currentVersion === null
        : step.fromVersions.includes(currentVersion || "");
    if (!shouldRun) continue;

    finalData.databaseUpdate = step.toVersion;
    for (const conversion of step.conversions) {
      await conversion.fn(finalData.uid);
    }

    await updateUserInfo(finalData.uid, finalData);
    currentVersion = step.toVersion;
  }

  return finalData;
}
