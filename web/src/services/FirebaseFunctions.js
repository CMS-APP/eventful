import { doc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  uploadBytes
} from "firebase/storage";

import { FIREBASE_APP, FIREBASE_STORAGE, FIRESTORE_DB } from "@/app/Firebase";

export async function getUserInfo(user) {
  try {
    console.log(
      "FirebaseFunctions: Getting user info for user: " + user.uid,
      "debug"
    );
    const docRef = doc(FIRESTORE_DB, "user", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("FirebaseFunctions: User Details Found", "debug");
      console.log(
        "FirebaseFunctions: User Details: " +
          JSON.stringify(docSnap.data(), null, 2),
        "debug"
      );
      return docSnap.data();
    } else {
      console.log("FirebaseFunctions: User Details Not Found", "debug");
      return null;
    }
  } catch (error) {
    if (error.code === "permission-denied") {
      console.log(
        "FirebaseFunctions: Current User does not have user account",
        "warn"
      );
      return null;
    } else {
      console.log(
        "FirebaseFunctions: Error getting user details: " + error,
        "error"
      );
      throw error;
    }
  }
}

export async function checkEventLink(eventLinkId) {
  try {
    const docRef = doc(FIRESTORE_DB, "eventLinks", eventLinkId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("FirebaseFunctions: Event Link Found", "debug");
      console.log(docSnap.data());
      return docSnap.data();
    } else {
      console.log("FirebaseFunctions: Event Link Not Found", "debug");
      return null;
    }
  } catch (error) {
    console.log(
      "FirebaseFunctions: Error getting event link details: " + error,
      "error"
    );
    return null;
  }
}

export async function sendForgotPasswordEmail(email, recaptchaToken) {
  try {
    const functions = getFunctions(FIREBASE_APP, "us-central1");
    const forgotPasswordFunction = httpsCallable(functions, "forgotPassword");

    const result = await forgotPasswordFunction({
      email,
      recaptchaToken
    });

    return result.data;
  } catch (error) {
    console.error("Error sending forgot password email:", error);
    throw error;
  }
}

export async function uploadGalleryImage(
  imageFile,
  userId,
  eventId,
  fileName = null
) {
  try {
    const timestamp = Date.now();
    const fileExtension = imageFile.name.split(".").pop();
    const finalFileName = fileName || `image_${timestamp}.${fileExtension}`;

    const storageRef = ref(
      FIREBASE_STORAGE,
      `gallery/${userId}/${eventId}/${finalFileName}`
    );

    const snapshot = await uploadBytes(storageRef, imageFile);
    console.log("Image uploaded successfully:", snapshot.metadata.name);

    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Download URL:", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading gallery image:", error);
    throw error;
  }
}

export async function getGalleryImages(userId, eventId) {
  try {
    const galleryRef = ref(FIREBASE_STORAGE, `gallery/${userId}/${eventId}`);

    const result = await listAll(galleryRef);

    const imagePromises = result.items.map(async (itemRef) => {
      const [downloadURL, metadata] = await Promise.all([
        getDownloadURL(itemRef),
        getMetadata(itemRef)
      ]);
      return {
        name: itemRef.name,
        url: downloadURL,
        fullPath: itemRef.fullPath,
        size: metadata.size || 0
      };
    });

    const images = await Promise.all(imagePromises);
    console.log(
      `Found ${images.length} images in gallery for user ${userId}, event ${eventId}`
    );

    return images;
  } catch (error) {
    console.error("Error getting gallery images:", error);
    throw error;
  }
}

export async function deleteGalleryImage(userId, eventId, fileName) {
  try {
    const imageRef = ref(
      FIREBASE_STORAGE,
      `gallery/${userId}/${eventId}/${fileName}`
    );

    await deleteObject(imageRef);
    console.log(`Image ${fileName} deleted successfully from gallery`);
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    throw error;
  }
}

export async function deleteAllGalleryImages(userId, eventId) {
  try {
    const images = await getGalleryImages(userId, eventId);

    const deletePromises = images.map((image) => {
      const imageRef = ref(FIREBASE_STORAGE, image.fullPath);
      return deleteObject(imageRef);
    });

    await Promise.all(deletePromises);
    console.log(`All images deleted for user ${userId}, event ${eventId}`);
  } catch (error) {
    console.error("Error deleting all gallery images:", error);
    throw error;
  }
}

export async function galleryExists(userId, eventId) {
  try {
    const images = await getGalleryImages(userId, eventId);
    return images.length > 0;
  } catch (error) {
    console.error("Error checking if gallery exists:", error);
    return false;
  }
}

export async function getGalleryStats(userId, eventId) {
  try {
    const images = await getGalleryImages(userId, eventId);
    const totalSize = images.reduce((sum, image) => sum + (image.size || 0), 0);

    console.log("Gallery Stats:", {
      imageCount: images.length,
      totalSize: totalSize,
      hasImages: images.length > 0
    });

    return {
      imageCount: images.length,
      totalSize: totalSize,
      hasImages: images.length > 0
    };
  } catch (error) {
    console.error("Error getting gallery stats:", error);
    throw error;
  }
}
