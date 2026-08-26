import { ActivityIndicator } from "react-native-paper";

import { useCallback, useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";

import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { Screen } from "@/components/views/screen/Screen";
import { colors } from "@/design-system/tokens/colors";
import { ProfileStackParamList } from "@/features/app/navigationTypes";
import {
  getUserFollowers,
  getUserFollowing,
  getUsersFromFollowing
} from "@/services/firebase/firebaseUserFunctions";
import { User } from "@/types/User";

import { ProfileButton } from "../components/ProfileButton";

interface ProfileFollowersScreenProps {
  route: RouteProp<ProfileStackParamList, "ProfileFollowers">;
}

export function ProfileFollowersScreen({ route }: ProfileFollowersScreenProps) {
  const { user, type } = route.params;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const getUsers = useCallback(async () => {
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
    setLoading(false);
  }, [user.uid, type]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

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
