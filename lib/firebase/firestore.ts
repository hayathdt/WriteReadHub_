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
  where,
  serverTimestamp, // Added serverTimestamp
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

export async function getFavoriteStories(userId: string): Promise<Story[]> {
  try {
    const favoriteStoryIds = await getFavoriteStoryIds(userId);

    if (favoriteStoryIds.length === 0) {
      return [];
    }

    // Fetch all story details concurrently
    const storyPromises = favoriteStoryIds.map((storyId) => getStory(storyId));
    const storyResults = await Promise.all(storyPromises);

    // Filter out any null results (e.g., if a story was deleted)
    const favoriteStories = storyResults.filter(
      (story) => story !== null
    ) as Story[];

    return favoriteStories;
  } catch (error) {
    console.error(
      `Error getting favorite stories for user ${userId}: `,
      error
    );
    return [];
  }
}

// Favorite Stories Functions

export async function addStoryToFavorites(
  userId: string,
  storyId: string
): Promise<void> {
  try {
    const favoriteStoryRef = doc(
      db,
      "users",
      userId,
      "favoriteStories",
      storyId
    );
    await setDoc(favoriteStoryRef, {
      favoritedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(
      `Error adding story ${storyId} to favorites for user ${userId}: `,
      error
    );
    throw new Error("Failed to add story to favorites");
  }
}

export async function removeStoryFromFavorites(
  userId: string,
  storyId: string
): Promise<void> {
  try {
    const favoriteStoryRef = doc(
      db,
      "users",
      userId,
      "favoriteStories",
      storyId
    );
    await deleteDoc(favoriteStoryRef);
  } catch (error) {
    console.error(
      `Error removing story ${storyId} from favorites for user ${userId}: `,
      error
    );
    throw new Error("Failed to remove story from favorites");
  }
}

export async function getFavoriteStoryIds(userId: string): Promise<string[]> {
  try {
    const favoriteStoriesRef = collection(
      db,
      "users",
      userId,
      "favoriteStories"
    );
    const q = query(favoriteStoriesRef, orderBy("favoritedAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.id);
  } catch (error) {
    console.error(
      `Error getting favorite story IDs for user ${userId}: `,
      error
    );
    return [];
  }
}

export async function isStoryFavorited(
  userId: string,
  storyId: string
): Promise<boolean> {
  try {
    const favoriteStoryRef = doc(
      db,
      "users",
      userId,
      "favoriteStories",
      storyId
    );
    const docSnap = await getDoc(favoriteStoryRef);
    return docSnap.exists();
  } catch (error) {
    console.error(
      `Error checking if story ${storyId} is favorited for user ${userId}: `,
      error
    );
    return false;
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
    // Check if username already exists
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", profileData.username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error("Username already taken");
    }

    const userRef = doc(db, "users", userId);
    await setDoc(userRef, profileData);
  } catch (error) {
    console.error("Error creating user profile: ", error);
    if (error instanceof Error && error.message === "Username already taken") {
      throw error;
    }
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
        username: data.username, // Ensure username is returned
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
    if (updateData.username) {
      const usersRef = collection(db, "users");
      // Query for the new username
      const q = query(usersRef, where("username", "==", updateData.username));
      const querySnapshot = await getDocs(q);

      // Check if the username is taken by another user
      if (!querySnapshot.empty) {
        let isTakenByOther = false;
        querySnapshot.forEach((doc) => {
          if (doc.id !== userId) {
            isTakenByOther = true;
          }
        });
        if (isTakenByOther) {
          throw new Error("Username already taken by another user");
        }
      }
    }

    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, updateData as DocumentData);
  } catch (error) {
    console.error("Error updating user profile: ", error);
    if (
      error instanceof Error &&
      error.message === "Username already taken by another user"
    ) {
      throw error;
    }
    throw new Error("Failed to update user profile");
  }
}

export async function getStoriesByAuthorId(
  authorId: string
): Promise<Story[]> {
  try {
    const storiesRef = collection(db, "stories");
    const q = query(
      storiesRef,
      where("authorId", "==", authorId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
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
    console.error(`Error getting stories for author ${authorId}: `, error);
    return [];
  }
}
