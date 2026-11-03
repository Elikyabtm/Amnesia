"use client";

// Détection des indices et secrets à l'ouverture d'un fichier (Explorateur,
// Terminal). Logique déplacée telle quelle depuis l'Explorateur.

import { useCallback } from "react";
import { secretDocuments, type FileItem } from "./game-data";
import { useGame } from "./game-context";
import { pickPassage } from "./clue-sources";

export function useFileClueDetector() {
  const { addClue, addSuspicion, discoverSecret } = useGame();

  return useCallback((item: FileItem) => {
    const content = item.content || "";
    
    if (content.includes("14 avril 1967") || content.includes("jour de ma naissance")) {
      addClue({
        category: "date",
        text: "Date de naissance : 14 avril 1967",
        source: item.name,
        ref: { kind: "file", id: item.id },
        highlight: pickPassage(content, "14 avril 1967", "jour de ma naissance"),
      });
    }
    if (content.includes("1832") && (content.includes("Bourg") || content.includes("fondation"))) {
      addClue({
        category: "place",
        text: "Bourg-sur-Mer fondée en 1832",
        source: item.name,
        ref: { kind: "file", id: item.id },
        highlight: "1832",
      });
    }
    if (content.includes("Maire") || content.includes("maire")) {
      addClue({
        category: "identity",
        text: "Vous êtes le Maire de Bourg-sur-Mer",
        source: item.name,
        ref: { kind: "file", id: item.id },
        highlight: pickPassage(content, "Maire", "maire"),
      });
    }
    if (content.includes("fondation ville") && content.includes("date naissance")) {
      addClue({
        category: "password",
        text: "Format du mot de passe : [fondation ville] + [date naissance]",
        source: item.name,
        ref: { kind: "file", id: item.id },
        highlight: "fondation ville",
      });
    }
    if (content.includes("Bourg1832")) {
      addClue({
        category: "password",
        text: "L'ancien mot de passe était 'Bourg1832' - trop simple",
        source: item.name,
        ref: { kind: "file", id: item.id },
        highlight: "Bourg1832",
      });
    }
    if (content.includes("Bernard Dupuis")) {
      addClue({
        category: "identity",
        text: "Votre nom est Bernard Dupuis",
        source: item.name,
        ref: { kind: "file", id: item.id },
        highlight: "Bernard Dupuis",
      });
    }

    if (content.includes("BSM")) {
      addClue({
        category: "place",
        text: "BSM = initiales de Bourg-sur-Mer",
        source: item.name,
        ref: { kind: "file", id: item.id },
        highlight: "BSM",
      });
    }

    // Secret files raise suspicion and count toward the ending
    if (secretDocuments.some((d) => d.id === item.id)) {
      addSuspicion({
        type: "sensitive_file",
        amount: 15,
        message: `Accès au fichier sensible: ${item.name}`,
      });
      discoverSecret(item.id);
    }
  }, [addClue, addSuspicion, discoverSecret]);
}
