import { updateUserInfo } from "@/services/firebase/firebaseUserFunctions";
import { User } from "@/types/User";

import { convertPhotoDataToGalleryPhotoData } from "../firebase/firebaseDataUpdates";
import {
  convertDateToTimestamp,
  convertEventEventToEvent,
  convertEventGuestList,
  convertEventInvites,
  convertLocalEventsToDatabase,
  convertPollVotesToDatabasePollVotes,
  convertUserFollowingToDatabaseFollowing
} from "./updateFunctions";

type ConversionFn =
  | ((userId: string) => Promise<void>)
  | ((user: User) => Promise<void>);

type UpdateStep = {
  fromVersions: string[];
  toVersion: string;
  progressStep: number;
  conversions: {
    fn: ConversionFn;
    needsUserObject?: boolean;
  }[];
};

const UPDATE_STEPS: UpdateStep[] = [
  {
    fromVersions: [],
    toVersion: "1.0.0",
    progressStep: 4,
    conversions: [
      { fn: convertLocalEventsToDatabase },
      { fn: convertEventEventToEvent }
    ]
  },
  {
    fromVersions: ["1.0.0", "1.1.0"],
    toVersion: "1.2.0",
    progressStep: 7,
    conversions: [
      { fn: convertEventInvites },
      { fn: convertEventGuestList, needsUserObject: true }
    ]
  },
  {
    fromVersions: ["1.3.0", "1.2.0"],
    toVersion: "1.4.0",
    progressStep: 10,
    conversions: [{ fn: convertUserFollowingToDatabaseFollowing }]
  },
  {
    fromVersions: ["1.4.0"],
    toVersion: "1.5.0",
    progressStep: 11,
    conversions: [{ fn: convertPollVotesToDatabasePollVotes }]
  },
  {
    fromVersions: ["1.5.0"],
    toVersion: "1.6.0",
    progressStep: 12,
    conversions: [{ fn: convertDateToTimestamp }]
  },
  {
    fromVersions: ["1.6.0"],
    toVersion: "1.6.0",
    progressStep: 13,
    conversions: [{ fn: convertPhotoDataToGalleryPhotoData }]
  }
];

export async function appDatabaseUpdate(
  finalData: User,
  updateProgress: (step: number, message: string) => void,
  initSteps: string[]
) {
  let currentVersion = finalData.databaseUpdate || null;

  for (const step of UPDATE_STEPS) {
    const shouldRun =
      step.fromVersions.length === 0
        ? currentVersion === null
        : step.fromVersions.includes(currentVersion || "");

    if (!shouldRun) continue;

    finalData.databaseUpdate = step.toVersion;

    for (let i = 0; i < step.conversions.length; i++) {
      const conversion = step.conversions[i];
      const progressIndex = step.progressStep + i;
      updateProgress(progressIndex, initSteps[progressIndex - 1]);

      if (conversion.needsUserObject) {
        await (conversion.fn as (user: User) => Promise<void>)(finalData);
      } else {
        await (conversion.fn as (userId: string) => Promise<void>)(
          finalData.uid
        );
      }
    }

    await updateUserInfo(finalData.uid, finalData);
    currentVersion = step.toVersion;
  }

  return finalData;
}
