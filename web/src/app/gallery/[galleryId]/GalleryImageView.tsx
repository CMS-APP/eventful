import { faDownload, faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { GalleryImage } from "./page";

export default function GalleryImageView({
  url,
  name,
  index,
  downloadingImage,
  setDownloadingImage,
  setSelectedImage,
}: {
  url: string;
  name: string;
  index: number;
  downloadingImage: string | null;
  setDownloadingImage: (image: string | null) => void;
  setSelectedImage: (image: GalleryImage | null) => void;
}) {
  async function downloadImage(image: GalleryImage) {
    try {
      console.log("Downloading image:", image.name);
      setDownloadingImage(image.name);

      // Use the API route to download the image (avoids CORS issues)
      const downloadUrl = `/api/download-image?url=${encodeURIComponent(image.url)}&fileName=${encodeURIComponent(image.name)}`;

      // Create a download link
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = image.name;

      // Trigger download
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

  return (
    <div
      key={index}
      className="relative group cursor-pointer"
      onClick={() => setSelectedImage({ url, name, fullPath: "", size: 0 })}
    >
      <Image
        src={url}
        alt={`Gallery image ${index + 1}`}
        width={1200}
        height={800}
        className="w-full h-auto rounded-lg shadow-lg transition-transform duration-200 pointer-events-none select-none"
        loading="lazy"
        draggable={false}
        unoptimized
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-lg"></div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => downloadImage({ url, name, fullPath: "", size: 0 })}
          disabled={downloadingImage === name}
          className="bg-[#FEBA12] hover:bg-[#FEBA12]/90 disabled:bg-[#FEBA12]/50 text-black font-poppins-bold p-2 rounded-lg transition-colors duration-200 shadow-lg"
          title="Download image"
        >
          {downloadingImage === name ? (
            <FontAwesomeIcon icon={faImage} className="animate-spin w-4 h-4" />
          ) : (
            <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Image Info */}
      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-black/70 text-white text-xs font-poppins px-2 py-1 rounded">
          {name}
        </div>
      </div>
    </div>
  );
}
