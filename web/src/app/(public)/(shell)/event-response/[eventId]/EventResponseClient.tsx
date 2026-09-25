"use client";

import { useEffect, useState } from "react";

import { formatEventDateTime } from "@/lib/dates";
import { BACKEND_URL } from "@/lib/backendUrl";
import { checkEventLink } from "@/services/firebase/firebaseFunctions";

import { EventGuest } from "./EventGuestList";
import { EventInvitePanel } from "./EventInvitePanel";
import { EventRsvpForm } from "./EventRsvpForm";

import "./page.css";

export function EventResponseClient({ eventId }: { eventId: string }) {
  const [hostId, setHostId] = useState("");
  const [hostName, setHostName] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventAddress, setEventAddress] = useState("");
  const [eventDateLabel, setEventDateLabel] = useState("");
  const [eventTimeLabel, setEventTimeLabel] = useState("");
  const [guests, setGuests] = useState<EventGuest[]>([]);

  async function fetchGuestList(id: string) {
    try {
      const res = await fetch(
        `${BACKEND_URL}/eventGuestList?eventId=${encodeURIComponent(id)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setGuests(data.guests ?? []);
    } catch (error) {
      console.error("Error fetching guest list:", error);
    }
  }

  useEffect(() => {
    async function checkLink(id: string) {
      const data = await checkEventLink(id);

      if (!data) {
        console.warn("Invalid event link");
        return;
      }

      setHostId(data.userId);
      setHostName(data.hostName);
      setEventName(data.eventName);
      setEventAddress(data.address ?? "");

      if (data.dateTime) {
        const { dateLabel, timeLabel } = formatEventDateTime(data.dateTime);
        setEventDateLabel(dateLabel);
        setEventTimeLabel(timeLabel);
      }
    }

    checkLink(eventId);
    fetchGuestList(eventId);
  }, [eventId]);

  const hostFirstName = hostName.split(" ")[0] || "The host";

  return (
    <main className="event-response-page">
      <div className="event-response-shell">
        <div className="event-response-card">
          <EventInvitePanel
            eventName={eventName}
            hostName={hostName}
            eventDateLabel={eventDateLabel}
            eventTimeLabel={eventTimeLabel}
            eventAddress={eventAddress}
            guests={guests}
          />

          <EventRsvpForm
            eventId={eventId}
            hostId={hostId}
            eventName={eventName}
            hostFirstName={hostFirstName}
            onResponded={() => fetchGuestList(eventId)}
          />
        </div>

        {hostName && (
          <p className="event-response-sent-by">
            This invite was sent to you by {hostName} through Eventful
          </p>
        )}
      </div>
    </main>
  );
}
