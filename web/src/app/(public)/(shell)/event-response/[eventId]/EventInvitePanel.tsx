"use client";

import { faApple, faGooglePlay } from "@fortawesome/free-brands-svg-icons";
import { faCalendar, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useState } from "react";

import { APP_STORE_LINK, GOOGLE_PLAY_LINK } from "@/lib/appLinks";

import EventGuestList, { EventGuest } from "./EventGuestList";

interface EventInvitePanelProps {
  eventName: string;
  hostName: string;
  eventDateLabel: string;
  eventTimeLabel: string;
  eventAddress: string;
  guests: EventGuest[];
}

export default function EventInvitePanel({
  eventName,
  hostName,
  eventDateLabel,
  eventTimeLabel,
  eventAddress,
  guests
}: EventInvitePanelProps) {
  const [showGuestList, setShowGuestList] = useState(false);

  return (
    <div className="event-response-panel event-response-panel--invite">
      <p className="event-response-eyebrow">You&apos;re invited</p>
      <h1 className="event-response-event-name">{eventName}</h1>
      <p className="event-response-hosted-by">
        Hosted by <span>{hostName}</span>
      </p>

      <div className="event-response-divider" />

      <div className="event-response-detail">
        <FontAwesomeIcon
          icon={faCalendar}
          className="event-response-detail-icon"
        />
        <div>
          <p className="event-response-detail-label">Date</p>
          <p className="event-response-detail-value">{eventDateLabel}</p>
          {eventTimeLabel && (
            <p className="event-response-detail-sub">{eventTimeLabel}</p>
          )}
        </div>
      </div>

      <div className="event-response-detail">
        <FontAwesomeIcon
          icon={faLocationDot}
          className="event-response-detail-icon"
        />
        <div>
          <p className="event-response-detail-label">Location</p>
          <p className="event-response-detail-value">
            {eventAddress || "No address yet"}
          </p>
        </div>
      </div>

      <EventGuestList
        guests={guests}
        expanded={showGuestList}
        onToggle={() => setShowGuestList((current) => !current)}
      />

      <div className="event-response-install">
        <div className="event-response-install-text">
          <p className="event-response-install-title">Get the Eventful app</p>
          <p className="event-response-install-subtitle">
            Plan events, invite friends, and share photos - all in one app.
          </p>
        </div>
        <div className="event-response-install-links">
          <a
            href={APP_STORE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="event-response-install-link"
          >
            <FontAwesomeIcon icon={faApple} />
            App Store
          </a>
          <a
            href={GOOGLE_PLAY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="event-response-install-link"
          >
            <FontAwesomeIcon icon={faGooglePlay} />
            Google Play
          </a>
        </div>
      </div>
    </div>
  );
}
