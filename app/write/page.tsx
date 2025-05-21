"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createStory, updateStory, getStory } from "@/lib/firebase/firestore"; // serverTimestamp removed
import { serverTimestamp } from "firebase/firestore"; // Added direct import for serverTimestamp
import Editor from "../create-story/editor";
import { Button } from "@/components/ui/button";
import { AlertCircle, BookOpen, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthCheck from "@/components/auth-check";

export default function WritePage() {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [story, setStory] = useState<any>(null);

  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams.get("id");

  useEffect(() => {
    if (storyId) {
      const loadStory = async () => {
        try {
          const loadedStory = await getStory(storyId);
          if (loadedStory && loadedStory.authorId === user?.uid) {
            setStory(loadedStory);
            setContent(loadedStory.content);
          }
        } catch (err: any) {
          setError("Failed to load the article");
        }
      };
      loadStory();
    }
  }, [storyId, user?.uid]);

  const handleSave = async (status: "draft" | "published") => {
    if (!user) return;

    setIsSaving(true);
    setError("");

    try {
      if (storyId) {
        await updateStory(storyId, {
          content,
          status,
          updatedAt: serverTimestamp(), // Use serverTimestamp
        });
      } else {
        const storyData = JSON.parse(
          localStorage.getItem("pendingStory") || "{}"
        );
        await createStory({
          ...storyData,
          content,
          status,
          authorId: user.uid,
          authorName: user.displayName || "Anonymous",
          createdAt: serverTimestamp(), // Use serverTimestamp
        });
      }

      localStorage.removeItem("pendingStory");
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to save the article");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-950/30 dark:via-gray-900 dark:to-gray-900">
        <div className="relative">
          {/* Decorative elements */}
          <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute left-0 top-1/4 h-[300px] w-[400px] rounded-full bg-gradient-to-br from-amber-200/20 to-orange-100/10 blur-3xl dark:from-amber-900/10 dark:to-orange-900/5" />
            <div className="absolute right-0 bottom-1/4 h-[250px] w-[350px] rounded-full bg-gradient-to-br from-orange-100/20 to-amber-200/10 blur-3xl dark:from-orange-900/10 dark:to-amber-900/5" />
          </div>

          {/* Sticky header */}
          <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-amber-200/30 dark:border-amber-800/30">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <h1 className="font-serif text-2xl font-medium text-amber-900 dark:text-amber-100">
                  {storyId ? "Edit Story" : "Write Your Story"}
                </h1>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => handleSave("draft")}
                    variant="outline"
                    className="border-amber-200/50 dark:border-amber-800/50 text-amber-900 dark:text-amber-100 hover:bg-amber-100/50 dark:hover:bg-amber-900/50"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    onClick={() => handleSave("published")}
                    className="bg-amber-800 hover:bg-amber-700 text-amber-50 dark:bg-amber-700 dark:hover:bg-amber-600 shadow-lg shadow-amber-900/20 dark:shadow-amber-900/10"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Publish"}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {error && (
                <Alert
                  variant="destructive"
                  className="mb-6 rounded-2xl border-red-500/20 bg-red-50/50 dark:bg-red-900/20 backdrop-blur-xl"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-amber-200/30 dark:border-amber-800/30 shadow-2xl">
                <Editor value={content} onChange={setContent} />
              </div>

              {/* Decorative book icon */}
              <div className="mt-8 flex justify-center opacity-60">
                <BookOpen className="h-8 w-8 text-amber-800/30 dark:text-amber-200/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
