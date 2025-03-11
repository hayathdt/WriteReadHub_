"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createStory, updateStory, getStory } from "@/lib/firebase/firestore";
import Editor from "../create-story/editor";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
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
      // Load existing story if we're editing
      const loadStory = async () => {
        try {
          const loadedStory = await getStory(storyId);
          if (loadedStory && loadedStory.authorId === user?.uid) {
            setStory(loadedStory);
            setContent(loadedStory.content);
          }
        } catch (err: any) {
          setError("Failed to load story");
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
        // Update existing story
        await updateStory(storyId, {
          content,
          status,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create new story using data from previous form
        const storyData = JSON.parse(
          localStorage.getItem("pendingStory") || "{}"
        );
        await createStory({
          ...storyData,
          content,
          status,
          authorId: user.uid,
          authorName: user.displayName || "Anonymous",
          createdAt: new Date().toISOString(),
        });
      }

      localStorage.removeItem("pendingStory"); // Clear stored data after successful creation
      router.push("/"); // Redirect to home page after saving
    } catch (err: any) {
      setError(err.message || "Failed to save story");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-emerald-900">
              {storyId ? "Edit Story" : "Write Your Story"}
            </h1>
            <div className="space-x-4">
              <Button
                onClick={() => handleSave("draft")}
                className="bg-black hover:bg-gray-800 text-white"
                disabled={isSaving}
              >
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSave("published")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Publish"}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Editor value={content} onChange={setContent} />
        </div>
      </div>
    </AuthCheck>
  );
}
