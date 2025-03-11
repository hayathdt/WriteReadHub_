// 1. IMPORTATIONS ESSENTIELLES
import type React from "react"; // nécessaire pour le typage des composants React pour TypeScript
import type { Metadata } from "next"; // type metadata de next-js - permet de gérer les métadonnées SEO ed manière typée
import "./globals.css"; // importation des styles globaux - contient les styles Tailwind et personnalisés
import { AuthProvider } from "@/lib/auth-context"; // contexte d'authentification - gestion de l'état  de connexion gloable de l'application
import Navbar from "@/components/navbar"; // composant de la barre de navigation - header qui sera présent surr toutes les pages

// 2. CONFIGURATION DE LA POLICE
import { Inter, Roboto, Alata } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({ weight: "400", subsets: ["latin"] });
const alata = Alata({ weight: "400", subsets: ["latin"] });
export { inter, roboto, alata };

// 3. CONFIGURATION DES METADONNEES SEO
// ces métadonnées sont utilisées par les moteurs de recherche pour décrire votre site web et ses pages.
export const metadata: Metadata = {
  title: "WriteReadHub - A Modern Story Platform",
  description:
    "Share and discover amazing stories from writers around the world",
  keywords: "stories, writing, reading, community, platform",
  authors: [{ name: "WriteReadHub", url: "https://www.writereadhub.com" }],
  creator: "hayat",
  // openGraph est un objet qui contient les métadonnées pour les réseaux sociaux
  // openGraph: {
  //   title: "WriteReadHub - A Modern Story Platform",
  //   description:
  //     "Share and discover amazing stories from writers around the world",
  //   url: "",
  //   siteName: "WriteReadHub",
  //   images: [
  //     {
  //       url: "",
  //       width: 1200,
  //       height: 630,
  //       alt: "WriteReadHub - A Modern Story Platform",
  //     },
  //   ],
  //   locale: "en_US",
  //   type: "website",
  // }
};

// 4. COMPOSANT DU LAYOUT PRINCIPAL
//  ce composant enveloppe toutes les pages de l'application et fournit un contexte d'authentification global
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // configuration de la langue - important pour l'accessibilité ausssi
    <html lang="en" className="h-full">
      <body className={`${alata.className} h-full`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#1A2F14] to-greenSauge">
            <Navbar />
            <main className="flex-grow flex flex-col">{children}</main>
            <footer className="py-6 border-t bg-greenSauge border-greenSauge">
              <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} WriteReadHub. All rights reserved.
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
