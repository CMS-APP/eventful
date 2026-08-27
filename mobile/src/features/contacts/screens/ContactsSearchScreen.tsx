import { FirebaseAuthTypes, getAuth } from "@react-native-firebase/auth";
import { ActivityIndicator } from "react-native-paper";

import { useEffect, useRef, useState } from "react";

import { StyleSheet, TextInput, View } from "react-native";

import { RouteProp } from "@react-navigation/native";

import { ContactsStackParamList } from "@/app/navigationTypes";
import { Screen } from "@/components/screen/Screen";
import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { ProfileButton } from "@/features/profile/components/ProfileButton";
import { userSearch } from "@/services/firebase/firebaseBackend";
import { User } from "@/types/User";
import { showErrorNotification } from "@/utils/appNotifications";
import { log } from "@/utils/logging";

import { ContactsSearch } from "../components/ContactsSearch";

interface ContactsSearchScreenProps {
  route: RouteProp<ContactsStackParamList, "ContactSearch">;
}

export function ContactsSearchScreen({ route }: ContactsSearchScreenProps) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const user = getAuth().currentUser;
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (route.params?.open) {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    }
  }, [route.params]);

  async function getUsers() {
    log("Contact Search: Getting users", "info");
    try {
      const users = await userSearch(search, user as FirebaseAuthTypes.User);
      setUsers(users);
    } catch (error) {
      log(`Error getting users: ${(error as any)?.message ?? error}`, "error");
      showErrorNotification("Error Loading Users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!search.trim()) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const debounceTimeout = setTimeout(() => {
      getUsers();
    }, 500);

    return () => clearTimeout(debounceTimeout); // Clear timeout on cleanup
  }, [search]);

  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Contacts",
          subTitle: "Search",
          color: colors.white,
          backgroundColor: colors.primary,
          icon: "search",
          backAction: true
        },
        backgroundColor: colors.primary
      }}
      nonScrollConfig={{
        paddingTop: 52
      }}
      nonScrollChildren={
        <ContactsSearch
          search={search}
          setSearch={setSearch}
          textInputRef={textInputRef}
        />
      }
    >
      <View style={styles.usersContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.secondary} />
            <Text type="body">Searching</Text>
          </View>
        ) : search.trim() ? (
          <View style={styles.usersList}>
            {users.length > 0 &&
              users.map((user: User) => (
                <ProfileButton key={user.uid} uid={user.uid} />
              ))}
            {users.length === 0 && (
              <View style={styles.noUsersContainer}>
                <Text type="subHeader">No users found</Text>
                <Text type="body">Try searching for a different name</Text>
              </View>
            )}
          </View>
        ) : (
          <EmptyStateContainer
            title="No Users Found"
            description="Please input a search item"
            icon="search"
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: "center",
    gap: 12
  },
  noUsersContainer: {
    alignItems: "center",
    marginTop: 12
  },
  usersContainer: {
    marginTop: 12,
    paddingHorizontal: 24
  },
  usersList: {
    gap: 12
  }
});
