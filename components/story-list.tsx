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
import { formatDate } from "@/lib/utils";
import { Edit } from "lucide-react";
import type { Story } from "@/lib/types";
import type { User } from "firebase/auth";

export default function StoryList({
  stories,
  user,
}: {
  stories: Story[];
  user: User | null;
}) {
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
              <Link href={`/write?id=${story.id}`}>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
