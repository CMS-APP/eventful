import { ExtensionStorage } from "@bacons/apple-targets";

import { Platform } from "react-native";

import Constants from "expo-constants";

import { getAllEvents } from "@/services/firebase/event";
import { getInviteFromDatabase } from "@/services/firebase/invite";
import { getUserInfo } from "@/services/firebase/user";
import { userStore } from "@/store/UserSlice";
import { parseDatabaseDate } from "@/utils/date";
import { log } from "@/utils/logging";

const WIDGET_KIND = "EventfulWidget";
const STORAGE_KEY = "nextEvent";

function getAppGroup(): string {
  const bundleIdentifier = Constants.expoConfig?.ios?.bundleIdentifier;
  return `group.${bundleIdentifier}`;
}

export async function syncNextEventWidget(userId?: string) {
  if (Platform.OS !== "ios") return;

  const resolvedUserId = userId || userStore.getState().uid;
  if (!resolvedUserId) return;

  try {
    const storage = new ExtensionStorage(getAppGroup());
    const { upcomingEvents } = await getAllEvents(resolvedUserId);
    const nextEvent = upcomingEvents[0] || null;

    if (!nextEvent) {
      storage.remove(STORAGE_KEY);
    } else {
      const isHost = nextEvent.userId === resolvedUserId;
      let hostName = "";
      let inviteId = "";
      if (!isHost) {
        const host = await getUserInfo(nextEvent.userId);
        hostName = host?.name ?? "";
        const invite = await getInviteFromDatabase(nextEvent, resolvedUserId);
        inviteId = invite?.id ?? "";
      }

      const date = parseDatabaseDate(nextEvent.date);
      storage.set(STORAGE_KEY, {
        name: nextEvent.name,
        dateMs: date ? date.getTime() : 0,
        isHost: isHost ? 1 : 0,
        hostName,
        guestCount: nextEvent.invited?.length ?? 0,
        eventId: nextEvent.id,
        hostId: nextEvent.userId,
        inviteId
      });
    }

    ExtensionStorage.reloadWidget(WIDGET_KIND);
  } catch (error) {
    log(`Error syncing next event widget: ${error}`, "error");
  }
}
