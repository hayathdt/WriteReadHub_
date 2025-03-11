"use client"; // pour indiquer que ce composant s'exécute coté client (partie next.js)

// ensuite on va importer les dépendances nécessaires

import type React from "react";

import { useState } from "react"; // pour gérer l'état local du composant
import { useRouter } from "next/navigation"; // pour naviguer entre les pages (partie next.js)
import { useAuth } from "@/lib/auth-context"; // pour gérer l'authentification
import { createStory } from "@/lib/firebase/firestore"; // pour créer une nouvelle histoire dans Firestore
// ensuite on va importer les composants UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthCheck from "@/components/auth-check";

// import { dancingScript } from "../layout";
//const dancingScript = Dancing_Script({ weight: "400", subsets: ["latin"] });

// Définition du composant principal
export default function CreateStoryPage() {
  // gestion des états locaux du composant avec useState
  const [title, setTitle] = useState(""); // état pour le titre de l'histoire
  const [content, setContent] = useState(""); // état pour le contenu de l'histoire
  const [description, setDescription] = useState(""); // état pour la description de l'histoire
  const [genre, setGenre] = useState(""); // état pour le genre de l'histoire
  const [error, setError] = useState(""); // état pour les messages d'erreur
  const [isLoading, setIsLoading] = useState(false); // état pour le chargement

  // récupération de l'utilisateur connecté et du router avec useAuth et useRouter (partie next.js)
  const { user } = useAuth();
  const router = useRouter();

  // fonction pour gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to create a story");
      return;
    }

    if (!title || !description || !genre) {
      setError("Please fill out all fields");
      return;
    }

    // Store the form data in localStorage
    localStorage.setItem(
      "pendingStory",
      JSON.stringify({
        title,
        description,
        genre,
        status: "draft" as const,
      })
    );

    // Redirect to the write page
    router.push("/write");
  };

  // rendu du composant
  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto bg-gradient-to-b from-green-50 to-emerald-100 shadow-lg rounded-3xl backdrop-blur-md border border-green-200/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-semibold text-emerald-900">
              Create a New Story
            </CardTitle>
            <CardDescription className="text-emerald-700">
              Share your creativity with the world
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert
                variant="destructive"
                className="mb-4 bg-red-100 text-red-800 border-red-300 rounded-xl"
              >
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-emerald-900 font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your story title"
                  required
                  className="border-green-300 focus:ring-green-500 focus:border-green-500 rounded-xl px-4 py-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre" className="text-emerald-900 font-medium">
                  Genre
                </Label>
                <Input
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g., Fantasy, Romance, Sci-Fi"
                  required
                  className="border-green-300 focus:ring-green-500 focus:border-green-500 rounded-xl px-4 py-2"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-emerald-900 font-medium"
                >
                  Story Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a brief summary of your story..."
                  className="min-h-[100px] border-green-300 focus:ring-green-500 focus:border-green-500 bg-white rounded-xl px-4 py-2"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-xl transition-all shadow-md"
                disabled={isLoading}
              >
                Start Writing
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthCheck>
  );
}
