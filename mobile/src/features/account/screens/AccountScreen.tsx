import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AccountStackParamList } from "@/app/navigationTypes";
import { Screen } from "@/components/screen/Screen";
import { ArcCutout } from "@/components/views/ArcCutout";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import {
  getUserFollowers,
  getUserFollowing
} from "@/services/firebase/firebaseUserFunctions";
import { UserState } from "@/store/UserSlice";
import { User } from "@/types/User";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";

import { AccountButtons } from "../components/AccountButtons";
import { AccountPicture } from "../components/AccountPicture";

export function AccountScreen() {
  const userId = useSelector((state: UserState) => state.uid);
  const name = useSelector((state: UserState) => state.name);
  const username = useSelector((state: UserState) => state.username);
  const photoBooth = useSelector((state: UserState) => state.photoBooth);
  const premium = useSelector((state: UserState) => state.premium);
  const navigation =
    useNavigation<StackNavigationProp<AccountStackParamList>>();

  const [userFollowers, setUserFollowers] = useState(0);
  const [userFollowing, setUserFollowing] = useState(0);

  const setData = useCallback(async (userData: User) => {
    const followers = await getUserFollowers(userData.uid);
    const following = await getUserFollowing(userData.uid);
    setUserFollowers(followers.length);
    setUserFollowing(following.length);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setData({
        uid: userId,
        emailVerified: false,
        name: "",
        username: "",
        pushTokens: []
      } as User);
    }, [setData, userId])
  );

  function goToContactSections(section: string) {
    haptics.soft();

    navigation.navigate("Profile", {
      screen: "ProfileFollowers",
      params: {
        type: section,
        user: { uid: userId }
      }
    });
  }

  function followersText(type: string, count: number) {
    return (
      <TouchableOpacity
        onPress={() => {
          goToContactSections(type);
        }}
        style={styles.contactText}
        hitSlop={getHitSlop("medium")}
      >
        <Text type="body" color={colors.white}>
          {type}
        </Text>
        <Text type="subHeader" color={colors.white}>
          {count}
        </Text>
      </TouchableOpacity>
    );
  }

  function getAccountType() {
    if (photoBooth) {
      return "Photo Booth";
    } else if (premium) {
      return "Premium";
    } else {
      return "Free";
    }
  }

  return (
    <Screen
      headerConfig={{
        type: "flat",
        flatHeaderProps: {
          title: "Account",
          backgroundColor: colors.primary,
          dark: true,
          backAction: true
        },
        backgroundColor: colors.primary
      }}
      contentConfig={{
        tabBarPresent: true,
        backgroundColor: colors.white
      }}
    >
      <View style={styles.accountCard}>
        <View style={styles.infoRow}>
          {followersText("Followers", userFollowers)}
          <AccountPicture />
          {followersText("Following", userFollowing)}
        </View>

        <View>
          <View style={styles.accountTypeContainer}>
            <Text
              type="subHeader"
              color={colors.secondary}
              style={styles.accountLabel}
            >
              Account:
            </Text>
            <Text
              type="subHeader"
              color={
                photoBooth
                  ? colors.white
                  : premium
                    ? colors.secondary
                    : colors.white
              }
            >
              {getAccountType()}
            </Text>
          </View>
          <View style={styles.nameContainer}>
            <Text type="subHeader" color={colors.white}>
              {name}
            </Text>
            <Text type="body" color={colors.gray}>
              Username: {username}
            </Text>
          </View>
        </View>
        <View style={styles.arcCutout}>
          <ArcCutout color={colors.primary} rotation={270} />
        </View>
      </View>

      <AccountButtons />
    </Screen>
  );
}

const styles = StyleSheet.create({
  accountCard: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 40,
    paddingBottom: 24
  },
  accountLabel: {
    marginRight: 6
  },
  accountTypeContainer: {
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12
  },
  arcCutout: {
    bottom: 0,
    left: 40,
    position: "absolute"
  },
  contactText: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  },
  infoRow: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24
  },
  nameContainer: {
    alignItems: "center",
    justifyContent: "center"
  }
});
