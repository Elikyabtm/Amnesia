// Événement 6 : appel de Marie à mi-partie (pas d'échec possible).
import { PhoneIncoming } from "lucide-react";
import { registerEvent } from "./event-registry";
import { MarieCall } from "../minigames/marie-call";

registerEvent({
  id: "marie",
  title: "Appel entrant — Marie (épouse)",
  icon: PhoneIncoming,
  backdrop: "dim",
  intro: "📞 Le téléphone du bureau sonne.\nSur l'écran : « Marie (épouse) ».",
  startLabel: "Décrocher",
  successText: "Appel terminé.",
  miniGame: MarieCall,
  countsAsMiniGame: false,
  canFail: false,
  onStart: (game) => {
    game.addNotification({ title: "Appel entrant", message: "Marie (épouse) vous appelle.", icon: "system" });
  },
});
