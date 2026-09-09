"use client";

import {
  faCamera,
  faDownload,
  faImages,
  faLink
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import JSZip from "jszip";
import Link from "next/link";

import { useEffect, useState } from "react";

import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { getGalleryImages } from "@/services/FirebaseFunctions";

import GalleryImageView from "./GalleryImageView";
import "./page.css";

export interface GalleryImage {
  name: string;
  url: string;
  fullPath: string;
  size: number;
  timeCreated: string | null;
}

interface GalleryInfo {
  eventTitle: string;
  date: string | null;
  hostName: string | null;
}

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date)
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    })
    .toUpperCase();
}

export default function Gallery() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryInfo, setGalleryInfo] = useState<GalleryInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingImage, setDownloadingImage] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const urlPath = window.location.pathname;
    const parts = urlPath.split("/");
    const galleryId = parts[parts.length - 1];
    const idList = galleryId.split("=");

    if (idList.length !== 2) {
      console.log("Invalid gallery link");
      setError("Invalid gallery link format");
      setIsLoading(false);
      return;
    }

    const extractedUserId = idList[0];
    const extractedEventId = idList[1];

    getGallery(extractedUserId, extractedEventId);
  }, []);

  async function getGallery(userId: string, eventId: string) {
    try {
      setIsLoading(true);
      setError(null);

      const [images, info] = await Promise.all([
        getGalleryImages(userId, eventId),
        fetchGalleryInfo(userId, eventId)
      ]);

      setGalleryImages(images);
      setGalleryInfo(info);

      console.log("Gallery loaded successfully:", images);
    } catch (error) {
      console.error("Error loading gallery:", error);
      setError("Failed to load gallery images");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchGalleryInfo(
    userId: string,
    eventHash: string
  ): Promise<GalleryInfo | null> {
    try {
      const response = await fetch(
        `https://api.eventfulapp.com/galleryInfo?userId=${encodeURIComponent(userId)}&eventHash=${encodeURIComponent(eventHash)}`
      );

      if (!response.ok) return null;

      return await response.json();
    } catch (error) {
      console.error("Error loading gallery info:", error);
      return null;
    }
  }

  async function downloadAllImages(images: GalleryImage[]) {
    console.log("Downloading all images:", images);
    setIsDownloadingAll(true);
    setDownloadProgress(0);

    const zip = new JSZip();
    const totalImages = images.length;
    const BATCH_SIZE = 6;
    let completed = 0;

    for (let i = 0; i < images.length; i += BATCH_SIZE) {
      const batch = images.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (image) => {
          const response = await fetch(image.url);
          const blob = await response.blob();
          zip.file(image.name, blob);

          completed += 1;
          setDownloadProgress((completed / totalImages) * 100);
        })
      );
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gallery.zip";
    a.click();

    URL.revokeObjectURL(url);
    setIsDownloadingAll(false);
    setDownloadProgress(0);
  }

  async function shareGallery() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Gallery link copied to clipboard");
    } catch {
      alert("Failed to copy gallery link");
    }
  }

  if (isLoading) {
    return <Loading message="Loading gallery..." />;
  }

  if (error) {
    return (
      <main className="gallery-page">
        <div className="gallery-page-error">
          <p className="mb-4">{error}</p>
          <Link href="/" className="text-[#FEBA12] hover:underline">
            Return to Home
          </Link>
        </div>
      </main>
    );
  }

  const hasImages = galleryImages.length > 0;
  const formattedDate = formatDate(galleryInfo?.date ?? null);

  return (
    <>
      {isDownloadingAll && (
        <Loading
          message={`Creating gallery zip… ${Math.round(downloadProgress)}%`}
        />
      )}
      <main className="gallery-page">
        <div className="gallery-page-banner">
          <div className="gallery-page-banner-inner">
            <div className="gallery-page-badge">
              <FontAwesomeIcon icon={faCamera} />
              <span>Photo Booth Gallery</span>
            </div>

            <div className="gallery-page-heading-row">
              <div className="gallery-page-heading-text">
                <h1 className="gallery-page-title">
                  {galleryInfo?.eventTitle || "Event Gallery"}
                </h1>
                <div className="gallery-page-meta">
                  {[
                    formattedDate,
                    galleryInfo?.hostName &&
                      `HOSTED BY ${galleryInfo.hostName.toUpperCase()}`,
                    `${galleryImages.length} ${galleryImages.length === 1 ? "PHOTO" : "PHOTOS"}`
                  ]
                    .filter(Boolean)
                    .map((item, index, all) => (
                      <span key={item}>
                        {item}
                        {index < all.length - 1 && (
                          <span className="gallery-page-meta-dot">·</span>
                        )}
                      </span>
                    ))}
                </div>
              </div>

              <div className="gallery-page-actions">
                <Button
                  variant="secondary"
                  icon={faDownload}
                  disabled={!hasImages}
                  loading={isDownloadingAll}
                  className="gallery-page-button"
                  onClick={() => downloadAllImages(galleryImages)}
                >
                  Download All
                </Button>
                <Button
                  variant="muted"
                  icon={faLink}
                  className="gallery-page-button"
                  onClick={shareGallery}
                >
                  Share Gallery
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="gallery-page-content">
          {!hasImages ? (
            <div className="gallery-page-empty">
              <FontAwesomeIcon
                icon={faImages}
                className="gallery-page-empty-icon"
              />
              <p className="gallery-page-empty-title">
                No photos in this gallery yet
              </p>
              <p className="gallery-page-empty-subtitle">
                Photos will appear here once they are uploaded
              </p>
            </div>
          ) : (
            <div className="gallery-page-grid">
              {galleryImages.map((image, index) => (
                <GalleryImageView
                  key={image.fullPath}
                  url={image.url}
                  name={image.name}
                  timeCreated={image.timeCreated}
                  index={index}
                  downloadingImage={downloadingImage}
                  setDownloadingImage={setDownloadingImage}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
