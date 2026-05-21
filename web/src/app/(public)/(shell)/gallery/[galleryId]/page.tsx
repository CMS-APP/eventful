"use client";

import {
  galleryExists,
  getGalleryImages,
  getGalleryStats,
} from "@/services/FirebaseFunctions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

import {
  faDownload,
  faImage,
  faImages,
} from "@fortawesome/free-solid-svg-icons";
import JSZip from "jszip";
import Link from "next/link";
import GalleryImageView from "./GalleryImageView";
import SelectedImageView from "./SelectedImageView";

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
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
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

    // Load gallery data
    getGallery(extractedUserId, extractedEventId);
  }, []);

  async function getGallery(userId: string, eventId: string) {
    try {
      setIsLoading(true);
      setError(null);

      // Check if gallery exists
      const exists = await galleryExists(userId, eventId);

      if (!exists) {
        console.log("Gallery does not exist for this user and event");
        setGalleryImages([]);
        setGalleryStats({ imageCount: 0, totalSize: 0, hasImages: false });
        setIsLoading(false);
        return;
      }

      // Get gallery images
      const images = await getGalleryImages(userId, eventId);
      setGalleryImages(images);

      // Get gallery statistics
      const stats = (await getGalleryStats(userId, eventId)) as GalleryStats;
      setGalleryStats(stats);

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

    // Process images one by one to show progress
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const apiUrl = `/api/download-image?url=${encodeURIComponent(image.url)}&fileName=${encodeURIComponent(image.name)}`;
      const response = await fetch(apiUrl);
      const blob = await response.blob();
      zip.file(image.name, blob);

      // Update progress
      setDownloadProgress(((i + 1) / totalImages) * 100);
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

  function getIndex(name: string) {
    return galleryImages.findIndex((image) => image.name === name);
  }

  if (isLoading) {
    return (
      <main className="gallery-page">
        <div className="gallery-page-loading">
          <div className="gallery-page-spinner" aria-hidden />
          <p>Loading gallery...</p>
        </div>
      </main>
    );
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
            <div className="gallery-page-grid-layout">
              {selectedImage && (
                <div className="gallery-page-preview">
                  <SelectedImageView
                    url={selectedImage.url}
                    name={selectedImage.name}
                    index={getIndex(selectedImage.name)}
                    galleryImages={galleryImages}
                    downloadingImage={downloadingImage}
                    setDownloadingImage={setDownloadingImage}
                    setSelectedImage={setSelectedImage}
                  />
                </div>
              )}

              <div
                className={`gallery-page-grid${selectedImage ? " gallery-page-grid--with-preview" : ""}`}
              >
                {galleryImages.map((image, index) => (
                  <GalleryImageView
                    key={image.fullPath}
                    url={image.url}
                    name={image.name}
                    index={index}
                    downloadingImage={downloadingImage}
                    setDownloadingImage={setDownloadingImage}
                    setSelectedImage={setSelectedImage}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {isDownloadingAll && (
        <div className="gallery-page-overlay">
          <div className="gallery-page-overlay-card">
            <div className="gallery-page-spinner" aria-hidden />
            <h3 className="text-lg font-poppins-bold text-gray-800 mb-2">
              Creating Gallery Zip
            </h3>
            <p className="text-gray-600 font-poppins mb-4">
              Adding images to zip file...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-[#FEBA12] h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 font-poppins">
              {Math.round(downloadProgress)}% complete
            </p>
          </div>
        </div>
      )}
    </>
  );
}
