import { getStory } from "@/lib/firebase/firestore";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function StoryPage({
  params,
}: {
  params: { id: string };
}) {
  const story = await getStory(params.id);

  if (!story) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" passHref>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to stories
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <span>By {story.authorName}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(story.createdAt)}</span>
            <span className="mx-2">•</span>
            <span>{story.genre}</span>
          </div>
        </div>

        <div className="mb-8 prose prose-lg max-w-none">
          <p className="text-lg text-gray-600 italic">{story.description}</p>
        </div>

        <div className="prose prose-lg max-w-none">
          {story.content.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
