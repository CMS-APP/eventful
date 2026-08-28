import { doc, updateDoc } from "@react-native-firebase/firestore";

import { FIRESTORE_DB } from "@/app/init/firebase";
import {
  getPollInDatabase,
  getVoteForUserInDatabase
} from "@/services/firebase/inspiration";
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
    log(`Error converting: ${error}`, "error");
  }
}
