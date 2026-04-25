"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
  faCreditCard,
  faLightbulb,
  faShieldVirus,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import faqData from "./faqData.json";
import FaqHeaderButton from "./FaqHeaderButton";
import FaqQuestion from "./FaqQuestion";
import FaqQuestionItem from "./FaqQuestionItem";

export default function FAQ() {
  const [selectedButton, setSelectedButton] = useState("General");

  return (
    <div className="flex flex-col min-h-screen bg-[--primary]">
      <Header />
      <main className="flex flex-grow flex-col py-20 px-10 md:px-40">
        <h1>FAQ</h1>

        <div className="flex flex-col md:flex-row gap-5 mt-5">
          <div className="hidden md:block bg-[#FEBA12] rounded-lg p-1 w-full">
            <div className="flex flex-row gap-1 justify-between">
              <FaqHeaderButton
                icon={faLightbulb}
                title="General"
                selectedButton={selectedButton}
                setSelectedButton={setSelectedButton}
              />

              <FaqHeaderButton
                icon={faCreditCard}
                title="Payment & Refunds"
                selectedButton={selectedButton}
                setSelectedButton={setSelectedButton}
              />

              <FaqHeaderButton
                icon={faShieldVirus}
                title="Safety & Security"
                selectedButton={selectedButton}
                setSelectedButton={setSelectedButton}
              />

              <FaqHeaderButton
                icon={faUser}
                title="Account & Profile"
                selectedButton={selectedButton}
                setSelectedButton={setSelectedButton}
              />
            </div>
          </div>

          {/* Mobile layout without background */}
          <div className="flex flex-col md:hidden gap-5">
            <FaqHeaderButton
              icon={faLightbulb}
              title="General"
              selectedButton={selectedButton}
              setSelectedButton={setSelectedButton}
            />

            <FaqHeaderButton
              icon={faCreditCard}
              title="Payment & Refunds"
              selectedButton={selectedButton}
              setSelectedButton={setSelectedButton}
            />

            <FaqHeaderButton
              icon={faShieldVirus}
              title="Safety & Security"
              selectedButton={selectedButton}
              setSelectedButton={setSelectedButton}
            />

            <FaqHeaderButton
              icon={faUser}
              title="Account & Profile"
              selectedButton={selectedButton}
              setSelectedButton={setSelectedButton}
            />
          </div>
        </div>

        <div className="flex flex-col gap-5 mt-5">
          {faqData[selectedButton as keyof typeof faqData].map(
            (item: FaqQuestion) => (
              <FaqQuestionItem
                key={item.question}
                question={item.question}
                answer={item.answer}
              />
            ),
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
