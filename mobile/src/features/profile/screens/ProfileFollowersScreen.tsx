import { ActivityIndicator } from "react-native-paper";

import { useCallback, useState } from "react";

import { StyleSheet, View } from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/native";

import { ProfileStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { colors } from "@/design-system/tokens/colors";
import {
  getUserFollowers,
  getUserFollowing,
  getUsersFromFollowing
} from "@/services/firebase/user";
import { User } from "@/types/User";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

import { ProfileButton } from "../components/ProfileButton";

interface ProfileFollowersScreenProps {
  route: RouteProp<ProfileStackParamList, "ProfileFollowers">;
}

export function ProfileFollowersScreen({ route }: ProfileFollowersScreenProps) {
  const { user, type } = route.params;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const getUsers = useCallback(async () => {
    try {
      setLoading(true);
      let users: User[] = [];
      if (type === "Followers") {
        const followers = await getUserFollowers(user.uid);
        users = await getUsersFromFollowing(followers, type);
      } else if (type === "Following") {
        const following = await getUserFollowing(user.uid);
        users = await getUsersFromFollowing(following, type);
      }
      setUsers(users);
    } catch (error) {
      log("Error getting users: " + error, "error");
      showErrorToast("Error getting users");
    } finally {
      setLoading(false);
    }
  }, [user.uid, type]);

  useFocusEffect(
    useCallback(() => {
      getUsers();
    }, [getUsers])
  );

  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: type || "",
          subTitle: user.name,
          color: colors.white,
          backgroundColor: colors.primary,
          icon: "user",
          backAction: true,
          accountButton: false
        },
        backgroundColor: colors.primary
      }}
      contentConfig={{
        tabBarPresent: true
      }}
    >
      <View style={styles.usersContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.secondary} />
        ) : (
          <>
            {users.length > 0 ? (
              <>
                {users.map((user) => (
                  <ProfileButton key={user.uid} uid={user.uid} />
                ))}
              </>
            ) : (
              <EmptyStateContainer
                title="No Users Found"
                description="No users found"
                icon="user"
              />
            )}
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  usersContainer: {
    gap: 12,
    marginTop: 52,
    paddingHorizontal: 16
  }
});
