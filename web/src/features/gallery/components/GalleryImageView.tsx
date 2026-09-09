import { faDownload, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

import { GalleryImage } from "@/features/gallery/types";

function formatTime(timeCreated: string | null) {
  if (!timeCreated) return "";
  return new Date(timeCreated).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

export default function GalleryImageView({
  url,
  name,
  timeCreated,
  index,
  downloadingImage,
  setDownloadingImage
}: {
  url: string;
  name: string;
  timeCreated: string | null;
  index: number;
  downloadingImage: string | null;
  setDownloadingImage: (image: string | null) => void;
}) {
  async function downloadImage(image: GalleryImage) {
    try {
      setDownloadingImage(image.name);

      const response = await fetch(image.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = image.name;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      alert("Failed to download image. Please try again.");
    } finally {
      setDownloadingImage(null);
    }
  }

  const isDownloading = downloadingImage === name;

  return (
    <div className="gallery-photo-card">
      <div className="gallery-photo-card-image">
        <Image
          src={url}
          alt={`Gallery photo ${index + 1}`}
          width={600}
          height={900}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
          className="gallery-photo-card-img"
          loading="lazy"
          draggable={false}
        />
      </div>

      <div className="gallery-photo-card-footer">
        <div className="gallery-photo-card-meta">
          <span className="gallery-photo-card-time">
            {formatTime(timeCreated)}
          </span>
          <button
            type="button"
            className="gallery-photo-card-download"
            disabled={isDownloading}
            onClick={() =>
              downloadImage({ url, name, fullPath: "", size: 0, timeCreated })
            }
            title="Download photo"
            aria-label="Download photo"
          >
            <FontAwesomeIcon
              icon={isDownloading ? faSpinner : faDownload}
              className={isDownloading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
