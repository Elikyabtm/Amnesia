// Événement 1 : batterie épuisée (écran noir vers 9 min de jeu).
import { BatteryWarning } from "lucide-react";
import { registerEvent } from "./event-registry";
import { CableGame } from "../minigames/cable-game";

registerEvent({
  id: "battery",
  title: "Batterie épuisée",
  icon: BatteryWarning,
  backdrop: "black",
  intro:
    "L'écran s'éteint d'un coup. Batterie : 0 %.\n\nLe chargeur est dans le tiroir du bureau, mais ses câbles sont tout emmêlés. Reliez chaque câble à la bonne prise, sans croiser les fils, avant que l'ordinateur ne perde votre session.",
  startLabel: "Brancher le chargeur",
  successText: "Le chargeur est branché.\nL'ordinateur redémarre... Batterie : 100 %, en charge.",
  miniGame: CableGame,
  countsAsMiniGame: true,
  canFail: true,
  onEnd: (game) => {
    // Chargeur branché (même si le mini-jeu est passé), puis redémarrage
    game.setEventsState((s) => ({ ...s, batteryResolved: true }));
    game.setBatteryCharging(true);
    game.setBatteryLevel(100);
    game.restartComputer();
  },
});
