import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import {
  getPollInDatabase,
  getVoteForUserInDatabase,
  getVotesInDatabase
} from "@/services/firebase/inspiration";
import { UserState } from "@/store/UserSlice";
import { Poll } from "@/types/Poll";
import { PollVote } from "@/types/PollVote";

import { PollOptionView } from "./PollOptionView";

export function PollView() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<PollVote[]>([]);
  const [userVote, setUserVote] = useState<PollVote | null>(null);
  const userId = useSelector((state: UserState) => state.uid);

  const fetchPoll = useCallback(async () => {
    const poll = await getPollInDatabase();
    setPoll(poll);

    if (poll) {
      const votes = await getVotesInDatabase(poll);
      setVotes(votes);
      const userVote = await getVoteForUserInDatabase(poll, userId);
      setUserVote(userVote as PollVote | null);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchPoll();
    }, [fetchPoll])
  );

  if (!poll || poll.options.length === 0) return;

  return (
    <View style={styles.container}>
      <Text type="header" color={colors.black}>
        Poll
      </Text>
      <View style={styles.contentContainer}>
        <Text type="subHeader" color={colors.black}>
          {poll.title}
        </Text>
        <Text type="body" color={colors.black}>
          {poll.subtitle}
        </Text>

        <View style={styles.optionsContainer}>
          {poll?.options?.map((option: string, index: number) => (
            <PollOptionView
              key={`option-${option}-${index}`}
              poll={poll}
              votes={votes}
              setVotes={setVotes}
              option={option}
              userVote={userVote}
              setUserVote={setUserVote}
            />
          ))}

          <Text type="body" italic color={colors.gray}>
            Total Votes: {votes.length}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12
  },
  contentContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: 20
  },
  optionsContainer: {
    gap: 12,
    marginTop: 6
  }
});
