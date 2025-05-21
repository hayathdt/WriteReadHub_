"use client"; // Convert to Client Component

import { useEffect, useState } from "react";
import { getStory, isStoryFavorited, addStoryToFavorites, removeStoryFromFavorites } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";
import { notFound, useParams } from "next/navigation"; // useParams for client component
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Book, Heart } from "lucide-react";
import type { Story } from "@/lib/types"; // Import Story type

export default function StoryPage() {
  const params = useParams<{ id: string }>(); // Get params in client component
  const { user } = useAuth();
  const { toast } = useToast();

  const [story, setStory] = useState<Story | null>(null);
  const [storyLoading, setStoryLoading] = useState(true);

  const [isFavorited, setIsFavorited] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(true);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      if (params.id) {
        setStoryLoading(true);
        const fetchedStory = await getStory(params.id);
        if (!fetchedStory) {
          notFound();
        } else {
          setStory(fetchedStory);
        }
        setStoryLoading(false);
      }
    };
    fetchStory();
  }, [params.id]);

  useEffect(() => {
    const checkFavorite = async () => {
      if (user && story) {
        setCheckingFavorite(true);
        const favorited = await isStoryFavorited(user.uid, story.id);
        setIsFavorited(favorited);
        setCheckingFavorite(false);
      } else if (!user) {
        // If user is not logged in, story is not favorited by default and not checking
        setIsFavorited(false);
        setCheckingFavorite(false);
      }
    };
    checkFavorite();
  }, [user, story]);

  const handleToggleFavorite = async () => {
    if (!user || checkingFavorite || togglingFavorite || !story) return;

    setTogglingFavorite(true);
    try {
      if (isFavorited) {
        await removeStoryFromFavorites(user.uid, story.id);
        setIsFavorited(false);
        toast({ title: "Success", description: "Removed from favorites." });
      } else {
        await addStoryToFavorites(user.uid, story.id);
        setIsFavorited(true);
        toast({ title: "Success", description: "Added to favorites!" });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({ title: "Error", description: "Failed to update favorites. Please try again.", variant: "destructive" });
    } finally {
      setTogglingFavorite(false);
    }
  };

  if (storyLoading) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex justify-center items-center">
        <p className="text-gray-500 dark:text-gray-400">Loading story...</p>
      </div>
    );
  }

  if (!story) {
    // Should be handled by notFound() in useEffect, but as a fallback
    return (
        <div className="container mx-auto p-4 min-h-screen flex justify-center items-center">
          <p className="text-red-500 dark:text-red-400">Story not found.</p>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-950/30 dark:via-gray-900 dark:to-gray-900">
      <div className="container relative mx-auto px-4 py-8">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute left-0 top-1/4 h-[300px] w-[400px] rounded-full bg-gradient-to-br from-amber-200/20 to-orange-100/10 blur-3xl dark:from-amber-900/10 dark:to-orange-900/5" />
          <div className="absolute right-0 bottom-1/4 h-[250px] w-[350px] rounded-full bg-gradient-to-br from-orange-100/20 to-amber-200/10 blur-3xl dark:from-orange-900/10 dark:to-amber-900/5" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Link href="/" passHref>
            <Button
              variant="ghost"
              className="mb-8 text-amber-900 dark:text-amber-100 hover:bg-amber-100/50 dark:hover:bg-amber-900/50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to stories
            </Button>
          </Link>

          <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-amber-200/30 dark:border-amber-800/30 shadow-2xl p-8 mb-8">
            <div className="mb-8">
              <h1 className="font-serif text-4xl font-medium text-amber-900 dark:text-amber-100 mb-4">
                {story.title}
              </h1>
              <div className="flex items-center text-sm text-amber-700/80 dark:text-amber-300/80 space-x-2">
                <span>By {story.authorName}</span>
                <span>•</span>
                <span>{formatDate(story.createdAt)}</span>
                <span>•</span>
                <span className="bg-amber-100/50 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                  {story.genre}
                </span>
              </div>
            </div>

            {/* Favorite Button */}
            {user && (
              <div className="mt-6 mb-8">
                <Button
                  onClick={handleToggleFavorite}
                  disabled={checkingFavorite || togglingFavorite}
                  variant="outline"
                  className="border-amber-300 dark:border-amber-700 hover:bg-amber-100/50 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-100"
                >
                  <Heart className={`mr-2 h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-amber-700 dark:text-amber-300'}`} />
                  {checkingFavorite ? 'Checking...' : togglingFavorite ? (isFavorited ? 'Removing...' : 'Adding...') : (isFavorited ? 'Unfavorite' : 'Favorite')}
                </Button>
              </div>
            )}

            <div className="mb-8">
              <p className="text-lg text-amber-800/90 dark:text-amber-200/90 italic">
                {story.description}
              </p>
            </div>

            <div className="prose prose-amber dark:prose-invert max-w-none">
              {story.content.split("\n").map((paragraph, index) => (
                <p
                  key={index}
                  className="text-amber-950 dark:text-amber-100 leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center opacity-60 mb-8">
            <Book className="h-8 w-8 text-amber-800/30 dark:text-amber-200/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
