import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./design-system.css";
import "./globals.css";

const poppinsBold = localFont({
  src: "./fonts/Poppins-Bold.ttf",
  variable: "--font-poppins-bold",
  weight: "700",
});

const poppinsMedium = localFont({
  src: "./fonts/Poppins-Medium.ttf",
  variable: "--font-poppins-medium",
  weight: "500",
});

const poppinsRegular = localFont({
  src: "./fonts/Poppins-Regular.ttf",
  variable: "--font-poppins-regular",
  weight: "300",
});

const chloeRegular = localFont({
  src: "./fonts/Chloe-Regular.otf",
  variable: "--font-chloe-regular",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Eventful | The Ultimate Event Planner",
  description: "Plan with Ease, Connect with Joy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppinsBold.variable} ${poppinsMedium.variable} ${poppinsRegular.variable} ${chloeRegular.variable} antialiased`}
      >
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
