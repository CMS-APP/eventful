import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";

import { useCallback, useRef, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { HomeStackParamList } from "@/app/navigation";
import { IconButton } from "@/design-system/components/buttons/IconButton";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
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

interface PollViewProps {
  isAdmin: boolean;
}

export function PollView({ isAdmin }: PollViewProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<PollVote[]>([]);
  const [userVote, setUserVote] = useState<PollVote | null>(null);
  const [loading, setLoading] = useState(true);
  const hasLoadedOnce = useRef(false);
  const userId = useSelector((state: UserState) => state.uid);
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();

  const fetchPoll = useCallback(async () => {
    if (!hasLoadedOnce.current) setLoading(true);
    const poll = await getPollInDatabase();
    setPoll(poll);

    if (poll) {
      const votes = await getVotesInDatabase(poll);
      setVotes(votes);
      if (userId && userId !== "null") {
        const userVote = await getVoteForUserInDatabase(poll, userId);
        setUserVote(userVote as PollVote | null);
      }
    }
    setLoading(false);
    hasLoadedOnce.current = true;
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchPoll();
    }, [fetchPoll])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text type="header" color={colors.black}>
          Poll
        </Text>
        {isAdmin && (
          <IconButton
            iconName="plus"
            onPress={() => navigation.navigate("CreatePoll")}
            color={colors.white}
            size="small"
            marginBottom={0}
            marginTop={0}
          />
        )}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      )}

      {!loading && poll && poll.options.length > 0 && (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  contentContainer: {
    ...card.medium,
    borderRadius: 16,
    padding: 16
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24
  },
  optionsContainer: {
    gap: 12,
    marginTop: 8
  }
});
