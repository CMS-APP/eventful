import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { ScrollView, StyleSheet, View } from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getSuggestedFollows } from "@/services/firebase/user";
import { UserState } from "@/store/UserSlice";
import { User } from "@/types/User";
import { isValidUserId } from "@/utils/userId";

import { SuggestedFollowCard } from "./SuggestedFollowCard";

export function SuggestedFollows() {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const userId = useSelector((state: UserState) => state.uid);

  const fetchData = useCallback(async () => {
    if (!isValidUserId(userId)) return;

    const suggestedUsers = await getSuggestedFollows(userId);
    setSuggestions(suggestedUsers);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text type="header" color={colors.black} style={styles.title}>
        Suggested Users
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {suggestions.map((user) => (
          <SuggestedFollowCard key={user.uid} uid={user.uid} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginTop: 20
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 8,
    paddingHorizontal: 16
  },
  title: {
    paddingHorizontal: 16
  }
});
