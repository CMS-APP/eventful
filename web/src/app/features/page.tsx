"use client";

import FeatureItem from "@/components/FeatureItem";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { isMobileDevice } from "@/functions/IsMobileDevice.js";
import { useEffect, useState } from "react";

export default function About() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDevice = () => setIsMobile(isMobileDevice());

    checkDevice(); // Run once on mount
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-grow bg-[var(--primary)] p-10">
        <div className="flex flex-col flex-[3] items-center w-full gap-4">
          <div className="flex flex-row w-full">
            <h1 className="flex-1 text-left ml-[25px]">Features</h1>
            <div className={`hidden ${isMobile ? "" : "md:flex"} flex-1`} />
          </div>

          <div
            className={`grid grid-cols-2 grid ${isMobile ? "" : "md:flex md:flex-row"} justify-center gap-4 w-full`}
          >
            <FeatureItem
              description="Keep Track of RSVP's"
              image={"/feature-pics/invite-icon.png"}
            />
            <FeatureItem
              description="Food & Drinks Plan"
              image={"/feature-pics/food-icon.png"}
            />
            <FeatureItem
              description="Dress Code & Outfit Ideas"
              image={"/feature-pics/outfit-icon.png"}
            />
            <FeatureItem
              description="Shopping List"
              image={"/feature-pics/shopping-icon.png"}
            />
          </div>

          <div
            className={`grid grid-cols-2 ${isMobile ? "grid" : "md:flex md:flex-row"} justify-center gap-4 w-full`}
          >
            <FeatureItem
              description="Decor Plan"
              image={"/feature-pics/decor-icon.png"}
            />
            <FeatureItem
              description="Connect Your Playlist"
              image={"/feature-pics/music-icon.png"}
            />
            <FeatureItem
              description="See Your Upcoming Events"
              image={"/feature-pics/calendar-icon.png"}
            />
            <FeatureItem
              description="Event Countdown"
              image={"/feature-pics/countdown-icon.png"}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
