import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import type { Story } from "@/lib/types"

export default function StoryList({ stories }: { stories: Story[] }) {
  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No stories yet</h3>
        <p className="text-muted-foreground mb-6">Be the first to publish a story!</p>
        <Link href="/create-story">
          <Badge variant="outline" className="text-sm py-1 px-3 cursor-pointer">
            Write a Story
          </Badge>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <Link href={`/story/${story.id}`} key={story.id} className="transition-transform hover:-translate-y-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="line-clamp-2">{story.title}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>By {story.authorName}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground line-clamp-4">{story.content}</p>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Badge variant="outline">{story.genre}</Badge>
              <span className="text-xs text-muted-foreground">{formatDate(story.createdAt)}</span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}

