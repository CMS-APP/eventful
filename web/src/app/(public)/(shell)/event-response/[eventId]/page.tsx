import type { Metadata } from "next";

import { checkEventLink } from "@/services/firebase/firebaseFunctions";

import EventResponseClient from "./EventResponseClient";

export async function generateMetadata({
  params
}: {
  params: Promise<{ eventId: string }>;
}): Promise<Metadata> {
  const { eventId } = await params;
  const data = await checkEventLink(eventId);

  const eventName = (data?.eventName as string | undefined) || "an event";
  const hostName = data?.hostName as string | undefined;

  const title = `You're invited to ${eventName}`;
  const description = hostName
    ? `${hostName} invited you to an event on Eventful. Tap to RSVP.`
    : "You've been invited to an event on Eventful. Tap to RSVP.";

  const images = [{ url: "/og-image.png", width: 1200, height: 630 }];

  return {
    title,
    description,
    openGraph: { title, description, images },
    twitter: { card: "summary_large_image", title, description, images }
  };
}

export default async function EventResponsePage({
  params
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <EventResponseClient eventId={eventId} />;
}
