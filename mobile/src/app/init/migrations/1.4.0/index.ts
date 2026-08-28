import { followUser, getUserInfo } from "@/services/firebase/user";
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
    log(`Error converting: ${error}`, "error");
  }
}
