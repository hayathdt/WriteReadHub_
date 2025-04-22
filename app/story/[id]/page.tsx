import { getStory } from "@/lib/firebase/firestore";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Book } from "lucide-react";

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

          {/* Decorative book icon */}
          <div className="flex justify-center opacity-60 mb-8">
            <Book className="h-8 w-8 text-amber-800/30 dark:text-amber-200/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
