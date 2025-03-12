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
