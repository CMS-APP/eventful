import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { Alert, StyleSheet, View } from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { Button } from "@/components/buttons/Button";
import { Input } from "@/components/inputs/Input";
import { KeyboardScrollView } from "@/components/views/KeyboardScrollView";
import { LoadingModal } from "@/components/views/LoadingModal";
import { FlatHeader } from "@/components/views/screen/FlatHeader";
import { FlatHeaderProps } from "@/components/views/screen/props";
import {
  AllStackParamList,
  InspirationStackParamList
} from "@/features/app/navigationTypes";
import { createPostInDatabase } from "@/services/firebase/firebaseInspirationFunctions";
import { UserState } from "@/store/UserSlice";
import { colors } from "@/styles/colors";
import { Photo } from "@/types/Photo";
import { AppError } from "@/utils/error";

import { UploadPhoto } from "../components/UploadPhoto";

interface CreatePostScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
}

export function CreatePostScreen({ navigation }: CreatePostScreenProps) {
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const name = useSelector((state: UserState) => state.name);
  const userId = useSelector((state: UserState) => state.uid);

  const createPost = useCallback(async () => {
    try {
      setLoading(true);
      await createPostInDatabase(postTitle, postDescription, photos, {
        name: name,
        uid: userId
      });
      setLoading(false);
      (navigation as StackNavigationProp<InspirationStackParamList>).goBack();
    } catch (error) {
      new AppError(error, "Error creating post", true);
    } finally {
      setLoading(false);
    }
  }, [postTitle, postDescription, photos, name, userId]);

  function createNewPostAlert() {
    if (!postTitle || !postDescription) {
      return;
    }

    Alert.alert("Are you sure?", "This will be visible to all users", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Create Post",
        onPress: createPost
      }
    ]);
  }

  const headerConfig: FlatHeaderProps = {
    title: "Create Post",
    backgroundColor: colors.white,
    backAction: true
  };

  return (
    <View style={styles.container}>
      <LoadingModal visible={loading} />

      <KeyboardScrollView
        tabBarPresent={false}
        handleScroll={() => {}}
        _handleScroll={() => {}}
        backgroundColor={colors.white}
      >
        <View style={styles.headerContainer}>
          <FlatHeader {...headerConfig} />
          <View style={styles.contentContainer}>
            <Input
              placeholder="Post Title"
              value={postTitle}
              onChangeText={setPostTitle}
              backgroundColor={colors.lightGray}
              textColor={colors.black}
            />

            <Input
              placeholder="Post Description"
              value={postDescription}
              onChangeText={setPostDescription}
              backgroundColor={colors.lightGray}
              textColor={colors.black}
              multilineProps={{
                numberOfLines: 10,
                height: 200
              }}
            />

            <UploadPhoto photos={photos} setPhotos={setPhotos} />

            <View style={styles.divider} />

            <Button
              text={"Create New Post"}
              color={colors.primary}
              textColor={colors.white}
              onPress={createNewPostAlert}
            />
          </View>
        </View>
      </KeyboardScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentContainer: {
    gap: 12,
    paddingHorizontal: 24
  },
  divider: {
    backgroundColor: colors.gray,
    height: 0.5,
    marginVertical: 12
  },
  headerContainer: {
    gap: 12,
    paddingTop: 24
  }
});
