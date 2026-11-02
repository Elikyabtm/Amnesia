// Types partagés du système d'événements (phase 4).

export type GameEventId = "battery" | "update" | "popups" | "wifi" | "security" | "marie";

/** Événements tirés au sort : 1 ou 2 par partie */
export const RANDOM_EVENT_POOL: GameEventId[] = ["update", "popups", "wifi"];

export interface PlannedEvent {
  id: GameEventId;
  /** Temps de jeu (ms) à partir duquel il peut se déclencher */
  at: number;
}

export interface EventsState {
  /** Événements aléatoires prévus pour cette partie */
  plan: PlannedEvent[];
  /** Événements déjà joués (dans l'ordre) */
  done: GameEventId[];
  /** Temps de jeu (ms) à la fin du dernier événement */
  lastEventEnd: number | null;
  /** Batterie : rechargée et branchée après l'événement */
  batteryResolved: boolean;
  /** Alertes batterie déjà affichées */
  batteryWarned: number[];
  /** Statistiques des mini-jeux */
  stats: { played: number; firstTry: number; skipped: number };
}

export const INITIAL_EVENTS_STATE: EventsState = {
  plan: [],
  done: [],
  lastEventEnd: null,
  batteryResolved: false,
  batteryWarned: [],
  stats: { played: 0, firstTry: 0, skipped: 0 },
};
