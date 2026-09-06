import { useSelector } from "react-redux";

import { useEffect, useRef, useState } from "react";

import {
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome } from "@expo/vector-icons";

import { HomeStackParamList } from "@/app/navigation";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { ProfilePicture } from "@/features/profile/components/ProfilePicture";
import { trackPostLiked } from "@/services/analytics/events";
import {
  getPostLikesCount,
  hasUserLikedPost,
  togglePostLike
} from "@/services/firebase/inspiration";
import { getUserInfo } from "@/services/firebase/user";
import { UserState } from "@/store/UserSlice";
import { Post } from "@/types/Post";
import { User } from "@/types/User";
import { calculateTimeAgo } from "@/utils/date";
import { haptics } from "@/utils/haptics";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

import { PostImageCarousel } from "./PostImageCarousel";

export function PostItem({ post }: { post: Post }) {
  const [author, setAuthor] = useState<User | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUserId = useSelector((state: UserState) => state.uid);
  const navigation = useNavigation() as StackNavigationProp<HomeStackParamList>;

  const loadLikeData = async () => {
    const [count, liked] = await Promise.all([
      getPostLikesCount(post.id),
      currentUserId
        ? hasUserLikedPost(post.id, currentUserId)
        : Promise.resolve(false)
    ]);
    setLikesCount(count);
    setIsLiked(liked);
  };

  async function fetchAuthor() {
    const user = await getUserInfo(post.authorId);
    setAuthor(user);
  }

  useEffect(() => {
    if (!currentUserId) return;

    fetchAuthor();
    loadLikeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id, post.authorId, currentUserId]);

  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current as unknown as number);
      }
    };
  }, []);

  const handlePress = async () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current as unknown as number);
      tapTimeoutRef.current = null;
    }

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (isLiked) {
        return;
      }

      try {
        haptics.success();
        await togglePostLike(post.id, currentUserId);
        trackPostLiked();
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      } catch (error) {
        log(`Error Liking Post: ${error}`, "error");
        showErrorToast("Error Liking Post");
      }
    } else {
      tapTimeoutRef.current = setTimeout(() => {
        lastTapRef.current = 0;
      }, DOUBLE_TAP_DELAY);
    }

    lastTapRef.current = now;
  };

  const handleLikePress = async () => {
    if (!currentUserId) return;

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));

    if (newLikedState) {
      haptics.success();
      trackPostLiked();
    } else {
      haptics.error();
    }

    try {
      await togglePostLike(post.id, currentUserId);
    } catch {
      log("Error Liking Post: ", "error");
    }
  };

  const handleUserPress = () => {
    if (!author) return;
    haptics.soft();

    navigation.navigate("Account", {
      screen: "Profile",
      params: { screen: "ProfileView", params: { user: author as User } }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.postItem}>
        <TouchableOpacity
          onPress={handleUserPress}
          hitSlop={getHitSlop("medium")}
        >
          <View style={styles.header}>
            {author && (
              <ProfilePicture
                user={author}
                size={36}
                borderColor={colors.lightGray}
                borderWidth={2}
              />
            )}
            <View style={styles.authorSection}>
              <Text type="body">{post.authorName}</Text>
              <Text type="footnote" style={styles.timeText}>
                {calculateTimeAgo(new Date(post.createdAt))}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {post.images && post.images.length > 0 && (
          <PostImageCarousel photos={post.images} postId={post.id} />
        )}

        <View>
          <Text type="subHeader" style={styles.titleText}>
            {post.title}
          </Text>
          <Text type="body" style={styles.descriptionText}>
            {post.description}
          </Text>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.likeButton, isLiked && styles.likedButton]}
            onPress={handleLikePress}
            hitSlop={getHitSlop("medium")}
          >
            <FontAwesome
              name="heart"
              solid={isLiked}
              size={20}
              color={isLiked ? colors.secondary : colors.gray}
            />
            <Text type="body" style={isLiked && styles.likedText}>
              {likesCount}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  actionsSection: {
    flexDirection: "row"
  },
  authorSection: {
    alignItems: "flex-start"
  },
  descriptionText: {
    textAlign: "left"
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  likeButton: {
    ...card.medium,
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  likedButton: {
    backgroundColor: colors.primary
  },
  likedText: {
    color: colors.white
  },
  postItem: {
    backgroundColor: colors.white,
    borderRadius: 16,
    gap: 12,
    padding: 16,
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  timeText: {
    color: colors.gray
  },
  titleText: {
    textAlign: "left"
  }
});
