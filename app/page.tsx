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
    <main className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-950/30 dark:via-gray-900 dark:to-gray-900">
      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center justify-center relative overflow-hidden">
        <Hero />
      </section>

      {/* Latest Stories Section */}
      <section className="relative">
        {/* Decorative elements */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute left-0 top-1/4 h-[300px] w-[400px] rounded-full bg-gradient-to-br from-amber-200/20 to-orange-100/10 blur-3xl dark:from-amber-900/10 dark:to-orange-900/5" />
          <div className="absolute right-0 bottom-1/4 h-[250px] w-[350px] rounded-full bg-gradient-to-br from-orange-100/20 to-amber-200/10 blur-3xl dark:from-orange-900/10 dark:to-amber-900/5" />
        </div>

        {/* Content */}
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-amber-900 dark:text-amber-100 mb-4">
              Latest Stories
            </h2>
            <div className="w-20 h-1 mx-auto rounded-full bg-gradient-to-r from-amber-200 to-amber-300 dark:from-amber-700 dark:to-amber-600" />
          </div>

          {/* Stories Grid */}
          <StoryList stories={stories} user={user} onDelete={handleDelete} />
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent dark:from-gray-900 pointer-events-none" />
      </section>
    </main>
  );
}
