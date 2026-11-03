// Outils de dates partagés (Calendrier, mini-calendrier de la barre des tâches).

const MONTH_INDEX: Record<string, number> = {
  janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11,
};

export const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

/** "14 avril 2025" -> { day: 14, month: 3, year: 2025 } */
export function parseEventDate(text: string) {
  const match = text.toLowerCase().match(/^(\d{1,2})\s+(\S+)\s+(\d{4})$/);
  if (!match) return null;
  const month = MONTH_INDEX[match[2]];
  if (month === undefined) return null;
  return { day: Number(match[1]), month, year: Number(match[3]) };
}

/** Cases d'un mois (semaine commençant le lundi), null pour les cases vides */
export function monthGrid(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1).getDay();
  const offset = (first + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  return [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
}
