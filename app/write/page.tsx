"use client"; // Nécessaire pour les composants React utilisant des hooks

// Import des dépendances principales
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context"; // Contexte d'authentification
import { createStory, updateStory, getStory } from "@/lib/firebase/firestore"; // Interactions Firebase
import Editor from "../create-story/editor"; // Composant éditeur personnalisé
import { Button } from "@/components/ui/button"; // Composants UI
import { AlertCircle } from "lucide-react"; // Icônes
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthCheck from "@/components/auth-check"; // Protection de route

// Définition du composant principal
export default function WritePage() {
  // États locaux gérés avec useState :
  const [content, setContent] = useState(""); // Contenu de l'article
  const [error, setError] = useState(""); // Messages d'erreur
  const [isSaving, setIsSaving] = useState(false); // État de sauvegarde
  const [story, setStory] = useState<any>(null); // Données de l'article existant

  // Récupération des infos d'authentification et routing
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams.get("id"); // ID d'article depuis l'URL

  // useEffect pour charger un article existant
  useEffect(() => {
    if (storyId) {
      const loadStory = async () => {
        try {
          const loadedStory = await getStory(storyId);
          // Vérification que l'utilisateur est l'auteur
          if (loadedStory && loadedStory.authorId === user?.uid) {
            setStory(loadedStory);
            setContent(loadedStory.content); // Pré-remplir l'éditeur
          }
        } catch (err: any) {
          setError("Échec du chargement de l'article");
        }
      };
      loadStory();
    }
  }, [storyId, user?.uid]); // Déclenché quand l'ID ou l'utilisateur change

  // Gestion de la sauvegarde (brouillon/publication)
  const handleSave = async (status: "draft" | "published") => {
    if (!user) return; // Sécurité supplémentaire

    setIsSaving(true);
    setError("");

    try {
      if (storyId) {
        // Mise à jour existante
        await updateStory(storyId, {
          content,
          status,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Création nouvelle histoire
        const storyData = JSON.parse(
          localStorage.getItem("pendingStory") || "{}"
        );
        await createStory({
          ...storyData, // Récupère les données précédentes
          content,
          status,
          authorId: user.uid,
          authorName: user.displayName || "Anonyme",
          createdAt: new Date().toISOString(),
        });
      }

      localStorage.removeItem("pendingStory");
      router.push("/"); // Redirection après succès
    } catch (err: any) {
      setError(err.message || "Échec de la sauvegarde");
    } finally {
      setIsSaving(false); // Réinitialisation de l'état
    }
  };

  // Rendu du composant
  return (
    <AuthCheck>
      {" "}
      {/* Protection de route */}
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-emerald-900">
              {storyId ? "Éditer l'article" : "Écrire un nouvel article"}
            </h1>
            <div className="space-x-4">
              <Button
                onClick={() => handleSave("draft")}
                className="bg-black hover:bg-gray-800 text-white"
                disabled={isSaving}
              >
                Enregistrer comme brouillon
              </Button>
              <Button
                onClick={() => handleSave("published")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isSaving}
              >
                {isSaving ? "Sauvegarde..." : "Publier"}
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
