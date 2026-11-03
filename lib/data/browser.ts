// Historique de recherche et favoris du navigateur de Bernard.
// Les dates sont antérieures au 20 février 2025 (date du jeu) et cohérentes
// avec l'histoire : changement de mot de passe le 3/02, RDV cardiologue le
// 13/02, enquête du journaliste, compte suisse.

export interface SearchHistoryEntry {
  query: string;
  date: string;
  /** Pages de l'historique proposées en résultat */
  results: string[];
}

export const SEARCH_HISTORY: SearchHistoryEntry[] = [
  { query: "banque helvetia genève horaires", date: "18 février 2025, 22:47", results: [] },
  { query: "le phare antoine garnier journaliste", date: "16 février 2025, 23:12", results: ["web5"] },
  { query: "cardiologue bourg-sur-mer dr martin", date: "12 février 2025, 08:05", results: [] },
  { query: "restaurant le phare réservation", date: "10 février 2025, 18:30", results: [] },
  { query: "symbole dièse clavier azerty", date: "3 février 2025, 08:02", results: ["web7"] },
  { query: "mot de passe robuste exemple anssi", date: "3 février 2025, 07:58", results: ["web7"] },
  { query: "discours anniversaire ville idées", date: "1 février 2025, 21:15", results: ["web1", "web6"] },
];

/** Recherche qui donne un indice quand on consulte l'historique */
export const CLUE_SEARCH = "symbole dièse clavier azerty";

/** Favoris présents au démarrage */
export const DEFAULT_BOOKMARKS = ["web1", "web5", "web8"];
