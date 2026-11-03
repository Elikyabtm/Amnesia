// Easter eggs de la Calculatrice : un nombre affiché déclenche un message.

export interface CalculatorEasterEgg {
  value: string;
  message: string;
  /** Indice ajouté au carnet (optionnel) */
  clue?: { category: "identity" | "date" | "place" | "password"; text: string };
}

export const CALCULATOR_EASTER_EGGS: CalculatorEasterEgg[] = [
  {
    value: "1832",
    message: "BSM ⚓ Fondée en 1832",
    clue: { category: "place", text: "La Calculatrice associe 1832 à « BSM » : l'année de fondation et les initiales de la ville" },
  },
  { value: "58", message: "58 ans le 14 avril... déjà ?" },
  { value: "1993", message: "♥ Marie & Bernard — 15 avril 1993" },
];
