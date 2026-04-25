import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import the FontAwesomeIcon component
import { faApple, faGoogle } from "@fortawesome/free-brands-svg-icons"; // Import the specific icon

import "./DownloadButton.css";

export default function DownloadButton({ type }) {
  const text = type === "ios" ? "App Store" : "Google Play";
  const iconName = type === "ios" ? faApple : faGoogle;
  const appleLink =
    "https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=6449842590";
  const googleLink =
    "https://play.google.com/store/apps/details?id=com.hostinghappily.app";

  function handleClick() {
    if (type === "ios") {
      window.location = appleLink;
    } else {
      window.location = googleLink
    }
  }

  return (
    <div onClick={handleClick} className="flex flex-row bg-white shadow-md rounded-xl p-5 items-center gap-5 cursor-pointer shadow-lg w-max-[400px]">
      <FontAwesomeIcon
        icon={iconName}
        style={{ color: "black", height: "30px" }}
      />
      <div className="download-button-text">Download on {text}</div>
    </div>
  );
}
