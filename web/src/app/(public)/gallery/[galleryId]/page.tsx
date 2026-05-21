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
      <main className="flex flex-1 items-center justify-center p-5 md:p-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-poppins">Loading gallery...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center p-5 md:p-10">
        <div className="text-center">
          <p className="text-white font-poppins mb-4">{error}</p>
          <Link href="/" className="text-[#FEBA12] hover:underline">
            Return to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="flex flex-1 py-5 md:py-10">
        <div className="">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-poppins-bold text-white mb-4">
              Event Gallery
            </h1>
            {galleryStats && (
              <div className="flex justify-center items-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faImages} className="text-[#FEBA12]" />
                  <span>{galleryStats.imageCount} photos</span>
                </div>
                {galleryStats.totalSize > 0 && (
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="text-[#FEBA12]"
                    />
                    <span>
                      {(galleryStats.totalSize / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                )}

                <div
                  className="flex justify-center items-center gap-4 text-white cursor-pointer"
                  onClick={() => downloadAllImages(galleryImages)}
                >
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faDownload}
                      className="text-[#FEBA12]"
                    />
                    <span>Download All</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {galleryImages.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon
                icon={faImages}
                className="text-6xl text-white/50 mb-4"
              />
              <p className="text-white font-poppins text-lg">
                No photos in this gallery yet
              </p>
              <p className="text-white/70 font-poppins text-sm mt-2">
                Photos will appear here once they are uploaded
              </p>
            </div>
          ) : (
            <div className="flex flex-row gap-5 items-start">
              {selectedImage && (
                <div className="hidden md:flex lg:flex xl:flex relative group w-1/3">
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
                className={`pr-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 ${selectedImage ? "w-2/3 sm:w-full sm:pl-5" : "pl-5 w-full"}`}
              >
                {galleryImages.map((image, index) => (
                  <GalleryImageView
                    key={index}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FEBA12] mx-auto mb-4"></div>
              <h3 className="text-lg font-poppins-bold text-gray-800 mb-2">
                Creating Gallery Zip
              </h3>
              <p className="text-gray-600 font-poppins mb-4">
                Adding images to zip file...
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-[#FEBA12] h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>

              <p className="text-sm text-gray-500 font-poppins">
                {Math.round(downloadProgress)}% complete
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
