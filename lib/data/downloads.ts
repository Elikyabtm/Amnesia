// Fichiers du dossier Téléchargements de Bernard.
// Cohérents avec l'histoire : réunion sécurité du 28/01/2025, festival de
// jazz du port, anniversaire de mariage au restaurant Le Phare le 15 avril.

import type { FileItem } from "../game-data";

export const downloads: FileItem[] = [
  {
    id: "dl1",
    name: "Memo_ServiceIT_mots_de_passe.txt",
    type: "file",
    content: `SERVICE INFORMATIQUE — MAIRIE DE BOURG-SUR-MER
Mémo diffusé après la réunion sécurité du 28/01/2025

ERREURS FRÉQUENTES CONSTATÉES DANS LES SERVICES :

1. Un mot + une année : "Mairie2025", "Phare1856"...
   -> Deviné en quelques secondes.

2. Format "fondation ville + date naissance" sans aucun symbole.
   -> Mieux, mais encore trop prévisible pour un élu dont la date
      de naissance est publique.

NOS CONSEILS :
- Ajoutez au moins un symbole au milieu ET un à la fin.
- Mélangez lettres, chiffres et symboles.
- Ne notez jamais votre mot de passe sur un post-it !

Contact : informatique@bourg-sur-mer.fr — poste 214`,
  },
  {
    id: "dl2",
    name: "Programme_Festival_Jazz_BSM_2024.pdf",
    type: "file",
    content: `FESTIVAL JAZZ BSM 2024 — Port de Bourg-sur-Mer

Vendredi 12 juillet
  20h00  Les Marins du Swing
  22h00  Quartet du Phare

Samedi 13 juillet
  19h00  Scène ouverte des écoles de musique
  21h30  "Do dièse" — Trio jazz manouche

Dimanche 14 juillet
  18h00  Concert de clôture sur le quai

Entrée libre. Programme établi avec M. le Maire, grand amateur de jazz.`,
  },
  {
    id: "dl3",
    name: "Confirmation_reservation_Le_Phare.pdf",
    type: "file",
    content: `RESTAURANT LE PHARE — Quai des Pêcheurs, Bourg-sur-Mer

Confirmation de réservation

Nom : M. et Mme Dupuis
Date : mardi 15 avril 2025, 19h00
Couverts : 2
Table : terrasse, vue sur le port

Commentaire : anniversaire de mariage (32 ans).
Le chef prépare un dessert surprise.`,
  },
];
