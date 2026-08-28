import { where } from "@react-native-firebase/firestore";
import { getDownloadURL, ref } from "@react-native-firebase/storage";

import { FIREBASE_STORAGE } from "@/app/init/firebase";
import { API_COLLECTIONS } from "@/services/api/constants";
import { deleteDocument } from "@/services/api/delete";
import {
  getDocument,
  getDocuments,
  getDocumentsByQuery
} from "@/services/api/get";
import { setDocument, updateDocument } from "@/services/api/update";
import { uploadImageAsync } from "@/services/firebase/storage";
import { Photo } from "@/types/Photo";
import { Poll } from "@/types/Poll";
import { PollVote } from "@/types/PollVote";
import { Post } from "@/types/Post";
import { User } from "@/types/User";
import { log } from "@/utils/logging";
import { generateUUID } from "@/utils/uuid";

export async function createPostInDatabase(
  postTitle: string,
  postDescription: string,
  photos: Photo[],
  user: Partial<User>
) {
  const postId = generateUUID();
  const adminData = await getDocument(API_COLLECTIONS.ADMIN, "admin");
  const isUserAdmin = adminData?.uids?.includes(user.uid);

  if (!isUserAdmin) {
    throw new Error("User is not admin");
  }

  const uploadedPhotos: Photo[] = [];
  if (photos.length > 0) {
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const storagePath = `posts/${postId}/photo_${i}`;

      await uploadImageAsync(photo.uri, storagePath, 0.8);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const storageRef = ref(FIREBASE_STORAGE, storagePath + ".jpg");
      const downloadUrl = await getDownloadURL(storageRef);

      const uploadedPhoto: Photo = {
        ...photo,
        uri: downloadUrl,
        uploaded: true
      };

      uploadedPhotos.push(uploadedPhoto);
    }
  }

  let authorName = "";
  if (user.firstName && user.lastName) {
    authorName = user.name + " " + user.lastName;
  } else if (user.name) {
    authorName = user.name;
  } else if (user.username) {
    authorName = user.username;
  } else {
    throw new Error("User has no name or username");
  }

  const newPost = {
    id: postId,
    title: postTitle,
    description: postDescription,
    createdAt: new Date().toISOString(),
    authorId: user.uid,
    authorName: authorName,
    images: uploadedPhotos
  };

  await setDocument(newPost, API_COLLECTIONS.POSTS, newPost.id);
}

export async function getPostsFromDatabase(): Promise<Post[]> {
  try {
    const posts = await getDocuments(API_COLLECTIONS.POSTS);
    posts.sort((a, b) => b?.createdAt?.localeCompare(a?.createdAt));
    return posts as Post[];
  } catch (error) {
    log(`Error getting posts: ${error}`, "error");
    return [];
  }
}

export async function createPollInDatabase(
  pollTitle: string,
  pollSubtitle: string,
  pollOptions: string[]
) {
  const newPoll = {
    id: generateUUID(),
    title: pollTitle,
    subtitle: pollSubtitle,
    options: pollOptions
  };

  const polls = await getDocuments(API_COLLECTIONS.POLL);
  for (const poll of polls) {
    await deleteDocument(API_COLLECTIONS.POLL, poll?.id);
  }

  await setDocument(newPoll, API_COLLECTIONS.POLL, newPoll.id);
}

export async function voteForOptionInDatabase(
  poll: Poll,
  userId: string,
  option: string
) {
  const votes = await getDocumentsByQuery(
    [where("pollId", "==", poll?.id), where("userId", "==", userId)],
    API_COLLECTIONS.POLL_VOTE
  );
  if (votes.length > 0) {
    const existingVoteDoc = votes[0];
    const existingVote = existingVoteDoc as PollVote;
    if (existingVote.option === option) {
      await deleteDocument(API_COLLECTIONS.POLL_VOTE, existingVote.voteId);
    } else {
      await updateDocument(
        { option },
        API_COLLECTIONS.POLL_VOTE,
        existingVote.voteId
      );
    }
  } else {
    const vote = {
      pollId: poll.id,
      userId: userId,
      option: option,
      voteId: generateUUID()
    };
    await setDocument(vote, API_COLLECTIONS.POLL_VOTE, vote.voteId);
  }
}

export async function getVoteForUserInDatabase(
  poll: Poll,
  userId: string
): Promise<PollVote | null> {
  try {
    const votes = await getDocumentsByQuery(
      [where("pollId", "==", poll.id), where("userId", "==", userId)],
      API_COLLECTIONS.POLL_VOTE
    );
    return votes[0] as PollVote | null;
  } catch (error) {
    log(`Error getting votes: ${error}`, "error");
    return null;
  }
}

export async function getVotesInDatabase(poll: Poll): Promise<PollVote[]> {
  try {
    const votes = await getDocumentsByQuery(
      [where("pollId", "==", poll.id)],
      API_COLLECTIONS.POLL_VOTE
    );
    return votes as PollVote[];
  } catch (error) {
    log(`Error getting votes: ${error}`, "error");
    return [];
  }
}

export async function getPollInDatabase(): Promise<Poll | null> {
  try {
    const polls = await getDocuments(API_COLLECTIONS.POLL);
    return (polls[0] as Poll) || null;
  } catch (error) {
    log(`Error getting poll: ${error}`, "error");
    return null;
  }
}

export async function togglePostLike(postId: string, userId: string) {
  const like = await getDocument(
    API_COLLECTIONS.POST_LIKES,
    `${postId}_${userId}`
  );
  if (like) {
    await deleteDocument(API_COLLECTIONS.POST_LIKES, `${postId}_${userId}`);
  } else {
    const likeData = {
      postId,
      userId,
      createdAt: new Date().toISOString()
    };
    await setDocument(
      likeData,
      API_COLLECTIONS.POST_LIKES,
      `${postId}_${userId}`
    );
  }
}

export async function getPostLikesCount(postId: string): Promise<number> {
  try {
    const likes = await getDocumentsByQuery(
      [where("postId", "==", postId)],
      API_COLLECTIONS.POST_LIKES
    );
    return likes.length;
  } catch (error) {
    log(`Error getting post likes count: ${error}`, "error");
    return 0;
  }
}

export async function hasUserLikedPost(
  postId: string,
  userId: string
): Promise<boolean> {
  try {
    const likes = await getDocumentsByQuery(
      [where("postId", "==", postId), where("userId", "==", userId)],
      API_COLLECTIONS.POST_LIKES
    );
    return likes.length > 0;
  } catch (error) {
    log(`Error checking if user liked post: ${error}`, "error");
    return false;
  }
}
