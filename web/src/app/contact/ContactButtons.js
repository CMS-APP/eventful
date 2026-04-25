"use client"

import { faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import './page.css'

export default function ContactButtons() {
  return (
    <div className="flex flex-col flex-1 gap-5 bg-[#6d9975] items-center p-10 rounded-[25px] justify-center">
      <Link className="contact-us-item" href="mailto:help@eventfulapp.com">
        <div className="contact-us-row">
          <FontAwesomeIcon
            icon={faEnvelope}
            color="white"
            size="2x"
            className="contact-us-icon"
          />
          <h1>Email</h1>
        </div>
        <h3 style={{ fontFamily: "var(--font-poppins-bold)" }}>
          help@eventfulapp.com
        </h3>
      </Link>

      <Link
        className="contact-us-item"
        href="https://www.instagram.com/eventfulapp_/"
      >
        <div className="contact-us-row">
          <FontAwesomeIcon
            icon={faInstagram}
            color="white"
            size="2x"
            className="contact-us-icon"
          />
          <h1>Instagram</h1>
        </div>
        <h3>
          @eventfulapp_
        </h3>
      </Link>

      <Link
        className="contact-us-item"
        href="https://www.linkedin.com/company/eventful-app/"
      >
        <div className="contact-us-row">
          <FontAwesomeIcon
            icon={faLinkedin}
            color="white"
            size="2x"
            className="contact-us-icon"
          />
          <h1>LinkedIn</h1>
        </div>
        <h3>
          @eventful.app
        </h3>
      </Link>
    </div>
  )
}