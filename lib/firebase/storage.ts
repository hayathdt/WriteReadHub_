import { storage } from "./config";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export async function uploadProfileImage(
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    const fileExtension = file.name.split(".").pop();
    const fileName = `profile-${userId}-${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `profile-images/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error("Error uploading image:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            console.error("Error getting download URL:", error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error("Error in uploadProfileImage:", error);
    throw new Error("Failed to upload profile image");
  }
}

export async function deleteProfileImage(imageUrl: string): Promise<void> {
  try {
    // Extract the path from the download URL
    const decodedUrl = decodeURIComponent(imageUrl);
    const startIndex = decodedUrl.indexOf("/o/") + 3;
    const endIndex = decodedUrl.indexOf("?");
    const fullPath = decodedUrl.substring(startIndex, endIndex);

    const imageRef = ref(storage, fullPath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Error deleting profile image:", error);
    throw new Error("Failed to delete profile image");
  }
}
