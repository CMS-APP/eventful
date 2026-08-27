import { doc, updateDoc } from "@react-native-firebase/firestore";

import { FIRESTORE_DB } from "@/services/firebase/firebase";
import {
  getPollInDatabase,
  getVoteForUserInDatabase
} from "@/services/firebase/firebaseInspirationFunctions";
import { log } from "@/utils/logging";

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
    log(
      `DatabaseUpdates: Error converting poll votes to database poll votes: ${(error as any)?.message ?? error}`,
      "error"
    );
  }
}
