// Sauvegarde de la partie dans localStorage.
// Toutes les lectures/écritures sont protégées : en navigation privée ou si le
// stockage est bloqué, le jeu fonctionne simplement sans sauvegarde.

import type { AccountLevel, ClueItem } from "./game-context";
import type { PasswordPart } from "./verify-client";

const SAVE_KEY = "amnesia-save-v1";

export interface SaveData {
  version: 1;
  savedAt: string;
  gamePhase: "exploring" | "won";
  accountLevel: AccountLevel;
  elapsedMs: number;
  passwordAttempts: number;
  suspicionLevel: number;
  clues: (Omit<ClueItem, "discoveredAt"> & { discoveredAt: string })[];
  unlockedItemIds: string[];
  secretsDiscovered: string[];
  readMailIds: string[];
  listenedVoiceIds?: string[];
  revealedPassword: { password: string; parts: PasswordPart[] } | null;
}

export function loadSave(): SaveData | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    if (data?.version !== 1 || (data.gamePhase !== "exploring" && data.gamePhase !== "won")) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeSave(data: SaveData) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // stockage indisponible : on ignore
  }
}

export function clearSave() {
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    // stockage indisponible : on ignore
  }
}
