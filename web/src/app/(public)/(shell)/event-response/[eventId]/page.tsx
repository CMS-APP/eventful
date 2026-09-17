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
    ? `${hostName} invited you on Eventful. RSVP and get the app to see the full guest list.`
    : "You've been invited on Eventful. RSVP and get the app to see the full guest list.";

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description }
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
