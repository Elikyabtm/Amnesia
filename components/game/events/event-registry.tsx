// Registre des événements : textes, effets et mini-jeu de chacun.
// Un événement n'est déclenché que s'il est enregistré ici.

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { useGame } from "@/lib/game-context";
import type { GameEventId } from "@/lib/events/types";
import type { MiniGameProps } from "../minigames/types";

export type GameApi = ReturnType<typeof useGame>;
export type EventOutcome = "success" | "skipped";

export interface EventDefinition {
  id: GameEventId;
  title: string;
  icon: LucideIcon;
  /** Texte affiché avant le mini-jeu */
  intro: string;
  /** Libellé du bouton pour commencer */
  startLabel: string;
  /** Texte affiché après la réussite */
  successText: string;
  /** Fond de l'écran pendant l'événement */
  backdrop: "black" | "dim";
  miniGame: ComponentType<MiniGameProps>;
  /** Compte dans les statistiques "mini-jeux réussis du premier coup" */
  countsAsMiniGame: boolean;
  /** Le mini-jeu peut-il échouer ? (sinon pas de "Passer") */
  canFail: boolean;
  onStart?: (api: GameApi) => void;
  onEnd?: (api: GameApi, outcome: EventOutcome) => void;
}

export const EVENT_REGISTRY: Partial<Record<GameEventId, EventDefinition>> = {};

export function registerEvent(def: EventDefinition) {
  EVENT_REGISTRY[def.id] = def;
}
