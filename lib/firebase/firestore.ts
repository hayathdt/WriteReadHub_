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
import type { Story, StoryInput, StoryUpdate, UserProfile } from "../types";

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

export async function createUserProfile(
  userId: string,
  profileData: UserProfile
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, profileData);
  } catch (error) {
    console.error("Error creating user profile: ", error);
    throw new Error("Failed to create user profile");
  }
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as DocumentData;
      return {
        id: docSnap.id,
        bio: data.bio || "",
        website: data.website || "",
        socialLinks: data.socialLinks || {},
        avatar: data.avatar || "",
        displayName: data.displayName,
        email: data.email,
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile: ", error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  updateData: Partial<UserProfile>
): Promise<void> {
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, updateData as DocumentData);
  } catch (error) {
    console.error("Error updating user profile: ", error);
    throw new Error("Failed to update user profile");
  }
}
