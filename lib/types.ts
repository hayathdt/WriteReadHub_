export type StoryStatus = "draft" | "published";

export interface Story {
  id: string;
  title: string;
  content: string;
  description: string;
  genre: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  status: StoryStatus;
}

export interface StoryInput {
  title: string;
  content: string;
  description: string;
  genre: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  status: StoryStatus;
}

export interface StoryUpdate {
  content?: string;
  description?: string;
  title?: string;
  genre?: string;
  status?: StoryStatus;
  updatedAt: string;
}

export interface SocialLinks {
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  bio: string;
  avatar: string;
  website?: string;
  socialLinks?: SocialLinks;
}

export interface Comment {
  id: string;
  storyId: string;
  userId: string;
  userName: string; // To display alongside the comment
  userAvatar?: string; // Optional: URL to user's avatar
  text: string;
  createdAt: string; // ISO string date
}

export interface CommentInput {
  storyId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
}

export interface Rating {
  id: string; // Document ID
  storyId: string;
  userId: string;
  value: 1 | 2 | 3 | 4 | 5; // 5-star rating
}

export interface RatingInput {
  storyId: string;
  userId: string;
  value: 1 | 2 | 3 | 4 | 5;
}
