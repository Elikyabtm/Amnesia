// Événement 2 : mise à jour forcée, bloquée à 47 %.
import { Download } from "lucide-react";
import { registerEvent } from "./event-registry";
import { DefragGame } from "../minigames/defrag-game";

registerEvent({
  id: "update",
  title: "Mise à jour forcée — AmnesiaOS Update",
  icon: Download,
  backdrop: "dim",
  intro:
    "Votre organisation (service informatique de la mairie) a imposé une mise à jour de sécurité.\nL'installation est bloquée à 47 % : le disque est trop fragmenté.\n\nDéfragmentez le disque pour que la mise à jour puisse se terminer.",
  startLabel: "Lancer la défragmentation",
  successText: "Disque défragmenté. La mise à jour reprend... 47 % → 100 %.\nMise à jour installée, aucun redémarrage nécessaire.",
  miniGame: DefragGame,
  countsAsMiniGame: true,
  canFail: true,
  onEnd: (game) => {
    game.addNotification({ title: "AmnesiaOS Update", message: "Mise à jour de sécurité installée avec succès.", icon: "system" });
  },
});
