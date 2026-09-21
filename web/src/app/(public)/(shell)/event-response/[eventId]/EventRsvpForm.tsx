"use client";

import {
  faCheck,
  faClock,
  faPaperPlane,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReCAPTCHA from "react-google-recaptcha";

import { useRef, useState } from "react";

import Button from "@/components/Button";
import TextInput from "@/components/TextInput";
import { BACKEND_URL } from "@/lib/backendUrl";

const RECAPTCHA_SITE_KEY = "6LfDpgQrAAAAAO0TSbcQban4TrA16CjelRzF_Urp";

const RESPONSES = [
  { key: "Accept", label: "Accept", icon: faCheck, modifier: "accept" },
  { key: "Maybe", label: "Maybe", icon: faClock, modifier: "maybe" },
  { key: "Decline", label: "Decline", icon: faXmark, modifier: "decline" }
] as const;

interface EventRsvpFormProps {
  eventId: string;
  hostId: string;
  eventName: string;
  hostFirstName: string;
  onResponded: () => void;
}

export default function EventRsvpForm({
  eventId,
  hostId,
  eventName,
  hostFirstName,
  onResponded
}: EventRsvpFormProps) {
  const [response, setResponse] = useState<null | string>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  function handleResponse(type: string) {
    setResponse((current) => (current === type ? null : type));
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
      const res = await fetch(`${BACKEND_URL}/respondToEvent`, {
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
      });

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
      onResponded();
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

  const canSubmit = !!response && !!name;

  return (
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

      <div className="event-response-fields">
        <TextInput
          id="rsvp-name"
          label="Name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <TextInput
          id="rsvp-email"
          label={
            <>
              Email{" "}
              <span className="event-response-optional">optional</span>
            </>
          }
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {formMessage && (
        <p
          className={`event-response-message event-response-message--${formMessage.type}`}
          role="status"
        >
          {formMessage.text}
        </p>
      )}

      <Button
        variant="primary"
        disabled={!canSubmit}
        loading={isLoading}
        icon={faPaperPlane}
        onClick={sendResponse}
      >
        {isLoading ? "Sending" : "Reply"}
      </Button>
      <p className="event-response-footnote">
        You can change your reply until the event starts
      </p>

      <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} size="invisible" />
    </div>
  );
}
