"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons/faExclamationTriangle";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StyledButton from "@/components/StyledButton";

export default function Custom404() {
  return (
    <div className="flex flex-col min-h-screen bg-[--primary]">
      <Header />
      <main className="flex flex-grow flex-col p-10 md:p-20 text-white items-center gap-5">
        <div
          className="flex flex-row justify-center items-center gap-5"
        >
          <div className="spacer" />
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            width={75}
            height={75}
            className="text-white text-[75px]"
          />
          <h1>Error 404</h1>
          <div className="spacer" />
        </div>
        <h3 className="text-center">Whoops! The page you are looking for doesn&apos;t exist.</h3>

        <StyledButton
          color="var(--secondary)"
          hoverColor="var(--secondaryTint)"
          text="Go Back To Home"
          onClickAction={() => (window.location = "/")}
        />
      </main>

      <Footer />
    </div>
  );
}
