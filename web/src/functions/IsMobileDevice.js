import MobileDetect from "mobile-detect";

export function isMobileDevice() {
  if (typeof window === "undefined") {
    return false; // Default to false during SSR
  }

  const md = new MobileDetect(window.navigator.userAgent);

  if (md.mobile()) {
    return true;
  } else if (md.tablet()) {
    return true;
  } else {
    return false;
  }
}
