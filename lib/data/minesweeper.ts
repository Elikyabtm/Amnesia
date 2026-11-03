// Démineur : niveaux et meilleurs scores de Bernard (signés "BSM",
// les initiales de sa ville, comme ses mots de passe).

export type MinesweeperLevel = "beginner" | "intermediate";

export const LEVELS: Record<MinesweeperLevel, { label: string; rows: number; cols: number; mines: number }> = {
  beginner: { label: "Débutant", rows: 9, cols: 9, mines: 10 },
  intermediate: { label: "Intermédiaire", rows: 16, cols: 16, mines: 40 },
};

export interface MinesweeperScore {
  name: string;
  seconds: number;
  date: string;
}

export const DEFAULT_BEST_SCORES: Record<MinesweeperLevel, MinesweeperScore> = {
  beginner: { name: "BSM", seconds: 18, date: "03/02/2025" },
  intermediate: { name: "BSM", seconds: 83, date: "14/04/2024" },
};

export const MINESWEEPER_CLUE = "Les records du Démineur sont signés « BSM », les initiales de Bourg-sur-Mer";
