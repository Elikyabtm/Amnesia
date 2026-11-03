// Réglages du rythme des événements (phase 4).

const MIN = 60_000;

/** Écart minimal entre la fin d'un événement et le début du suivant */
export const EVENT_COOLDOWN_MS = 3 * MIN;
/** Aucun événement avant ce temps de jeu (le joueur découvre le bureau) */
export const FIRST_EVENT_MIN_MS = 2 * MIN;
/** Nombre maximal d'événements par partie */
export const MAX_EVENTS_PER_GAME = 5;
/** Durée pour que la batterie passe de 100 % à 0 % (écran noir vers 9 min) */
export const BATTERY_DRAIN_MS = 9 * MIN;
/** Seuils d'alerte batterie */
export const BATTERY_WARNING_LEVEL = 20;
export const BATTERY_DIM_LEVEL = 10;
/** Appel de Marie "à mi-partie" */
export const MARIE_CALL_AT_MS = 7 * MIN;
/** Questions de sécurité : après ce nombre d'indices trouvés */
export const SECURITY_QUESTIONS_AFTER_CLUES = 4;
/** Fenêtres de déclenchement des événements aléatoires (1er et 2e) */
export const RANDOM_EVENT_WINDOWS: [number, number][] = [
  [4 * MIN, 6 * MIN],
  [12 * MIN, 15 * MIN],
];
/** Pénalité de suspicion quand on passe un mini-jeu */
export const SKIP_PENALTY = 15;
/** Nombre d'échecs avant de proposer "Passer" */
export const FAILS_BEFORE_SKIP = 2;
