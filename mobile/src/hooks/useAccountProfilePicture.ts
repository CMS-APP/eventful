import { useSelector } from "react-redux";

import { useEffect, useState } from "react";

import { syncUserPicture } from "@/services/cache";
import { getUserInfo } from "@/services/firebase/firebaseUserFunctions";
import { UserState } from "@/store/UserSlice";
import { User } from "@/types/User";
import { AppError } from "@/utils/error";

interface ProfilePictureCacheEntry {
  userId: string;
  hash: string;
  promise: Promise<string | null>;
}

let cacheEntry: ProfilePictureCacheEntry | null = null;

async function fetchProfilePicture(userId: string): Promise<string | null> {
  const user = await getUserInfo(userId);
  const imageUri = await syncUserPicture(user as User, true);
  return (imageUri as string) ?? null;
}

function getCachedProfilePicture(userId: string, hash: string) {
  if (cacheEntry && cacheEntry.userId === userId && cacheEntry.hash === hash) {
    return cacheEntry.promise;
  }

  const promise = fetchProfilePicture(userId).catch((error) => {
    cacheEntry = null;
    throw error;
  });
  cacheEntry = { userId, hash, promise };
  return promise;
}

export function useAccountProfilePicture() {
  const userId = useSelector((state: UserState) => state.uid);
  const profilePictureHash = useSelector(
    (state: UserState) => state.profilePictureHash
  );

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setImage(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getCachedProfilePicture(userId, profilePictureHash)
      .then((imageUri) => {
        if (!cancelled) {
          setImage(imageUri);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          new AppError(error, "Error syncing profile picture", true);
          setImage(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId, profilePictureHash]);

  return { image, loading };
}
