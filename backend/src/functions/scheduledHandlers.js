function createDeleteOldPhotosHandler({ admin, db, storage, getStoragePathFromUrl }) {
  return async () => {
    const now = admin.firestore.Timestamp.now();
    const cutoff = new Date(now.toDate().getTime() - 30 * 24 * 60 * 60 * 1000);

    const snapshot = await db
      .collection("photoBoothPhotos")
      .where("createdAt", "<", cutoff)
      .get();

    const deletions = snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const filePath = getStoragePathFromUrl(data.url);
      if (filePath) {
        try {
          await storage.bucket().file(filePath).delete();
        } catch (err) {
          console.error("Failed to delete storage file", err);
        }
      }
      await doc.ref.delete();
    });

    await Promise.all(deletions);
    console.log(`Deleted ${deletions.length} old photos`);
  };
}

module.exports = { createDeleteOldPhotosHandler };
