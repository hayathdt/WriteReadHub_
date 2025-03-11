import StoryList from "@/components/story-list";
import { getStories } from "@/lib/firebase/firestore";
import Hero from "@/components/hero";

export default async function Home() {
  const stories = await getStories();

  return (
    <>
      <section className="min-h-screen flex items-center justify-center">
        <Hero />
      </section>
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Latest Stories</h2>
        <StoryList stories={stories} />
      </section>
    </>
  );
}
