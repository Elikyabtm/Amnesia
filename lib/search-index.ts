// Index de recherche du "PC" : applications, fichiers, emails, mémos vocaux,
// pages web et événements. Ne renvoie que ce que le joueur a le droit de voir
// à ce stade (dossier confidentiel, emails secrets, transcriptions écoutées).

import type { AccountLevel, AppType, ClueRef } from "./game-context";
import {
  audioMemos,
  browserHistory,
  calendarEvents,
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
} from "./game-data";

export type SearchCategory = "app" | "file" | "mail" | "voice" | "page" | "event";

export interface SearchResult {
  key: string;
  category: SearchCategory;
  title: string;
  /** Emplacement affiché sous le titre (dossier, boîte mail...) */
  location: string;
  /** Extrait autour du passage trouvé */
  snippet?: string;
  /** Passage trouvé, tel qu'écrit dans le document (pour le surlignage) */
  match?: string;
  /** Application à ouvrir (catégorie "app") */
  app?: AppType;
  /** Document à ouvrir et passage à surligner */
  ref?: ClueRef;
  fileType?: "image" | "file" | "audio";
  score: number;
}

export interface SearchContext {
  accountLevel: AccountLevel;
  confidentialUnlocked: boolean;
  listenedVoiceIds: string[];
  apps: { id: AppType; label: string; keywords?: string[] }[];
}

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function originalMatch(text: string, query: string): string | undefined {
  const idx = normalize(text).indexOf(normalize(query));
  return idx < 0 ? undefined : text.slice(idx, idx + query.length);
}

function snippetAround(text: string, query: string, radius = 40): string | undefined {
  const idx = normalize(text).indexOf(normalize(query));
  if (idx < 0) return undefined;
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  return (start > 0 ? "…" : "") + text.slice(start, end).replace(/\s+/g, " ").trim() + (end < text.length ? "…" : "");
}

/** Score : titre qui commence par la requête > titre qui la contient > contenu */
function scoreOf(title: string, body: string, query: string): number {
  const t = normalize(title);
  const q = normalize(query);
  if (t.startsWith(q)) return 3;
  if (t.includes(q)) return 2;
  if (normalize(body).includes(q)) return 1;
  return 0;
}

export function searchEverything(rawQuery: string, ctx: SearchContext): SearchResult[] {
  const query = rawQuery.trim();
  if (query.length < 2) return [];
  const results: SearchResult[] = [];

  const push = (r: Omit<SearchResult, "score" | "snippet" | "match">, body: string) => {
    const score = scoreOf(r.title, body, query);
    if (score === 0) return;
    const inBody = normalize(body).includes(normalize(query));
    results.push({
      ...r,
      score,
      snippet: score === 1 ? snippetAround(body, query) : undefined,
      match: inBody ? originalMatch(body, query) : undefined,
    });
  };

  // Applications
  for (const app of ctx.apps) {
    push({ key: `app-${app.id}`, category: "app", title: app.label, location: "Application", app: app.id }, (app.keywords ?? []).join(" "));
  }

  // Fichiers
  const fileGroups: { items: typeof documents; location: string }[] = [
    { items: documents, location: "Documents" },
    { items: photos, location: "Photos" },
    { items: notes, location: "Notes" },
    { items: audioMemos, location: "Mémos vocaux" },
    { items: corbeille, location: "Corbeille" },
  ];
  if (ctx.confidentialUnlocked) fileGroups.push({ items: secretDocuments, location: "Dossier Confidentiel" });
  for (const group of fileGroups) {
    for (const f of group.items) {
      push(
        {
          key: `file-${f.id}`,
          category: "file",
          title: f.name,
          location: group.location,
          ref: { kind: "file", id: f.id },
          fileType: f.type === "image" ? "image" : f.type === "audio" ? "audio" : "file",
        },
        f.content ?? ""
      );
    }
  }

  // Emails (les emails secrets n'arrivent qu'après la connexion)
  const mailGroups = [
    { items: ctx.accountLevel === "locked" ? mails : [...secretMails, ...mails], location: "Boîte de réception" },
    { items: favoriteMails, location: "Favoris" },
    { items: sentMails, location: "Envoyés" },
    { items: deletedMails, location: "Corbeille du courrier" },
  ];
  for (const group of mailGroups) {
    for (const m of group.items) {
      push({ key: `mail-${m.id}`, category: "mail", title: m.name, location: group.location, ref: { kind: "mail", id: m.id } }, m.content ?? "");
    }
  }

  // Mémos vocaux : la transcription n'est cherchable qu'une fois écoutée
  for (const v of voiceMessages) {
    const listened = ctx.listenedVoiceIds.includes(v.id);
    push(
      { key: `voice-${v.id}`, category: "voice", title: v.name, location: `Messages vocaux · ${v.from}`, ref: { kind: "voice", id: v.id } },
      listened ? v.transcript : v.from
    );
  }

  // Historique du navigateur
  for (const page of browserHistory) {
    push({ key: `page-${page.id}`, category: "page", title: page.title, location: page.url, ref: { kind: "page", id: page.id } }, page.content);
  }

  // Calendrier
  for (const e of calendarEvents) {
    push({ key: `event-${e.event}`, category: "event", title: e.event, location: `Calendrier · ${e.date}`, ref: { kind: "event", id: e.event } }, e.date);
  }

  return results.sort((a, b) => b.score - a.score);
}
