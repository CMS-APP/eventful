"use client";
import Image from "next/image.js";
import { useEffect, useState } from "react";

import DownloadButton from "@/components/DownloadButton.js";
import Footer from "@/components/Footer.js";
import GoogleAnalytics from "@/components/GoogleAnalytics.js";
import Header from "@/components/Header.js";
import StatsView from "@/components/StatsView.js";
import { isMobileDevice } from "@/functions/IsMobileDevice.js";

export default function Index() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return; // Ensure it's client-side only

    const checkDevice = () => setIsMobile(isMobileDevice());

    checkDevice(); // Run once on mount
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return (
    <div
      className={`flex flex-col min-h-screen bg-[var(--primary)] transition-all duration-300 ${
        !isMobile ? "bg-cover bg-center" : ""
      }`}
      style={!isMobile ? { backgroundImage: "url(/background.png)" } : {}}
    >
      <Header main={true} />
      <GoogleAnalytics />

      <main
        className={`flex flex-row flex-grow ${isMobile ? "" : "md:m-20"} m-10 gap-5`}
      >
        <div
          className={`flex hidden ${isMobile ? "hidden" : "w-[30%] hidden md:flex"} justify-center items-center ml-10`}
        >
          <Image
            src="/screenshot.png"
            alt="screenshot"
            width={250}
            height={250}
            className="rounded-2xl drop-shadow-xl"
          />
        </div>

        <div
          className={`flex flex-col ${isMobile ? "w-full" : "md:justify-center md:w-[40%]"} items-start  text-white`}
        >
          <h1>Plan with Ease,</h1>
          <h1 className="mb-2">Connect with Joy.</h1>

          <p className="pb-2 w-max-[400px]">
            The ultimate event planning app that brings joy and ease to your
            gatherings. Stay organised with to-do lists, shopping lists, outfit
            planning, playlists, decorations, and more.
          </p>

          <div
            className={`flex flex-col gap-4 mt-2 mb-5 w-full ${isMobile ? "" : "md:w-max-[400px]"} w-full`}
          >
            <DownloadButton type={"ios"} />
            <DownloadButton type={"android"} />
          </div>

          <StatsView />
        </div>

        <div className="w-[0%]" />

        {/* Right-side spacing */}
      </main>

      <Footer main={true} />
    </div>
  );
}
