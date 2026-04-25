"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Template() {
  return (
    <div className="flex flex-col min-h-screen bg-[--primary]">
      <Header />
      <main className="flex flex-grow flex-col p-10 md:p-20"></main>
      <Footer />
    </div>
  );
}
