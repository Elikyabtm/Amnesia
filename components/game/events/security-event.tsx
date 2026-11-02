// Événement 5 : questions de sécurité du service informatique (après 4 indices).
import { ShieldAlert } from "lucide-react";
import { registerEvent } from "./event-registry";
import { SecurityQuestions } from "../minigames/security-questions";

registerEvent({
  id: "security",
  title: "Activité inhabituelle détectée",
  icon: ShieldAlert,
  backdrop: "dim",
  intro:
    "Le service informatique de la mairie a remarqué une activité inhabituelle sur ce poste : beaucoup de fichiers ouverts en peu de temps.\n\nPour conserver l'accès, confirmez votre identité en répondant à 3 questions de sécurité.",
  startLabel: "Répondre aux questions",
  successText: "Identité confirmée. Le service informatique vous remercie de votre vigilance.",
  miniGame: SecurityQuestions,
  countsAsMiniGame: true,
  canFail: true,
});
