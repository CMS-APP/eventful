"use client";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function VerifyEmail() {
  return (
    <div className="flex flex-col min-h-screen bg-[--primary]">
      <Header />
      <main className="flex flex-grow flex-col p-10 md:p-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Email Verified!</h1>
          <p className="mt-4 text-lg text-white">
            Your email has been successfully verified. You can now go back to
            the app and start using it.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
