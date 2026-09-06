"use client";

import {
  faCalendar,
  faCheck,
  faClock,
  faLocationDot,
  faUserGroup,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReCAPTCHA from "react-google-recaptcha";

import { useEffect, useRef, useState } from "react";

import { checkEventLink } from "@/services/FirebaseFunctions";

import "./page.css";

const RECAPTCHA_SITE_KEY = "6LfDpgQrAAAAAO0TSbcQban4TrA16CjelRzF_Urp";
const APP_STORE_LINK =
  "https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=6449842590";
const GOOGLE_PLAY_LINK =
  "https://play.google.com/store/apps/details?id=com.hostinghappily.app";

type EventDateTime = { seconds: number };

const RESPONSES = [
  { key: "Accept", label: "Accept", icon: faCheck, modifier: "accept" },
  { key: "Maybe", label: "Maybe", icon: faClock, modifier: "maybe" },
  { key: "Decline", label: "Decline", icon: faXmark, modifier: "decline" }
] as const;

export default function EventResponse() {
  const [response, setResponse] = useState<null | string>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hostId, setHostId] = useState("");
  const [eventId, setEventId] = useState("");
  const [hostName, setHostName] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventAddress, setEventAddress] = useState("");
  const [eventDateLabel, setEventDateLabel] = useState("");
  const [eventTimeLabel, setEventTimeLabel] = useState("");
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  function handleResponse(type: string) {
    setResponse((current) => (current === type ? null : type));
  }

  function formatEventDateTime(dateTime: EventDateTime) {
    const date = new Date(dateTime.seconds * 1000);
    const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
    const month = date.toLocaleDateString("en-GB", { month: "long" });
    const dateLabel = `${weekday} ${date.getDate()} ${month} ${date.getFullYear()}`;
    const timeLabel = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    return { dateLabel, timeLabel };
  }

  function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  }

  async function sendResponse() {
    if (isLoading) return;
    setFormMessage(null);

    if (!name) {
      setFormMessage({ type: "error", text: "Please enter your name." });
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormMessage({ type: "error", text: "Please enter a valid email." });
      return;
    }

    if (!response) {
      setFormMessage({ type: "error", text: "Please select a response." });
      return;
    }

    if (!recaptchaRef.current) return;

    setIsLoading(true);

    const recaptchaToken = await recaptchaRef.current.executeAsync();
    recaptchaRef.current.reset();
    if (!recaptchaToken) {
      setFormMessage({ type: "error", text: "reCAPTCHA failed." });
      setIsLoading(false);
      return;
    }

    const deviceId = getOrCreateDeviceId();

    try {
      const res = await fetch(
        "https://respondtoevent-iuxeocrkta-uc.a.run.app",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hostId,
            eventName,
            eventId,
            response: response.toLowerCase(),
            name,
            email: email ? email.toLowerCase() : "",
            recaptchaToken,
            deviceId
          })
        }
      );

      const data = await res.text();
      if (!res.ok) {
        const text =
          res.status === 429
            ? data
            : "Something went wrong sending your reply. Please try again.";
        setFormMessage({ type: "error", text });
        setIsLoading(false);
        return;
      }

      setFormMessage({ type: "success", text: data });
      setName("");
      setEmail("");
      setResponse(null);
    } catch (error) {
      console.error("Error sending response:", error);
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setFormMessage({
        type: "error",
        text: "Something went wrong sending your reply. Please try again."
      });
    }

    setIsLoading(false);
  }

  useEffect(() => {
    async function checkLink(id: string) {
      const data = await checkEventLink(id);

      if (!data) {
        console.warn("Invalid event link");
        return;
      }

      setHostId(data.userId);
      setEventId(id);
      setHostName(data.hostName);
      setEventName(data.eventName);
      setEventAddress(data.address ?? "");

      if (data.dateTime) {
        const { dateLabel, timeLabel } = formatEventDateTime(data.dateTime);
        setEventDateLabel(dateLabel);
        setEventTimeLabel(timeLabel);
      }
    }

    const parts = window.location.pathname.split("/");
    const id = parts[parts.length - 1];
    if (id) checkLink(id);
  }, []);

  const hostFirstName = hostName.split(" ")[0] || "The host";
  const canSubmit = !!response && !!name && !isLoading;

  return (
    <>
      <main className="event-response-page">
        <div className="event-response-shell">
          <div className="event-response-card">
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
                  <p className="event-response-detail-value">
                    {eventDateLabel}
                  </p>
                  {eventTimeLabel && (
                    <p className="event-response-detail-sub">
                      {eventTimeLabel}
                    </p>
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

              <div className="event-response-detail">
                <FontAwesomeIcon
                  icon={faUserGroup}
                  className="event-response-detail-icon"
                />
                <div>
                  <p className="event-response-detail-label">Guest list</p>
                  <p className="event-response-detail-value">
                    See who&apos;s going in the app
                  </p>
                  <div className="event-response-download-links">
                    <a
                      href={APP_STORE_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="event-response-download-link"
                    >
                      Download for iOS
                    </a>
                    <a
                      href={GOOGLE_PLAY_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="event-response-download-link"
                    >
                      Download for Android
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="event-response-panel event-response-panel--rsvp">
              <h2 className="event-response-question">Will you be there?</h2>
              <p className="event-response-subtitle">
                {hostFirstName} can see your reply straight away
              </p>

              <div className="event-response-choices">
                {RESPONSES.map(({ key, label, icon, modifier }) => (
                  <button
                    key={key}
                    type="button"
                    className={`event-response-choice event-response-choice--${modifier}${
                      response === key ? " is-selected" : ""
                    }`}
                    onClick={() => handleResponse(key)}
                  >
                    <FontAwesomeIcon icon={icon} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <label className="event-response-field-label" htmlFor="rsvp-name">
                Name
              </label>
              <input
                id="rsvp-name"
                type="text"
                className="event-response-input"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label
                className="event-response-field-label"
                htmlFor="rsvp-email"
              >
                Email <span className="event-response-optional">optional</span>
              </label>
              <input
                id="rsvp-email"
                type="email"
                className="event-response-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {formMessage && (
                <p
                  className={`event-response-message event-response-message--${formMessage.type}`}
                  role="status"
                >
                  {formMessage.text}
                </p>
              )}

              <button
                type="button"
                className="event-response-submit"
                disabled={!canSubmit}
                onClick={sendResponse}
              >
                {isLoading ? (
                  <>
                    <span
                      className="event-response-submit-spinner"
                      aria-hidden="true"
                    />
                    Sending
                  </>
                ) : (
                  "Reply"
                )}
              </button>
              <p className="event-response-footnote">
                You can change your reply until the event starts
              </p>

              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                size="invisible"
              />
            </div>
          </div>

          {hostName && (
            <p className="event-response-sent-by">
              This invite was sent to you by {hostName} through Eventful
            </p>
          )}
        </div>
      </main>
    </>
  );
}
