import type { Metadata } from "next";

import { fetchGalleryInfo, parseGalleryId } from "@/features/gallery/api";

import GalleryClient from "./GalleryClient";

export async function generateMetadata({
  params
}: {
  params: Promise<{ galleryId: string }>;
}): Promise<Metadata> {
  const { galleryId } = await params;
  const parsed = parseGalleryId(galleryId);

  const info = parsed
    ? await fetchGalleryInfo(parsed.userId, parsed.eventId)
    : null;

  const title = info?.eventTitle
    ? `${info.eventTitle} — Photo Gallery`
    : "Event Photo Gallery";
  const description = info?.hostName
    ? `See photos from ${info.hostName}'s event, shared via Eventful.`
    : "See event photos shared via Eventful.";

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description }
  };
}

export default async function GalleryPage({
  params
}: {
  params: Promise<{ galleryId: string }>;
}) {
  const { galleryId } = await params;
  return <GalleryClient galleryId={galleryId} />;
}
