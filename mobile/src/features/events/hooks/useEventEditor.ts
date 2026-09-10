import React, { useCallback, useEffect, useRef, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";

import { trackEventUpdated } from "@/services/analytics/events";
import { getEventInfo, updateEventInDatabase } from "@/services/firebase/event";
import { updateEventLinkInDatabase } from "@/services/firebase/invite";
import { updateNotificationsForEvent } from "@/services/pushNotifications";
import { Event } from "@/types/Event";
import { parseDatabaseDate } from "@/utils/date";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

const SAVE_DEBOUNCE_MS = 250;

export interface UseEventEditorResult {
  event: Event;
  setEvent: React.Dispatch<React.SetStateAction<Event>>;
  saveNow: (updater: Event | ((prev: Event) => Event)) => Promise<void>;
}

async function commitEvent(next: Event, previous: Event) {
  await updateEventInDatabase(next);
  trackEventUpdated();

  if (next.eventLinkEnabled) {
    await updateEventLinkInDatabase(next);
  }

  if (
    parseDatabaseDate(next.date).getTime() !==
    parseDatabaseDate(previous.date).getTime()
  ) {
    await updateNotificationsForEvent(next);
  }
}

export function useEventEditor(seedEvent: Event): UseEventEditorResult {
  const [event, setEvent] = useState<Event>(seedEvent);
  const baselineRef = useRef<Event>(seedEvent);
  const eventRef = useRef<Event>(seedEvent);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  eventRef.current = event;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        const eventData = await getEventInfo({ id: seedEvent.id } as Event);
        if (cancelled) return;
        if (eventData) {
          setEvent(eventData);
          baselineRef.current = eventData;
        } else {
          log("Error Loading Event: Event not found", "error");
          showErrorToast("Error Loading Event");
        }
      }

      load();
      return () => {
        cancelled = true;
      };
    }, [seedEvent.id])
  );

  useEffect(() => {
    debounceTimeout.current = setTimeout(async () => {
      if (event === baselineRef.current) {
        return;
      }

      const previous = baselineRef.current;
      baselineRef.current = event;
      await commitEvent(event, previous);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [event]);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current && eventRef.current !== baselineRef.current) {
        clearTimeout(debounceTimeout.current);
        const previous = baselineRef.current;
        const next = eventRef.current;
        baselineRef.current = next;
        commitEvent(next, previous);
      }
    };
  }, []);

  const saveNow = useCallback(
    async (updater: Event | ((prev: Event) => Event)) => {
      const next =
        typeof updater === "function"
          ? (updater as (prev: Event) => Event)(eventRef.current)
          : updater;
      const previous = baselineRef.current;

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      setEvent(next);
      baselineRef.current = next;
      await commitEvent(next, previous);
    },
    []
  );

  return { event, setEvent, saveNow };
}
