"use client"; // Cette ligne est très importante - elle indique à Next.js que ce composant doit être exécuté côté client
// C'est nécessaire car nous utilisons des états (useState) et des interactions utilisateur

// importations des jooks Reac et Next.js
import type React from "react";

import { useState } from "react"; // pour gérer les états
import { useRouter } from "next/navigation"; // pour naviguer entre les pages
import Link from "next/link"; // pour créer des liens de navigation
import { useAuth } from "@/lib/auth-context"; // hook personnalisé  pour gérer l'authentification

// imports des compasant UI réutilisables qui viennent de la bibliothèque UI
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

export default function LoginPage() {
  // déclaration des états locaux gérés avec useState
  const [email, setEmail] = useState(""); // pour stocker l'email saisi
  const [password, setPassword] = useState(""); // pour stocker le mot de passe saisi
  const [error, setError] = useState(""); // pour gérer les messages d'erreur
  const [isLoading, setIsLoading] = useState(false); // pour gérer l'état de chargement

  // récupération des fonctions d'authentification et de navigation depuis le contexte d'authentification
  const { login } = useAuth(); // fonction de connexion depuis le context d'authentification
  const router = useRouter(); // fonction pour la redirection(navigation) après la connexion réussie

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // emppêche le rechargement de la page (car c'est le comportement par défaut du formulaire)
    setError(""); // rréinitialise le message d'erreur
    setIsLoading(true); // active l'état de chargement pour désactiver le bouton de connexion

    try {
      // tentative de connexion avec les informations saisies
      await login(email, password);
      router.push("/"); // redirection vers la page d'accueil après la connexion réussie
    } catch (err: any) {
      // gestion des erreurs
      setError(err.message || "Failed to login");
    } finally {
      // désactive l'état de chargement Dans tous les cas, y compris en cas d'erreur
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      {/* Card principale du formulaire */}
      <Card className="w-full max-w-md">
        {/* En-tête du formulaire */}
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
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

          {/* Formulaire de connexion */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champ Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Mise à jour de l'état email
                required
              />
            </div>

            {/* Champ Mot de passe avec lien "Mot de passe oublié" */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password">Forgot password?</Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Mise à jour de l'état password
                required
              />
            </div>

            {/* Bouton de soumission */}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>

        {/* Pied de page avec lien d'inscription */}
        <CardFooter className="flex justify-center">
          <p>
            Don&apos;t have an account? <Link href="/signup">Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
