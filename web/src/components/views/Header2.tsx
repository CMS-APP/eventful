"use client";

import Image from "next/image";

import { Button } from "../buttons/Button";
import { TextButton } from "../buttons/TextButton";
import "./Header2.css";

export function Header2() {
  return (
    <header className="header-web">
      <div className="header-web-left">
        <Image
          src="/icon.png"
          alt="Eventful Logo"
          className="header-web-image"
          width={50}
          height={50}
          onClick={() => (window.location.href = "/")}
        />
      </div>

      <div className="header-web-items">
        <TextButton
          text="Events"
          onClick={() => (window.location.href = "/events")}
          color="white"
        />
        <TextButton
          text="Contacts"
          onClick={() => (window.location.href = "/contacts")}
          color="white"
        />
        <TextButton
          text="Inspiration"
          onClick={() => (window.location.href = "/inspiration")}
          color="white"
        />
        <TextButton
          text="Gallery"
          onClick={() => (window.location.href = "/gallery")}
          color="white"
        />
        <TextButton
          text="Calendar"
          onClick={() => (window.location.href = "/calendar")}
          color="white"
        />
      </div>

      <div className="header-web-buttons">
        <TextButton
          text="Sign Up"
          onClick={() => (window.location.href = "/sign-up")}
          color="white"
        />
        <Button
          text="Sign In"
          onClick={() => (window.location.href = "/sign-in")}
          type="secondary"
          circular
        />
      </div>
    </header>
  );
}
