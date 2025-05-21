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
  username: string;
  website?: string;
  socialLinks?: SocialLinks;
}
