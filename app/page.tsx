"use client";

import StoryList from "@/components/story-list";
import { getStories } from "@/lib/firebase/firestore";
import Hero from "@/components/hero";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import type { Story } from "@/lib/types";

export default function Home() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    const loadStories = async () => {
      const loadedStories = await getStories();
      setStories(loadedStories);
    };
    loadStories();
  }, []);

  const handleDelete = (deletedId: string) => {
    setStories((prevStories) =>
      prevStories.filter((story) => story.id !== deletedId)
    );
  };

  return (
    <>
      <section className="min-h-screen flex items-center justify-center">
        <Hero />
      </section>
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Latest Stories</h2>
        <StoryList stories={stories} user={user} onDelete={handleDelete} />
      </section>
    </>
  );
}
