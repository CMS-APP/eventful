"use client";

import Loading from "@/components/Loading";
import StyledButton from "@/components/StyledButton";
import StyledButtonFlex from "@/components/StyledButtonFlex";
import { checkEventLink } from "@/services/FirebaseFunctions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";

import ReCAPTCHA from "react-google-recaptcha";

import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faCalendar,
  faLocationArrow,
  faLocationPin,
  faShirt,
  faTag,
  faUser,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

import "./page.css";

const RECAPTCHA_SITE_KEY = "6LfDpgQrAAAAAO0TSbcQban4TrA16CjelRzF_Urp";

export default function EventResponse() {
  const [response, setResponse] = useState<null | string>(null);
  const [hostId, setHostId] = useState<string>("");
  const [eventId, setEventId] = useState<string>("");
  const [hostName, setHostName] = useState<string>("");
  const [eventName, setEventName] = useState<string>("");
  const [eventTheme, setEventTheme] = useState<string>("");
  const [eventAddress, setEventAddress] = useState<string>("");
  const [eventDirections, setEventDirections] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResponse = (type: string) => {
    if (response === type) {
      setResponse(null);
      return;
    }
    setResponse(type);
  };

  function convertDate(dateString: { seconds: number }) {
    const date = new Date(dateString.seconds * 1000);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  }

  async function sendResponse() {
    if (isLoading) return; // Prevent multiple submits
    setIsLoading(true);

    const nameInput = document.querySelector(
      'input[type="text"]',
    ) as HTMLInputElement;
    const emailInput = document.querySelector(
      'input[type="email"]',
    ) as HTMLInputElement;

    const name = nameInput.value;
    const email = emailInput.value;

    if (!name) {
      alert("Please enter your name.");
      setIsLoading(false);
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email.");
      setIsLoading(false);
      return;
    }

    if (!response) {
      alert("Please select a response.");
      setIsLoading(false);
      return;
    }

    if (!recaptchaRef.current) {
      setIsLoading(false);
      return;
    }

    const recaptchaToken = await recaptchaRef.current.executeAsync();
    if (!recaptchaToken) {
      alert("reCAPTCHA failed.");
      setIsLoading(false);
      return;
    }

    const deviceId = getOrCreateDeviceId();

    try {
      const res = await fetch("https://respondtoevent-iuxeocrkta-uc.a.run.app", {
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
          deviceId,
        }),
      });

      const data = await res.text();
      if (!res.ok) {
        if (res.status === 429) {
          console.log(data);
        } else {
          alert("Error: " + data);
        }
        return;
      }

      alert(data);
      nameInput.value = "";
      emailInput.value = "";
      setResponse(null);
    } catch (error) {
      console.error("Error sending response:", error);
      if (recaptchaRef.current) recaptchaRef.current.reset();
      alert("Error: " + error);
    }

    setIsLoading(false);
  }

  function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = crypto.randomUUID(); // Generate a new UUID
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  }

  useEffect(() => {
    async function checkLink(eventId: string) {
      const data = await checkEventLink(eventId);

      if (!data) {
        console.warn("Invalid event link");
      }

      if (data) {
        setHostId(data.userId);
        setEventId(eventId);
        setHostName(data.hostName);
        setEventName(data.eventName);
        setEventTheme(data.theme);
        setEventDate(convertDate(data.dateTime));
        setEventAddress(data.address);
        setEventDirections(data.directions);
      }
    }

    console.log("Checking event link...");
    const urlPath = window.location.pathname;
    const parts = urlPath.split("/");
    const eventId = parts[parts.length - 1];

    if (eventId) {
      checkLink(eventId);
    }
  }, []);

  function infoRow(title: string, value: string, icon: IconProp) {
    if (!value) return null;

    return (
      <div className="event-response-info-row">
        <p className="event-response-info-label">
          <FontAwesomeIcon icon={icon} className="event-response-info-icon" />
          {title}
        </p>
        <p className="event-response-info-value">{value}</p>
      </div>
    );
  }

  return (
    <>
      {isLoading && <Loading message="Sending..." />}
      <main className="event-response-page">
      <div className="event-response-page-inner">
        <div className="event-response-card-outer">
          <div className="event-response-card">
            <p className="event-response-invite-label">You&apos;re invited</p>
            <form className="event-response-form">
              {infoRow("Host:", hostName, faUser)}
              {infoRow("Event:", eventName, faTag)}
              {infoRow("Date:", eventDate, faCalendar)}
              {infoRow("Theme:", eventTheme, faShirt)}
              {infoRow("Location:", eventAddress, faLocationPin)}
              {infoRow("Directions:", eventDirections, faLocationArrow)}

              <p className="event-response-info-label">
                <FontAwesomeIcon
                  icon={faUserGroup}
                  className="event-response-info-icon"
                />
                To see who&apos;s going —{" "}
                <Link href="/" className="event-response-app-link">
                  Download the app!
                </Link>
              </p>

              <div className="event-response-divider" />

              <p className="event-response-section-label">RSVP</p>

              <p className="event-response-field-label">Name</p>
              <input
                type="text"
                className="event-response-input"
                placeholder="Enter your name"
                required
              />
              <p className="event-response-field-label">Email (optional)</p>
              <input
                type="email"
                className="event-response-input"
                placeholder="Enter your email"
              />

              <div className="event-response-rsvp-buttons">
                <StyledButtonFlex
                  color="#6E9975"
                  hoverColor="#5E8263"
                  text="Accept"
                  onClickAction={() => handleResponse("Accept")}
                  selected={response === "Accept"}
                />
                <StyledButtonFlex
                  color="#FEBA12"
                  hoverColor="#E4A710"
                  text="Maybe"
                  onClickAction={() => handleResponse("Maybe")}
                  selected={response === "Maybe"}
                />
                <StyledButtonFlex
                  color="#66101F"
                  hoverColor="#550E1B"
                  text="Decline"
                  onClickAction={() => handleResponse("Decline")}
                  selected={response === "Decline"}
                />
              </div>

              {response && (
                <div>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    size="invisible"
                  />
                  <StyledButton
                    color="var(--primary)"
                    hoverColor="var(--primaryTint)"
                    text="Submit"
                    onClickAction={sendResponse}
                  />
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
