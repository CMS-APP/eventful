"use client";

import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useEffect, useState } from "react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import StyledBigButton from "@/components/StyledBigButton";
import { isMobileDevice } from "@/functions/IsMobileDevice.js";

export default function About() {
  const [isMobile, setIsMobile] = useState(false);
  const linkedinLink = "https://www.linkedin.com/in/harriet-parsons-8b8b8b8b/";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDevice = () => setIsMobile(isMobileDevice());

    checkDevice(); // Run once on mount
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--primary)]">
      <Header />
      <main className="flex flex-grow flex-col p-10 text-white">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div style={{ flex: 1 }}>
            <h1>About Eventful</h1>
            <p>
              Eventful is the ultimate event planning app that brings joy and
              ease to your gatherings. We believe that the best memories are
              made when people come together, and we&apos;re here to make that
              happen.
            </p>
            <p>
              Our app helps you stay organised with to-do lists, shopping lists,
              outfit planning, playlists, decorations, and more. We&apos;re
              passionate about creating meaningful connections and making event
              planning a breeze.
            </p>
            <div className="mt-5">
              <StyledBigButton
                text="Learn More"
                color="var(--secondary)"
                hoverColor="var(--secondaryTint)"
                onClickAction={() => {
                  window.location.href = "/about/faq";
                }}
              />
            </div>
          </div>

          <div
            className={`${isMobile ? "hidden" : "flex"} flex-1 justify-center items-center gap-[20px]`}
          >
            <div className={`${isMobile ? "hidden" : "flex"}`}>
              <Image
                className={`${isMobile ? "hidden" : "flex"}`}
                src={"/about-us-pics/girls-celebrating.JPG"}
                alt="about"
                width={400}
                height={400}
                style={{ borderRadius: "25px" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <Image
                className={`${isMobile ? "hidden" : "flex"}`}
                src={"/about-us-pics/glitter-pic.JPG"}
                alt="about"
                width={200}
                height={400}
                style={{ borderRadius: "25px" }}
              />
              <Image
                className={`${isMobile ? "hidden" : "flex"}`}
                src={"/about-us-pics/girl-blowing-glitter.JPG"}
                alt="about"
                width={250}
                height={400}
                style={{ borderRadius: "25px" }}
              />
            </div>
          </div>
        </div>

        <h1 className="my-10">Meet The Team</h1>

        <div
          className={`flex flex-col ${isMobile ? "flex-col" : "md:flex-row"} pb-10 md:pb-50 gap-10 items-center`}
        >
          <Image
            src="/about-us-pics/harriet-pic.JPG"
            alt="team"
            width={400}
            height={400}
            style={{ borderRadius: "25px" }}
          />
          <div style={{ flex: 1 }}>
            <h3 style={{ color: "var(--secondary)" }}>CO-FOUNDER</h3>
            <h3>Harriet Parsons</h3>
            <p>
              Inspired by the increasing shift to digital interactions, I saw an
              opportunity to rebuild what makes connections truly meaningful;
              face-to-face moments. With a creative edge and a strong marketing
              foundation, I&apos;m passionate about designing solutions that
              bring people together in authentic and impactful ways.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                flexDirection: "row",
                marginTop: "10px",
                alignItems: "center",
              }}
            >
              <a href={linkedinLink}>
                <FontAwesomeIcon
                  icon={faLinkedin}
                  style={{
                    color: "white",
                    height: "25px",
                    marginRight: "20px",
                  }}
                />
              </a>
              <h3>-</h3>
              <p style={{ marginLeft: "20px" }}> Let&apos;s Connect</p>
            </div>
          </div>
        </div>

        <div
          className={`flex flex-col-reverse ${isMobile ? "flex-col-reverse" : "md:flex-row"} pb-10 md:pb-50 gap-10 items-center bg-[#6d9975] rounded-[25px] p-10`}
        >
          <div style={{ flex: 1, alignItems: "flex-start" }}>
            <h3 style={{ color: "var(--secondary)" }}>CO-FOUNDER</h3>
            <h3>Chris Sharp</h3>
            <p>
              Eventful does not just represent a business, but a shift in how we
              approach social connections in the digital age. With a background
              in software development and a passion for creating meaningful
              experiences, I&apos;m dedicated to building technology that brings
              people together in authentic ways.
            </p>
          </div>
          <Image
            src="/about-us-pics/chris-pic.jpg"
            alt="team"
            width={400}
            height={400}
            style={{ borderRadius: "25px" }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
