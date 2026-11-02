// Retrouve le document d'où vient un indice, pour le rouvrir depuis le carnet.

import type { AppType, ClueRef, MailFolderId, WindowTarget } from "./game-context";
import {
  audioMemos,
  browserHistory,
  corbeille,
  deletedMails,
  documents,
  favoriteMails,
  mails,
  notes,
  photos,
  secretDocuments,
  secretMails,
  sentMails,
  voiceMessages,
  type FileItem,
} from "./game-data";

export const ALL_FILES: FileItem[] = [...documents, ...photos, ...notes, ...audioMemos, ...corbeille, ...secretDocuments];

/** Dossier d'origine d'un email (avant tout déplacement par le joueur). */
export function baseMailFolder(mailId: string): MailFolderId | null {
  if ([...mails, ...secretMails].some((m) => m.id === mailId)) return "inbox";
  if (favoriteMails.some((m) => m.id === mailId)) return "archive";
  if (sentMails.some((m) => m.id === mailId)) return "sent";
  if (deletedMails.some((m) => m.id === mailId)) return "trash";
  return null;
}

export function findMail(mailId: string): FileItem | undefined {
  return [...mails, ...secretMails, ...sentMails, ...favoriteMails, ...deletedMails].find((m) => m.id === mailId);
}

export interface ClueSourceTarget {
  app: AppType;
  title?: string;
  content?: FileItem;
  target: WindowTarget;
}

/** Fenêtre à ouvrir pour afficher la source d'un indice, ou null si introuvable. */
export function resolveClueSource(ref: ClueRef, highlight?: string | string[]): ClueSourceTarget | null {
  const target: WindowTarget = { id: ref.id, highlight };
  switch (ref.kind) {
    case "file": {
      const file = ALL_FILES.find((f) => f.id === ref.id);
      if (!file) return null;
      return { app: file.type === "image" ? "photos" : "notepad", title: file.name, content: file, target };
    }
    case "mail":
      return findMail(ref.id) ? { app: "mail", target } : null;
    case "voice":
      return voiceMessages.some((v) => v.id === ref.id) ? { app: "audio", target } : null;
    case "page":
      return browserHistory.some((p) => p.id === ref.id) ? { app: "browser", target } : null;
    case "event":
      return { app: "calendar", target };
  }
}

/** Premier passage de `candidates` présent dans `content` (pour le surlignage). */
export function pickPassage(content: string, ...candidates: string[]): string | undefined {
  return candidates.find((c) => content.includes(c));
}
