import {
  faApple,
  faGoogle,
  faInstagram,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons"; // Import the specific icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Footer.css";

export default function Footer({ main = false }) {
  const appleLink =
    "https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=6449842590";
  const googleLink =
    "https://play.google.com/store/apps/details?id=com.hostinghappily.app";
  const instagramLink = "https://www.instagram.com/eventfulapp_/";
  const tiktokLink = "https://www.tiktok.com/@eventfulapp";

  return (
    <footer>
      <div
        className={`${
          main ? "bg-transparent" : "bg-primary"
        } text-white flex justify-center items-center w-full h-[75px] py-[10px] px-8`}
      >
        <div className="flex flex-1 flex-row justify-center items-center">
          <div className="flex flex-1 justify-start items-center gap-[50px]">
            <p>© {new Date().getFullYear()} Eventful</p>
            <button
              className="hidden md:block"
              onClick={() => (window.location = "/about/privacy")}
            >
              <p>Privacy Policy</p>
            </button>
          </div>

          <div className="flex flex-1 justify-end items-center md:mr-[0px]">
            <button onClick={() => (window.location = appleLink)}>
              <FontAwesomeIcon
                icon={faApple}
                className="text-white h-[30px] mr-[20px]"
              />
            </button>
            <button onClick={() => (window.location = googleLink)}>
              <FontAwesomeIcon
                icon={faGoogle}
                className="text-white h-[25px] mr-[20px]"
              />
            </button>

            <button onClick={() => (window.location = instagramLink)}>
              <FontAwesomeIcon
                icon={faInstagram}
                className="text-white h-[30px] mr-[20px]"
              />
            </button>

            <button onClick={() => (window.location = tiktokLink)}>
              <FontAwesomeIcon
                icon={faTiktok}
                className="text-white h-[25px]"
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
