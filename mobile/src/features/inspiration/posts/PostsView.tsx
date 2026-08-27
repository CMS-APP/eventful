import { useCallback, useState } from "react";

import { StyleSheet } from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { Text } from "@/design-system/components/Text";
import { getPostsFromDatabase } from "@/services/firebase/firebaseInspirationFunctions";
import { Post } from "@/types/Post";

import { PostItem } from "./PostItem";

export function PostsView() {
  const [posts, setPosts] = useState<Post[]>([]);

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
    <>
      <Text type="header" style={styles.header}>
        Posts
      </Text>

      {posts.length === 0 && (
        <Text type="subHeader" style={styles.noPostsText}>
          No posts found
        </Text>
      )}

      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    marginVertical: 12,
    textAlign: "left"
  },
  noPostsText: {
    textAlign: "center"
  }
});
