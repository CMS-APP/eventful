import { useSelector } from "react-redux";

import { Alert, StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { Screen } from "@/components/views/screen/Screen";
import { IconButton } from "@/design-system/components/IconButton";
import { colors } from "@/design-system/tokens/colors";
import { InspirationStackParamList } from "@/features/app/navigationTypes";
import { UserState } from "@/store/UserSlice";
import { useScreenStatusBar } from "@/utils/statusBar";

import { PollView } from "../components/PollView";
import { PostsView } from "../posts/PostsView";

export function InspirationScreen() {
  useSelector((state: UserState) => state.uid);
  useScreenStatusBar(true);

  const navigation =
    useNavigation<StackNavigationProp<InspirationStackParamList>>();

  function newItemAction() {
    Alert.alert("New Item", "Select the type of item you want to create", [
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
          <IconButton
            iconName="plus"
            onPress={newItemAction}
            color={colors.white}
            size="small"
          />
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
    justifyContent: "flex-end"
  }
});
