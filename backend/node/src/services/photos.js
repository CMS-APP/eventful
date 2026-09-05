export function getStoragePathFromUrl(url) {
  try {
    const decoded = decodeURIComponent(url);
    const matches = decoded.match(/\/o\/(.*?)\?alt=media/);
    if (!matches || !matches[1]) return null;
    return matches[1];
  } catch (e) {
    console.error("Failed to parse storage path", e);
    return null;
  }
}
