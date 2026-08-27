import {
  followUser,
  getUserInfo
} from "@/services/firebase/firebaseUserFunctions";
import { log } from "@/utils/logging";

export async function convertUserFollowingToDatabaseFollowing(userId: string) {
  try {
    const user = (await getUserInfo(userId)) as any;

    if (user?.following && Array.isArray(user.following)) {
      await Promise.all(
        user.following.map((following: string) =>
          followUser(userId, following, false)
        )
      );
    }
  } catch (error) {
    log(
      `DatabaseUpdates: Error converting user following to database following: ${(error as any)?.message ?? error}`,
      "error"
    );
  }
}
