"use client";

import {
  faDownload,
  faImage,
  faImages
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import JSZip from "jszip";
import Link from "next/link";

import { useEffect, useState } from "react";

import Loading from "@/components/Loading";
import { getGalleryImages } from "@/services/FirebaseFunctions";

import GalleryImageView from "./GalleryImageView";
import "./page.css";

export interface GalleryImage {
  name: string;
  url: string;
  fullPath: string;
  size: number;
}

interface GalleryStats {
  imageCount: number;
  totalSize: number;
  hasImages: boolean;
}

export default function Gallery() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryStats, setGalleryStats] = useState<GalleryStats | null>(null);
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

      const images = await getGalleryImages(userId, eventId);
      setGalleryImages(images);

      const totalSize = images.reduce(
        (sum: number, image: GalleryImage) => sum + (image.size || 0),
        0
      );
      setGalleryStats({
        imageCount: images.length,
        totalSize,
        hasImages: images.length > 0
      });

      console.log("Gallery loaded successfully:", images);
    } catch (error) {
      console.error("Error loading gallery:", error);
      setError("Failed to load gallery images");
    } finally {
      setIsLoading(false);
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
          const apiUrl = `/api/download-image?url=${encodeURIComponent(image.url)}&fileName=${encodeURIComponent(image.name)}`;
          const response = await fetch(apiUrl);
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

  return (
    <>
      {isDownloadingAll && (
        <Loading
          message={`Creating gallery zip… ${Math.round(downloadProgress)}%`}
        />
      )}
      <main className="gallery-page">
        <div className="gallery-page-inner">
          <header className="gallery-page-header">
            <h1 className="gallery-page-title">Event Gallery</h1>
            {galleryStats && (
              <div className="gallery-page-stats">
                <div className="gallery-page-stat">
                  <FontAwesomeIcon
                    icon={faImages}
                    className="gallery-page-stat-icon"
                  />
                  <span>{galleryStats.imageCount} photos</span>
                </div>
                {galleryStats.totalSize > 0 && (
                  <div className="gallery-page-stat">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="gallery-page-stat-icon"
                    />
                    <span>
                      {(galleryStats.totalSize / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  className="gallery-page-download"
                  disabled={!hasImages || isDownloadingAll}
                  onClick={() => downloadAllImages(galleryImages)}
                >
                  <FontAwesomeIcon
                    icon={faDownload}
                    className="gallery-page-stat-icon"
                  />
                  <span>Download All</span>
                </button>
              </div>
            )}
          </header>

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
