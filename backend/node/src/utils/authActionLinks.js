function buildAuthActionLink(pageUrl, mode, adminGeneratedLink) {
  const oobCode = new URL(adminGeneratedLink).searchParams.get("oobCode");
  const url = new URL(pageUrl);
  url.searchParams.set("mode", mode);
  url.searchParams.set("oobCode", oobCode);
  return url.toString();
}

module.exports = { buildAuthActionLink };
