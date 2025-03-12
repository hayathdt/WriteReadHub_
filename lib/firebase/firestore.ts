import { db } from "./config";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  setDoc,
  type DocumentData,
} from "firebase/firestore";
import type {
  Story,
  StoryInput,
  StoryUpdate,
  UserProfile,
  ProfileUpdate,
} from "../types";

export async function createStory(storyData: StoryInput): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "stories"), storyData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding story: ", error);
    throw new Error("Failed to create story");
  }
}

export async function getStories(limitCount = 50): Promise<Story[]> {
  try {
    const storiesQuery = query(
      collection(db, "stories"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(storiesQuery);
    const stories: Story[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      stories.push({
        id: doc.id,
        title: data.title,
        content: data.content,
        description: data.description,
        genre: data.genre,
        authorId: data.authorId,
        authorName: data.authorName,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt || data.createdAt,
        status: data.status || "published",
      });
    });

    return stories;
  } catch (error) {
    console.error("Error getting stories: ", error);
    return [];
  }
}

export async function getStory(id: string): Promise<Story | null> {
  try {
    const docRef = doc(db, "stories", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as DocumentData;
      return {
        id: docSnap.id,
        title: data.title,
        content: data.content,
        genre: data.genre,
        authorId: data.authorId,
        authorName: data.authorName,
        createdAt: data.createdAt,
        description: data.description,
        status: data.status || "published",
        updatedAt: data.updatedAt || data.createdAt,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting story: ", error);
    return null;
  }
}

export async function updateStory(
  id: string,
  updateData: StoryUpdate
): Promise<void> {
  try {
    const docRef = doc(db, "stories", id);
    await updateDoc(docRef, { ...updateData } as DocumentData);
  } catch (error) {
    console.error("Error updating story: ", error);
    throw new Error("Failed to update story");
  }
}

export async function deleteStory(id: string): Promise<void> {
  try {
    const docRef = doc(db, "stories", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting story: ", error);
    throw new Error("Failed to delete story");
  }
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, "profiles", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as DocumentData;
      return {
        uid: docSnap.id,
        displayName: data.displayName,
        bio: data.bio,
        socialLinks: data.socialLinks || {},
        profileImageUrl: data.profileImageUrl,
        joinDate: data.joinDate,
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting profile: ", error);
    return null;
  }
}

export async function createProfile(
  userId: string,
  profile: UserProfile
): Promise<void> {
  try {
    const docRef = doc(db, "profiles", userId);
    await setDoc(docRef, { ...profile } as DocumentData);
  } catch (error) {
    console.error("Error creating profile: ", error);
    throw new Error("Failed to create profile");
  }
}

export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<void> {
  try {
    const docRef = doc(db, "profiles", userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // If profile doesn't exist, create it with the updates
      await setDoc(docRef, {
        uid: userId,
        displayName: updates.displayName || "Anonymous",
        bio: updates.bio || "",
        socialLinks: updates.socialLinks || {},
        profileImageUrl: "/placeholder-user.jpg",
        joinDate: new Date().toISOString(),
        ...updates,
      } as DocumentData);
    } else {
      // If profile exists, update it
      await updateDoc(docRef, { ...updates } as DocumentData);
    }
  } catch (error) {
    console.error("Error updating profile: ", error);
    throw new Error("Failed to update profile");
  }
}

export async function deleteProfile(userId: string): Promise<void> {
  try {
    const docRef = doc(db, "profiles", userId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting profile: ", error);
    throw new Error("Failed to delete profile");
  }
}
