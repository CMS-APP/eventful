import { useSelector } from "react-redux";

import { useCallback, useEffect, useRef, useState } from "react";

import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { voteForOptionInDatabase } from "@/services/firebase/inspiration";
import { UserState } from "@/store/UserSlice";
import { Poll } from "@/types/Poll";
import { PollVote } from "@/types/PollVote";
import { haptics } from "@/utils/haptics";
import { showErrorToast } from "@/utils/toast";
import { generateUUID } from "@/utils/uuid";

interface PollOptionViewProps {
  poll: Poll;
  votes: PollVote[];
  setVotes: (votes: PollVote[]) => void;
  option: string;
  userVote: PollVote | null;
  setUserVote: (userVote: PollVote | null) => void;
}

export function PollOptionView({
  poll,
  votes,
  setVotes,
  option,
  userVote,
  setUserVote
}: PollOptionViewProps) {
  const [isUserVote, setIsUserVote] = useState(false);
  const userId = useSelector((state: UserState) => state.uid);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const calculatePercentage = useCallback(() => {
    const totalVotes = votes.length;
    const optionVotes = votes.filter((v) => v.option === option).length;
    const newPercentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;

    Animated.timing(animatedWidth, {
      toValue: newPercentage,
      duration: 500,
      useNativeDriver: false
    }).start();
  }, [votes, option, animatedWidth]);

  useEffect(() => {
    calculatePercentage();
  }, [votes, option, animatedWidth, calculatePercentage]);

  useEffect(() => {
    setIsUserVote(userVote?.option === option);
  }, [userVote, option]);

  const handleVote = useCallback(async () => {
    if (userVote?.option === option) {
      setUserVote(null);
      setVotes(votes.filter((v) => v.userId !== userId));
      haptics.error();
    } else if (userVote) {
      const currentUserVote = userVote;
      const newUserVote = {
        pollId: poll.id,
        userId: userId,
        option: option,
        voteId: generateUUID()
      };
      setUserVote(newUserVote);
      setVotes(
        votes.map((v) =>
          v.voteId === currentUserVote.voteId ? newUserVote : v
        )
      );
      haptics.success();
    } else {
      const newUserVote = {
        pollId: poll.id,
        userId: userId,
        option: option,
        voteId: generateUUID()
      };
      setUserVote(newUserVote);
      setVotes([...votes, newUserVote]);
      haptics.success();
    }

    try {
      await voteForOptionInDatabase(poll, userId, option);
    } catch (error) {
      showErrorToast("Error Voting");
      throw error;
    }
  }, [poll, userId, option, votes, userVote, setVotes, setUserVote]);

  return (
    <View style={styles.container}>
      <View style={styles.optionContainer}>
        <Text type="body">{option}</Text>
        <Text type="body" italic style={styles.votesText}>
          Votes: {votes.filter((v: PollVote) => v.option === option).length}
        </Text>

        <View style={styles.progressRow}>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: animatedWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"]
                  })
                }
              ]}
            />
          </View>

          <TouchableOpacity onPress={handleVote} hitSlop={getHitSlop("medium")}>
            <View
              style={[
                styles.voteButton,
                isUserVote ? styles.voteButtonActive : styles.voteButtonInactive
              ]}
            >
              <Text
                type="body"
                color={isUserVote ? colors.white : colors.primary}
              >
                Vote
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  optionContainer: {
    flex: 1
  },
  progressBar: {
    backgroundColor: colors.primaryTint,
    borderRadius: 120,
    height: 30
  },
  progressBarContainer: {
    backgroundColor: colors.white,
    borderRadius: 120,
    flex: 1,
    height: 30,
    marginTop: 2.5,
    overflow: "hidden"
  },
  progressRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  voteButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  voteButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  voteButtonInactive: {
    backgroundColor: colors.white,
    borderColor: colors.primary
  },
  votesText: {
    color: colors.gray
  }
});
