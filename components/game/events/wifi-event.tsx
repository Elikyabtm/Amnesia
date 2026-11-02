// Événement 4 : coupure Wi-Fi (Navigateur et Courrier hors ligne).
import { WifiOff } from "lucide-react";
import { registerEvent } from "./event-registry";
import { PipesGame } from "../minigames/pipes-game";

registerEvent({
  id: "wifi",
  title: "Connexion Wi-Fi perdue",
  icon: WifiOff,
  backdrop: "dim",
  intro:
    "Le réseau « Mairie-BSM » vient de tomber : le Navigateur et le Courrier sont hors ligne.\n\nL'outil de diagnostic propose de reconfigurer la liaison. Faites pivoter les tuyaux pour relier la box à l'ordinateur.",
  startLabel: "Lancer le diagnostic réseau",
  successText: "Liaison rétablie avec la box. Connecté à « Mairie-BSM ».",
  miniGame: PipesGame,
  countsAsMiniGame: true,
  canFail: true,
  onStart: (game) => {
    game.setNetworkOnline(false);
    game.addNotification({ title: "Réseau", message: "Connexion à « Mairie-BSM » perdue. Vous êtes hors ligne.", icon: "system" });
  },
  onEnd: (game) => {
    game.setNetworkOnline(true);
    game.addNotification({ title: "Réseau", message: "Connecté à « Mairie-BSM ».", icon: "system" });
  },
});
