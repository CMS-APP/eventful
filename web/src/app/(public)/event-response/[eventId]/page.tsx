"use client";

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

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid name and email.");
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
          email: email.toLowerCase(),
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
    return (
      <div>
        <p className="uppercase font-poppins-bold tracking-widest text-gray-500 mb-2">
          <FontAwesomeIcon icon={icon} className="mr-2 w-5 text-[#6E9975]" />
          {title}
        </p>
        <p className="text-sm uppercase font-poppins tracking-widest text-gray-500 mb-2">
          {value}
        </p>
      </div>
    );
  }

  return (
    <main className="flex flex-1 p-5 md:p-10">
        <div className="flex justify-center">
          <div className="bg-white/80 rounded-3xl p-2 shadow-xl">
            <div className="border-2 border-white rounded-2xl p-6 max-w-3xl w-full mx-auto text-center">
              <p className="text-sm uppercase font-poppins tracking-widest text-gray-500 mb-2 text-center">
                YOU&apos;RE INVITED
              </p>
              <form className="flex flex-col gap-2 w-full text-left font-poppins text-sm">
                {infoRow("Host:", hostName, faUser)}
                {infoRow("Event:", eventName, faTag)}
                {infoRow("Date:", eventDate, faCalendar)}
                {infoRow("Theme:", eventTheme, faShirt)}
                {infoRow("Location:", eventAddress, faLocationPin)}
                {infoRow("Directions:", eventDirections, faLocationArrow)}

                <p className="text-sm uppercase font-poppins tracking-widest text-gray-500 mb-2">
                  <FontAwesomeIcon
                    icon={faUserGroup}
                    className="mr-2 w-5 text-[#6E9975]"
                  />
                  To See Who&apos;s Going -{" "}
                  <Link
                    href={"/"}
                    className="text-[#6E9975] underline hover:text-[#FEBA12] active:text-[#FEBA12]"
                  >
                    Download The App!
                  </Link>
                </p>

                <div className="w-full h-px bg-[#0A3B2E] my-6" />
                <p
                  className="text-sm uppercase font-poppins tracking-widest text-gray-500 mb-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  RSVP
                </p>

                <p className="text-sm uppercase font-poppins tracking-widest text-gray-500 mb-0">
                  NAME:
                </p>
                <input
                  type="text"
                  className="text-black border p-2 rounded-xl mt-0 font-poppins focus:outline-none focus:border-[#FEBA12] focus:ring-1 focus:ring-[#FEBA12]"
                  placeholder="Enter your name"
                  required
                />
                <p className="text-sm uppercase font-poppins tracking-widest text-gray-500 mb-0">
                  EMAIL:
                </p>
                <input
                  type="email"
                  className="text-black border p-2 rounded-xl mt-0 font-poppins focus:outline-none focus:border-[#FEBA12] focus:ring-1 focus:ring-[#FEBA12]"
                  placeholder="Enter your email"
                  required
                />
                <div className="flex flex-col md:flex-row gap-4 my-4 justify-center">
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

                    {isLoading ? (
                      <div className="flex justify-center items-center py-2">
                        <div className="animate-spin h-6 w-6 border-4 border-blue-400 border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <StyledButton
                        color={"var(--primary)"}
                        hoverColor={"var(--primaryTint)"}
                        text={"Submit"}
                        onClickAction={sendResponse}
                      />
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
    </main>
  );
}
