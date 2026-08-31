import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { InspirationStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { IconButton } from "@/design-system/components/buttons/IconButton";
import { colors } from "@/design-system/tokens/colors";
import { isUserAdmin } from "@/services/firebase/user";
import { UserState } from "@/store/UserSlice";
import { showOptionsAlert } from "@/utils/alertModal";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

import { PollView } from "../components/PollView";
import { PostsView } from "../posts/PostsView";

export function InspirationScreen() {
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

  const navigation =
    useNavigation<StackNavigationProp<InspirationStackParamList>>();

  function newItemAction() {
    showOptionsAlert("New Item", "Select the type of item you want to create", [
      {
        text: "Poll",
        onPress: () => {
          navigation.navigate("CreatePoll");
        }
      },
      {
        text: "Post",
        onPress: () => {
          navigation.navigate("CreatePost");
        }
      },
      {
        text: "Cancel",
        style: "cancel"
      }
    ]);
  }

  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Inspiration",
          color: colors.white,
          backgroundColor: colors.primary,
          icon: "lightbulb"
        }
      }}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          {isAdmin && (
            <IconButton
              iconName="plus"
              onPress={newItemAction}
              color={colors.white}
              size="small"
            />
          )}
        </View>

        <PollView />
        <PostsView />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    marginHorizontal: 24
  },
  header: {
    flexDirection: "row",
    height: 52,
    justifyContent: "flex-end"
  }
});
