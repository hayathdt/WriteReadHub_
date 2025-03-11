import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <div className="bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Share Your Stories with the World</h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          WriteReadHub is a platform for writers to publish their stories and connect with readers around the globe.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/create-story">
            <Button size="lg">Start Writing</Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline">
              Join the Community
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

