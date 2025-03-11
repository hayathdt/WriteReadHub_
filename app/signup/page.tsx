"use client"; //1. Cette ligne est très importante - elle indique à Next.js que ce composant doit être exécuté côté client
// C'est nécessaire car nous utilisons des états (useState) et des interactions utilisateur

//2. imports nécessaires pour le composant
import type React from "react";

import { useState } from "react"; // pour gérer l'état local
import { useRouter } from "next/navigation"; // pour naviguer entre les pages
import Link from "next/link"; // pour créer des liens de navigation
import { useAuth } from "@/lib/auth-context"; // hook personnalisé pour l'authentification

// Importation des composants UI réutilisables de l'UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

//3. Définition du composant principal
export default function SignupPage() {
  //4. Déclaration des états avec useState
  const [email, setEmail] = useState(""); // pour stocker l'email saisi
  const [password, setPassword] = useState(""); // pour stocker le mot de passe saisi
  const [displayName, setDisplayName] = useState(""); // pour stocker le nom d'affichage saisi
  const [error, setError] = useState(""); // pour gérer les messages d'erreur
  const [isLoading, setIsLoading] = useState(false); // pour gérer l'état de chargement

  //5. Récupération des fonctions d'authentification et du gestionnaire de navigation
  const { signup } = useAuth(); // fonction d'inscription depuis le contexte d'auth
  const router = useRouter(); // pour naviguer entre les pages

  //6. Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // empêcher le rechargement de la page
    setError(""); // réinitialiser les erreurs
    setIsLoading(true); // activer l'état de chargement

    try {
      // tentative d'inscription
      await signup(email, password, displayName);
      router.push("/"); // rediriger vers la page d'accueil après l'inscription si succes
    } catch (err: any) {
      // gestion des erreurs
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false); // désactiver l'état de chargement
    }
  };

  //7. Rendu du composant
  return (
    //8. Conteneur principal avec mise en page centrée
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md">
        {/* En-tête */}
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Affichage conditionnel des erreurs */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Formulaire avec les champs */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Bouton de soumission avec état de chargement */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>

        {/* Pied de page avec lien vers la connexion */}
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
