// Événement 3 : attaque de pop-ups ("Votre PC est infecté !").
import { ShieldAlert } from "lucide-react";
import { registerEvent } from "./event-registry";
import { PopupGame } from "../minigames/popup-game";

registerEvent({
  id: "popups",
  title: "Votre PC est infecté !",
  icon: ShieldAlert,
  backdrop: "dim",
  intro:
    "Un faux antivirus s'est déclenché et des fenêtres d'alerte s'ouvrent partout.\nFermez-les toutes avec la vraie croix avant qu'elles ne couvrent l'écran.\n\nAttention aux boutons piégés.",
  startLabel: "Fermer les pop-ups",
  successText: "Toutes les fenêtres sont fermées. Le faux antivirus est neutralisé.",
  miniGame: PopupGame,
  countsAsMiniGame: true,
  canFail: true,
  onEnd: (game) => {
    game.addNotification({ title: "Sécurité", message: "Logiciel indésirable supprimé.", icon: "antivirus" });
  },
});
