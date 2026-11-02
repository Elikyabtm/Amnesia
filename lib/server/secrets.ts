// Server-only module: never import this file from a client component.
// The values below must never reach the browser bundle (.next/static).

export const ADMIN_PASSWORD = process.env.AMNESIA_ADMIN_PASSWORD ?? "BSM1832#14041967!";
export const GUEST_PASSWORD = process.env.AMNESIA_GUEST_PASSWORD ?? "Bourg1832";

// PIN codes of the locked items, keyed by item id
export const ITEM_PINS: Record<string, string> = {
  confidential: process.env.AMNESIA_CONFIDENTIAL_PIN ?? "2015",
};

// Breakdown of the admin password shown on the end screen, once won
export const ADMIN_PASSWORD_PARTS = [
  { value: "BSM", label: "initiales de la ville" },
  { value: "1832", label: "année de fondation" },
  { value: "#", label: "le dièse du jazz" },
  { value: "14041967", label: "date de naissance" },
  { value: "!", label: "ponctuation finale" },
];

// Elements checked to give the player partial feedback on a wrong attempt.
// Each element is matched case-insensitively anywhere in the attempt.
export const ADMIN_PASSWORD_ELEMENTS: string[][] = [
  ["BSM"],
  ["1832"],
  ["14041967"],
  ["#", "!"], // both symbols are needed for this element to count
];
