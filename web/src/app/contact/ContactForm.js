"use client";

import { useState } from "react";
import StyledBigButton from "@/components/StyledBigButton";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");


  function handleNameChange(event) {
    setName(event.target.value);
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handleMessageChange(event) {
    setMessage(event.target.value);
  }

  async function onSubmit() {
    console.log({ name, email, message });

    if (!name || !email || !message) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      console.log("Submitting form data to server...");
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({ name, email, message }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      } else {
        const data = await res.json();
        console.log("Response from server:", data);
        alert("Message sent successfully!");
        setName("");
        setEmail("");
        setMessage("");
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      alert("Failed to send message. Please try again later.");
    }
  }

  return (
    <div className="form" style={{ gap: "30px", marginTop: "0px" }}>
      <div
        style={{ display: "flex", flexDirection: "column", gap: "5px" }}
      >
        <p style={{}}>Name</p>
        <input
          style={{
            background: "transparent",
            fontFamily: "var(--font-poppins-medium)",
            color: "white",
            fontSize: 14
          }}
          value={name}
          onChange={handleNameChange}
        />
        <div
          style={{ height: 2, width: "100%", backgroundColor: "white" }}
        />
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: "5px" }}
      >
        <p>Email</p>
        <input
          style={{
            background: "transparent",
            fontFamily: "var(--font-poppins-medium)",
            color: "white",
            fontSize: 14
          }}
          value={email}
          onChange={handleEmailChange}
        />
        <div
          style={{ height: 2, width: "100%", backgroundColor: "white" }}
        />
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: "5px" }}
      >
        <p style={{}}>Message</p>
        <textarea
          style={{
            background: "transparent",
            fontFamily: "var(--font-poppins-medium)",
            color: "white",
            fontSize: 14,
            height: 100
          }}
          value={message}
          onChange={(event) => {
            handleMessageChange(event);
          }}
        />
        <div
          style={{ height: 2, width: "100%", backgroundColor: "white" }}
        />
      </div>

      <div style={{ margin: "25px 25px 25px 25px" }}>
        <StyledBigButton
          text="Send"
          color={"var(--secondary)"}
          hoverColor={"var(--secondaryTint)"}
          onClickAction={() => {
            onSubmit();
          }}
        />
      </div>
    </div>
  )
}