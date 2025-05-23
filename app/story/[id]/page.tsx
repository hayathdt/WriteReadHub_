"use client";

import { useState, useEffect, useCallback } from "react";
import { getStory, getComments, getAverageRating, getRating, createComment, setRating } from "@/lib/firebase/firestore";
import { useAuth } from '@/lib/auth-context';
import type { Comment, Rating, Story } from "@/lib/types"; // Assuming Story type is also needed here
import { formatDate } from "@/lib/utils";
import { notFound, useParams } from "next/navigation"; // useParams might be needed if not relying on props
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StarRating } from '@/components/ui/star-rating'; // Import StarRating
import { ArrowLeft, Book } from "lucide-react";

export default function StoryPage({ params }: { params: { id: string } }) {
  const { id: storyId } = params; // Extract storyId from params

  const { user, loading: authLoading } = useAuth();

  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [isLoadingStory, setIsLoadingStory] = useState<boolean>(true);
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(true);
  const [isLoadingRating, setIsLoadingRating] = useState<boolean>(true); // For average and user specific
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);


  // Fetch initial story data
  useEffect(() => {
    async function fetchStoryDetails() {
      setIsLoadingStory(true);
      try {
        const storyData = await getStory(storyId);
        if (storyData) {
          setStory(storyData);
        } else {
          notFound(); // Or handle as an error state
        }
      } catch (error) {
        console.error("Failed to fetch story:", error);
        // Handle error (e.g., show error message)
        notFound(); // Or set an error state
      }
      setIsLoadingStory(false);
    }
    if (storyId) {
      fetchStoryDetails();
    }
  }, [storyId]);

  // Fetch comments and average rating
  const fetchCommentsAndRatings = useCallback(async () => {
    if (!storyId) return;
    setIsLoadingComments(true);
    setIsLoadingRating(true); // For average rating
    try {
      const fetchedComments = await getComments(storyId);
      setComments(fetchedComments);
      const avgRating = await getAverageRating(storyId);
      setAverageRating(avgRating);
    } catch (error) {
      console.error("Failed to fetch comments or average rating:", error);
      // Handle error
    }
    setIsLoadingComments(false);
    setIsLoadingRating(false);
  }, [storyId]);

  useEffect(() => {
    fetchCommentsAndRatings();
  }, [fetchCommentsAndRatings]);

  // Fetch user-specific rating
  const fetchUserRating = useCallback(async () => {
    if (!storyId || !user || !user.uid) return;
    setIsLoadingRating(true); // Also indicates loading for user-specific rating
    try {
      const ratingData = await getRating(storyId, user.uid);
      setUserRating(ratingData);
    } catch (error) {
      console.error("Failed to fetch user rating:", error);
      // Handle error
    }
    setIsLoadingRating(false);
  }, [storyId, user]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchUserRating();
    }
  }, [user, authLoading, fetchUserRating]);


  const handleSetRating = async (value: 1 | 2 | 3 | 4 | 5) => {
    if (!user || !user.uid || !storyId) {
      // Optionally, prompt user to log in
      console.log("User not logged in or storyId missing");
      return;
    }
    setIsSubmittingRating(true);
    try {
      await setRating({ storyId, userId: user.uid, value });
      // Refetch user rating and average rating
      fetchUserRating();
      const avgRating = await getAverageRating(storyId); // Re-fetch average rating
      setAverageRating(avgRating);
    } catch (error) {
      console.error("Failed to set rating:", error);
      // Handle error (e.g., show toast notification)
    }
    setIsSubmittingRating(false);
  };

  const handleCommentSubmit = async () => {
    if (!user || !user.uid || !storyId || !newComment.trim()) {
      // Optionally, show an error message
      console.log("User not logged in, storyId missing, or comment empty");
      return;
    }
    setIsSubmittingComment(true);
    try {
      await createComment({
        storyId,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userAvatar: user.photoURL || undefined, // Ensure undefined if null
        text: newComment.trim(),
      });
      setNewComment(""); // Clear input field
      fetchCommentsAndRatings(); // Refetch comments to show the new one
    } catch (error) {
      console.error("Failed to submit comment:", error);
      // Handle error (e.g., show toast notification)
    }
    setIsSubmittingComment(false);
  };

  if (isLoadingStory || authLoading) {
    // Basic loading state
    return <div className="container mx-auto px-4 py-8 text-center">Loading story...</div>;
  }

  if (!story) {
    // This should be caught by notFound() in useEffect, but as a fallback:
    return <div className="container mx-auto px-4 py-8 text-center">Story not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-950/30 dark:via-gray-900 dark:to-gray-900">
      <div className="container relative mx-auto px-4 py-8">
        {/* Decorative elements */}
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
            {/* Story Title and Meta */}
            <div className="mb-8">
              <h1 className="font-serif text-4xl font-medium text-amber-900 dark:text-amber-100 mb-4">
                {story.title}
              </h1>
              <div className="flex items-center text-sm text-amber-700/80 dark:text-amber-300/80 space-x-2">
                <span>By {story.authorName || 'Unknown Author'}</span>
                <span>•</span>
                <span>{formatDate(story.createdAt)}</span>
                <span>•</span>
                <span className="bg-amber-100/50 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                  {story.genre}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-lg text-amber-800/90 dark:text-amber-200/90 italic">
                {story.description}
              </p>
            </div>

            {/* Story Content */}
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

          {/* Ratings Section */}
          <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-amber-200/30 dark:border-amber-800/30 shadow-xl p-8 mb-8">
            <h2 className="font-serif text-2xl font-medium text-amber-900 dark:text-amber-100 mb-4">
              Rate this Story
            </h2>
            {isLoadingRating ? (
              <p>Loading rating...</p>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-amber-700/90 dark:text-amber-300/90">Average Rating:</p>
                  <StarRating currentRating={averageRating} readOnly size="h-5 w-5" />
                  <span className="text-sm text-amber-700/90 dark:text-amber-300/90">
                    ({averageRating > 0 ? averageRating.toFixed(1) : "0.0"} / 5)
                  </span>
                </div>
                {user && !authLoading && (
                  <div className="mb-4">
                     <div className="flex items-center gap-2">
                      <p className="text-sm text-amber-700/90 dark:text-amber-300/90">Your Rating:</p>
                      <StarRating
                        currentRating={userRating?.value || 0}
                        onRate={handleSetRating}
                        readOnly={isSubmittingRating}
                        size="h-6 w-6" // Slightly larger for interaction
                      />
                       {userRating && <span className="text-sm text-amber-700/90 dark:text-amber-300/90">({userRating.value}/5)</span>}
                    </div>
                     {isSubmittingRating && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Submitting rating...</p>}
                  </div>
                )}
                {!user && !authLoading && (
                  <p className="text-sm text-amber-700/80 dark:text-amber-300/80">
                    Please <Link href="/auth" className="underline hover:text-amber-600 dark:hover:text-amber-400">log in</Link> to rate this story.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Comments Section */}
          <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-amber-200/30 dark:border-amber-800/30 shadow-xl p-8">
            <h2 className="font-serif text-2xl font-medium text-amber-900 dark:text-amber-100 mb-6">
              Comments ({comments.length})
            </h2>
            {isLoadingComments ? (
              <p className="text-amber-800 dark:text-amber-200">Loading comments...</p>
            ) : (
              <div className="space-y-6 mb-6">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-4 border border-amber-200/50 dark:border-amber-800/50 rounded-lg bg-white/50 dark:bg-gray-800/30">
                      <div className="flex items-center mb-2">
                        {comment.userAvatar && (
                          <img src={comment.userAvatar} alt={comment.userName} className="w-8 h-8 rounded-full mr-3" />
                        )}
                        <div>
                          <p className="font-semibold text-amber-900 dark:text-amber-100">
                            {comment.userName}
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p className="text-amber-800 dark:text-amber-200 whitespace-pre-wrap">
                        {comment.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-amber-800 dark:text-amber-200">No comments yet. Be the first to share your thoughts!</p>
                )}
              </div>
            )}

            {user && !authLoading && (
              <div className="mt-6">
                <h3 className="font-serif text-xl font-medium text-amber-900 dark:text-amber-100 mb-3">
                  Leave a Comment
                </h3>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your comment here..."
                  rows={4}
                  className="w-full p-3 border border-amber-300 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 bg-white/70 dark:bg-gray-800/50 text-amber-900 dark:text-amber-100 placeholder-amber-500 dark:placeholder-amber-500/70"
                  disabled={isSubmittingComment}
                />
                <Button
                  onClick={handleCommentSubmit}
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="mt-3 bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700"
                >
                  {isSubmittingComment ? "Submitting..." : "Submit Comment"}
                </Button>
              </div>
            )}
            {!user && !authLoading && (
                <p className="text-sm text-amber-700/80 dark:text-amber-300/80 mt-6">
                  Please <Link href="/auth" className="underline hover:text-amber-600 dark:hover:text-amber-400">log in</Link> to leave a comment.
                </p>
            )}
          </div>


          {/* Decorative book icon */}
          <div className="flex justify-center opacity-60 mt-12 mb-8"> {/* Added mt-12 */}
            <Book className="h-8 w-8 text-amber-800/30 dark:text-amber-200/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
