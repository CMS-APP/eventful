import {
  faArrowLeft,
  faArrowRight,
  faDownload
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

import { GalleryImage } from "./page";

export default function SelectedImageView({
  url,
  name,
  index,
  galleryImages,
  setDownloadingImage,
  setSelectedImage
}: {
  url: string;
  name: string;
  index: number;
  galleryImages: GalleryImage[];
  downloadingImage: string | null;
  setDownloadingImage: (image: string | null) => void;
  setSelectedImage: (image: GalleryImage | null) => void;
}) {
  async function downloadImage(image: GalleryImage) {
    try {
      console.log("Downloading image:", image.name);
      setDownloadingImage(image.name);

      const downloadUrl = `/api/download-image?url=${encodeURIComponent(image.url)}&fileName=${encodeURIComponent(image.name)}`;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = image.name;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Downloaded: ${image.name}`);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image. Please try again.");
    } finally {
      setDownloadingImage(null);
    }
  }

  function getNextImage() {
    if (index === galleryImages.length - 1) {
      return null;
    }
    return galleryImages[index + 1];
  }

  function getPreviousImage() {
    if (index === 0) {
      return null;
    }
    return galleryImages[index - 1];
  }

  return (
    <div
      key={index}
      className="bg-[#6e9975] rounded-r-[30px] p-5"
      onClick={() => setSelectedImage({ url, name, fullPath: "", size: 0 })}
    >
      <h1 className="text-white text-center mb-2">Gallery</h1>

      <div className="flex flex-row items-center justify-between w-full gap-3">
        <div
          className="cursor-pointer flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            const previousImage = getPreviousImage();
            if (previousImage) {
              setSelectedImage(previousImage);
            }
          }}
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
            className="w-6 h-6 text-white hover:text-[#FEBA12] transition-colors"
          />
        </div>

        <div className="flex flex-col w-full h-auto bg-[#E9E9E9] p-5 gap-5 rounded-lg">
          <Image
            src={url}
            alt={`Gallery image ${index + 1}`}
            width={1200}
            height={800}
            className="transition-transform duration-200 w-full h-auto object-contain select-none pointer-events-none rounded-lg"
            loading="lazy"
            draggable={false}
            unoptimized
          />

          <div className="flex flex-row items-center gap-5">
            <div
              className="flex flex-row items-center gap-2 cursor-pointer"
              onClick={() =>
                downloadImage({ url, name, fullPath: "", size: 0 })
              }
            >
              <FontAwesomeIcon
                icon={faDownload}
                className="w-5 h-5 text-black"
              />
            </div>
          </div>
        </div>

        <div
          className="cursor-pointer flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            const nextImage = getNextImage();
            if (nextImage) {
              setSelectedImage(nextImage);
            }
          }}
        >
          <FontAwesomeIcon
            icon={faArrowRight}
            className="w-6 h-6 text-white hover:text-[#FEBA12] transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
