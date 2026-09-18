import { useDispatch, useSelector } from "react-redux";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PhotoResult } from "expo-camera";

import type { PhotoBoothSessionContextValue } from "@/features/photo-booth/context/session/PhotoBoothSessionContext";
import { PhotoBoothSessionContext } from "@/features/photo-booth/context/session/PhotoBoothSessionContext";
import { findHostedEventForNow } from "@/services/photo-booth/eventMatch";
import type { UserState } from "@/store/UserSlice";
import { setPhotoBoothLocked } from "@/store/UserSlice";

export function PhotoBoothSessionProvider({
  children
}: {
  children: ReactNode;
}) {
  const dispatch = useDispatch();
  const userId = useSelector((state: UserState) => state.uid);
  const [photos, setPhotos] = useState<PhotoResult[]>([]);
  const [photoBoothPage, setPhotoBoothPage] = useState("home");
  const [locked, setLocked] = useState(false);
  const [lockPin, setLockPin] = useState("");
  const [isBoothRunning, setIsBoothRunningState] = useState(false);
  const [linkedEventId, setLinkedEventId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(setPhotoBoothLocked(locked));
  }, [locked, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(setPhotoBoothLocked(false));
    };
  }, [dispatch]);

  useEffect(() => {
    if (!userId || !isBoothRunning) return;

    findHostedEventForNow(userId).then((event) =>
      setLinkedEventId(event?.id ?? null)
    );
  }, [userId, isBoothRunning]);

  const setIsBoothRunning = useCallback((running: boolean) => {
    setIsBoothRunningState(running);
  }, []);

  const value = useMemo<PhotoBoothSessionContextValue>(
    () => ({
      photos,
      photoBoothPage,
      locked,
      lockPin,
      setPhotos,
      setPhotoBoothPage,
      setLocked,
      setLockPin,
      isBoothRunning,
      setIsBoothRunning,
      linkedEventId
    }),
    [
      photos,
      photoBoothPage,
      locked,
      lockPin,
      isBoothRunning,
      setIsBoothRunning,
      linkedEventId
    ]
  );

  return (
    <PhotoBoothSessionContext.Provider value={value}>
      {children}
    </PhotoBoothSessionContext.Provider>
  );
}
