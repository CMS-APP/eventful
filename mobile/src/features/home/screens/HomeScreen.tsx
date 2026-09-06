import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View
} from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { colors } from "@/design-system/tokens/colors";
import { PollView } from "@/features/inspiration/components/PollView";
import { PostsView } from "@/features/inspiration/posts/PostsView";
import { isUserAdmin } from "@/services/firebase/user";
import { UserState } from "@/store/UserSlice";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

import { HomeButtons } from "../components/HomeButtons";
import { HomeNextEvent } from "../components/HomeNextEvent";

interface HomeScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
}

export function HomeScreen(_: HomeScreenProps) {
  const [scrollY, setScrollY] = useState(0);
  const uid = useSelector((state: UserState) => state.uid);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkIsAdmin = useCallback(async () => {
    try {
      const isAdmin = await isUserAdmin(uid || "");
      setIsAdmin(isAdmin);
    } catch (error) {
      log("Error checking if user is admin: " + error, "error");
      showErrorToast("Error checking if user is admin");
    }
  }, [uid]);

  useEffect(() => {
    if (uid) {
      checkIsAdmin();
    }
  }, [checkIsAdmin, uid]);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const yOffset = event.nativeEvent.contentOffset.y;
    if (yOffset < 0) {
      setScrollY(-yOffset);
    }
  }

  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Home",
          color: colors.white,
          backgroundColor: colors.primary,
          icon: "home"
        }
      }}
      contentConfig={{
        backgroundColor: colors.lightGray,
        tabBarPresent: true
      }}
      handleScroll={handleScroll}
    >
      <View style={styles.container}>
        <HomeButtons scrollY={scrollY} />
      </View>

      <HomeNextEvent event={null} />

      <View style={styles.feedContainer}>
        <PollView isAdmin={isAdmin} />
        <PostsView isAdmin={isAdmin} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 52
  },
  feedContainer: {
    gap: 12,
    marginHorizontal: 24,
    marginTop: 12
  }
});
