import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import { deleteStory } from "@/lib/firebase/firestore";
import type { Story } from "@/lib/types";
import type { User } from "firebase/auth";
import { useState } from "react";

export default function StoryList({
  stories,
  user,
  onDelete,
}: {
  stories: Story[];
  user: User | null;
  onDelete?: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (storyId: string) => {
    setIsDeleting(storyId);
    try {
      await deleteStory(storyId);
      onDelete?.(storyId);
    } catch (error) {
      console.error("Failed to delete story:", error);
    } finally {
      setIsDeleting(null);
    }
  };
  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No stories yet</h3>
        <p className="text-muted-foreground mb-6">
          Be the first to publish a story!
        </p>
        <Link href="/create-story">
          <Badge variant="outline" className="text-sm py-1 px-3 cursor-pointer">
            Write a Story
          </Badge>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <Card
          key={story.id}
          className={`h-full flex flex-col ${
            story.status === "draft" ? "opacity-60" : ""
          }`}
        >
          <Link href={`/story/${story.id}`} className="flex-1">
            <CardHeader>
              <CardTitle className="line-clamp-2">{story.title}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>By {story.authorName}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
              <p className="text-muted-foreground line-clamp-4">
                {story.description}
              </p>
              {story.status === "draft" && (
                <Badge variant="secondary" className="mt-2">
                  Draft
                </Badge>
              )}
            </CardContent>
          </Link>
          <CardFooter className="flex justify-between items-center border-t pt-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{story.genre}</Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(story.createdAt)}
              </span>
            </div>
            {user && story.authorId === user.uid && (
              <div className="flex items-center gap-2">
                <Link href={`/write?id=${story.id}`}>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Story</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{story.title}"? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(story.id)}
                        disabled={isDeleting === story.id}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {isDeleting === story.id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
