"use client";

import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type EventGuestResponse = "accept" | "maybe" | "decline";

export interface EventGuest {
  name: string;
  response: EventGuestResponse;
}

const GUEST_RESPONSE_LABELS: Record<EventGuestResponse, string> = {
  accept: "Going",
  maybe: "Maybe",
  decline: "Declined"
};

const GUEST_RESPONSE_ORDER: EventGuestResponse[] = [
  "accept",
  "maybe",
  "decline"
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface EventGuestListProps {
  guests: EventGuest[];
  expanded: boolean;
  onToggle: () => void;
}

export default function EventGuestList({
  guests,
  expanded,
  onToggle
}: EventGuestListProps) {
  return (
    <div className="event-response-detail">
      <FontAwesomeIcon
        icon={faUserGroup}
        className="event-response-detail-icon"
      />
      <div className="event-response-guest-list-container">
        <p className="event-response-detail-label">Guest list</p>
        {guests.length > 0 ? (
          <>
            <div className="event-response-guest-summary">
              {GUEST_RESPONSE_ORDER.map((status) => (
                <span
                  key={status}
                  className={`event-response-guest-summary-item event-response-guest-summary-item--${status}`}
                >
                  {GUEST_RESPONSE_LABELS[status]} (
                  {guests.filter((guest) => guest.response === status).length})
                </span>
              ))}
            </div>

            <button
              type="button"
              className="event-response-guest-toggle"
              onClick={onToggle}
            >
              {expanded ? "Hide" : "See who's going"}
            </button>

            {expanded && (
              <div className="event-response-guest-list">
                {guests.map((guest, index) => (
                  <div
                    key={`${guest.name}-${index}`}
                    className="event-response-guest-row"
                  >
                    <div className="event-response-guest-avatar">
                      {getInitials(guest.name)}
                    </div>
                    <span className="event-response-guest-name">
                      {guest.name}
                    </span>
                    <span
                      className={`event-response-guest-status event-response-guest-status--${guest.response}`}
                    >
                      <span className="event-response-guest-status-dot" />
                      {GUEST_RESPONSE_LABELS[guest.response].toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="event-response-detail-value">No replies yet</p>
        )}
      </div>
    </div>
  );
}
