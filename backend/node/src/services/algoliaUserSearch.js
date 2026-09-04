const { algoliasearch } = require("algoliasearch");

function parsePositiveInt(value, fallback) {
  const n = Number.parseInt(String(value ?? ""), 10);
  return n > 0 ? n : fallback;
}

function pickUserFields(hit) {
  return {
    uid: hit.uid || hit.objectID || null,
    username: hit.username ?? null,
    name: hit.name ?? null,
    searchName: hit.searchName ?? null,
  };
}

function isSearchableUser(user) {
  if (!user?.uid) return false;
  const name = typeof user.name === "string" ? user.name.trim() : "";
  const username = typeof user.username === "string" ? user.username.trim() : "";
  return Boolean(name || username);
}

function createAlgoliaUserSearchHandler({
  admin,
  ALGOLIA_APP_ID,
  ALGOLIA_API_KEY,
}) {
  // Reuse a single Algolia client per instance to avoid creating one on every request
  let algoliaClient = null;

  function getClient() {
    if (!algoliaClient) {
      algoliaClient = algoliasearch(
        ALGOLIA_APP_ID.value(),
        ALGOLIA_API_KEY.value(),
      );
    }
    return algoliaClient;
  }

  return async (req, res) => {
    if (req.method === "OPTIONS") return res.status(204).send("");

    if (req.method !== "GET" && req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const appCheckToken = req.header("X-Firebase-AppCheck");
    if (!appCheckToken) return res.status(400).send("Missing app token");

    try {
      await admin.appCheck().verifyToken(appCheckToken);
    } catch (err) {
      console.error("App Check verification failed:", err);
      return res.status(401).send("Unauthorized");
    }

    const q = String(req.query.q ?? req.body?.q ?? "").trim();
    if (!q) return res.status(400).send("Missing query");

    const hitsPerPage = Math.min(
      parsePositiveInt(req.query.limit ?? req.body?.limit, 20),
      50,
    );
    const page = parsePositiveInt(req.query.page ?? req.body?.page, 0);

    try {
      const result = await getClient().searchSingleIndex({
        indexName: "user-search",
        searchParams: {
          query: q,
          hitsPerPage,
          page,
          typoTolerance: true,
          queryType: "prefixLast",
          removeWordsIfNoResults: "lastWords",
          attributesToRetrieve: ["uid", "username", "name", "searchName"],
        },
      });

      const hits = (result.hits || [])
        .map(pickUserFields)
        .filter(isSearchableUser);

      return res.status(200).json({
        query: q,
        hitsPerPage,
        page,
        nbHits: hits.length,
        hits,
      });
    } catch (err) {
      console.error("Algolia user search error:", err);
      return res.status(500).send("Search failed");
    }
  };
}

module.exports = { createAlgoliaUserSearchHandler };
