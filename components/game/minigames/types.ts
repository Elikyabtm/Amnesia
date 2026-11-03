// Interface commune à tous les mini-jeux d'événements.

export interface MiniGameProps {
  /** Le joueur a réussi */
  onSuccess: () => void;
  /** Le joueur a échoué (temps écoulé, mauvaise réponse...) : raison affichée */
  onFail: (reason: string) => void;
  /** Numéro de la tentative (0 = première) */
  attempt: number;
}
