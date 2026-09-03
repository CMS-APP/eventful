import { useCallback, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { HomeStackParamList } from "@/app/navigation";
import { IconButton } from "@/design-system/components/buttons/IconButton";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getPostsFromDatabase } from "@/services/firebase/inspiration";
import { Post } from "@/types/Post";

import { PostItem } from "./PostItem";

interface PostsViewProps {
  isAdmin: boolean;
}

export function PostsView({ isAdmin }: PostsViewProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();

  const getPosts = useCallback(async () => {
    const posts = await getPostsFromDatabase();
    setPosts(posts || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      getPosts();
    }, [getPosts])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text type="header">Posts</Text>
        {isAdmin && (
          <IconButton
            iconName="plus"
            onPress={() => navigation.navigate("CreatePost")}
            color={colors.white}
            size="small"
            marginBottom={0}
            marginTop={0}
          />
        )}
      </View>

      {posts.length === 0 && (
        <Text type="subHeader" style={styles.noPostsText}>
          No posts found
        </Text>
      )}

      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  noPostsText: {
    textAlign: "center"
  }
});
