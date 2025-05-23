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
  Timestamp,
  where,
} from "firebase/firestore";
import type {
  Story,
  StoryInput,
  StoryUpdate,
  UserProfile,
  Comment,
  CommentInput,
  Rating,
  RatingInput,
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

export async function setRating(ratingData: RatingInput): Promise<void> {
  const { storyId, userId, value } = ratingData;
  try {
    const ratingsQuery = query(
      collection(db, "ratings"),
      where("storyId", "==", storyId),
      where("userId", "==", userId),
      limit(1)
    );

    const querySnapshot = await getDocs(ratingsQuery);
    const now = Timestamp.now().toMillis().toString();

    if (!querySnapshot.empty) {
      // Rating exists, update it
      const docId = querySnapshot.docs[0].id;
      await updateDoc(doc(db, "ratings", docId), {
        value,
        updatedAt: now,
      });
    } else {
      // No rating exists, create a new one
      await addDoc(collection(db, "ratings"), {
        ...ratingData,
        createdAt: now,
        updatedAt: now,
      });
    }
  } catch (error) {
    console.error("Error setting rating: ", error);
    throw new Error("Failed to set rating");
  }
}

export async function getRating(
  storyId: string,
  userId: string
): Promise<Rating | null> {
  try {
    const ratingsQuery = query(
      collection(db, "ratings"),
      where("storyId", "==", storyId),
      where("userId", "==", userId),
      limit(1)
    );

    const querySnapshot = await getDocs(ratingsQuery);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data() as DocumentData;
      return {
        id: docSnap.id,
        storyId: data.storyId,
        userId: data.userId,
        value: data.value,
        // createdAt and updatedAt might also be useful to return if available
        // createdAt: data.createdAt,
        // updatedAt: data.updatedAt,
      } as Rating;
    }
    return null;
  } catch (error) {
    console.error("Error getting rating: ", error);
    return null;
  }
}

export async function getAverageRating(storyId: string): Promise<number> {
  try {
    const ratingsQuery = query(
      collection(db, "ratings"),
      where("storyId", "==", storyId)
    );

    const querySnapshot = await getDocs(ratingsQuery);
    if (querySnapshot.empty) {
      return 0; // No ratings, average is 0
    }

    let totalValue = 0;
    querySnapshot.forEach((doc) => {
      totalValue += doc.data().value;
    });
    return totalValue / querySnapshot.size;
  } catch (error) {
    console.error("Error getting average rating: ", error);
    return 0; // Return 0 on error
  }
}

export async function createComment(
  commentData: CommentInput
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "comments"), {
      ...commentData,
      createdAt: Timestamp.now().toMillis().toString(), // Store as ISO string or Milliseconds string
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding comment: ", error);
    throw new Error("Failed to create comment");
  }
}

export async function getComments(storyId: string): Promise<Comment[]> {
  try {
    const commentsQuery = query(
      collection(db, "comments"),
      where("storyId", "==", storyId), // Make sure to import `where` from "firebase/firestore"
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(commentsQuery);
    const comments: Comment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      comments.push({
        id: doc.id,
        storyId: data.storyId,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        text: data.text,
        createdAt: data.createdAt,
      } as Comment); // Type assertion
    });

    return comments;
  } catch (error) {
    console.error("Error getting comments: ", error);
    return []; // Return empty array on error
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
