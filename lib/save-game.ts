// Sauvegarde de la partie dans localStorage.
// Toutes les lectures/écritures sont protégées : en navigation privée ou si le
// stockage est bloqué, le jeu fonctionne simplement sans sauvegarde.

import type { AccountLevel, ClueItem, DesktopFolder, MailFolderId, Notification } from "./game-context";
import type { FileItem } from "./game-data";
import type { PasswordPart } from "./verify-client";

const SAVE_KEY = "amnesia-save-v1";

export interface SaveData {
  version: 1;
  savedAt: string;
  gamePhase: "exploring" | "won";
  /** Ordinateur éteint via "Arrêter" : le rechargement ramène à l'écran titre */
  poweredOff?: boolean;
  accountLevel: AccountLevel;
  elapsedMs: number;
  passwordAttempts: number;
  suspicionLevel: number;
  clues: (Omit<ClueItem, "discoveredAt"> & { discoveredAt: string })[];
  unlockedItemIds: string[];
  secretsDiscovered: string[];
  readMailIds: string[];
  listenedVoiceIds?: string[];
  notificationHistory?: (Omit<Notification, "timestamp"> & { timestamp: string })[];
  seenNotificationIds?: string[];
  trash?: { restored: string[]; emptied: boolean };
  browserBookmarks?: string[];
  userFiles?: FileItem[];
  mail?: {
    folderOverrides: Record<string, MailFolderId>;
    starred: string[];
    composed: FileItem[];
  };
  desktop?: {
    wallpaper: string;
    iconPositions: Record<string, { x: number; y: number }>;
    folders: DesktopFolder[];
  };
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
