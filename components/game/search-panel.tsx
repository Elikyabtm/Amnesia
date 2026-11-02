"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, FileText, Image, Mail, Mic, Globe, Calendar, Music } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { searchEverything, type SearchCategory, type SearchResult } from "@/lib/search-index";
import { resolveClueSource } from "@/lib/clue-sources";
import { APPS } from "./app-registry";

const CATEGORY_LABELS: Record<SearchCategory, string> = {
  app: "Applications",
  file: "Fichiers",
  mail: "Emails",
  voice: "Messages vocaux",
  page: "Historique web",
  event: "Calendrier",
};
const CATEGORY_ORDER: SearchCategory[] = ["app", "file", "mail", "voice", "page", "event"];
const MAX_PER_CATEGORY = 5;

interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
  toggleRef: React.RefObject<HTMLElement | null>;
}

export function SearchPanel({ open, onClose, toggleRef }: SearchPanelProps) {
  const { openWindow, accountLevel, lockedItems, listenedVoiceIds } = useGame();
  const { playSound } = useSound();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const confidentialUnlocked = lockedItems.some((i) => i.id === "confidential" && i.unlocked);

  // Résultats groupés par catégorie, dans l'ordre d'affichage
  const groups = useMemo(() => {
    const all = searchEverything(query, {
      accountLevel,
      confidentialUnlocked,
      listenedVoiceIds,
      apps: Object.values(APPS),
    });
    return CATEGORY_ORDER.map((cat) => ({
      category: cat,
      items: all.filter((r) => r.category === cat).slice(0, MAX_PER_CATEGORY),
    })).filter((g) => g.items.length > 0);
  }, [query, accountLevel, confidentialUnlocked, listenedVoiceIds]);
  const flat = groups.flatMap((g) => g.items);

  useEffect(() => setSelected(0), [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onClose, toggleRef]);

  const openResult = (r: SearchResult) => {
    playSound("open");
    if (r.app) {
      openWindow(r.app);
    } else if (r.ref) {
      const source = resolveClueSource(r.ref, r.match);
      if (source) openWindow(source.app, source.title, source.content, source.target);
    }
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (flat.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((i) => (i + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((i) => (i - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      openResult(flat[selected]);
    }
  };

  const iconFor = (r: SearchResult) => {
    if (r.app) {
      const app = APPS[r.app];
      const Icon = app.icon;
      return <Icon className="w-5 h-5" style={{ color: app.color }} />;
    }
    switch (r.category) {
      case "mail": return <Mail className="w-5 h-5 text-blue-400" />;
      case "voice": return <Mic className="w-5 h-5 text-purple-400" />;
      case "page": return <Globe className="w-5 h-5 text-cyan-400" />;
      case "event": return <Calendar className="w-5 h-5 text-red-400" />;
      default:
        return r.fileType === "image" ? <Image className="w-5 h-5 text-green-400" />
          : r.fileType === "audio" ? <Music className="w-5 h-5 text-purple-400" />
          : <FileText className="w-5 h-5 text-yellow-400" />;
    }
  };

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="fixed bottom-14 left-2 w-[min(460px,calc(100vw-16px))] bg-[#202020]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-[2000] animate-fade-in overflow-hidden"
    >
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-[#4ea8ff]">
          <Search className="w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Rechercher des applications, fichiers, emails..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/40"
            autoFocus
            aria-label="Rechercher"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-white/50 hover:text-white" aria-label="Effacer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-2 max-h-[420px] overflow-y-auto">
        {query.trim().length < 2 ? (
          <p className="text-white/40 text-sm text-center py-6">Tapez au moins 2 caractères…</p>
        ) : flat.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-6">Aucun résultat pour « {query} »</p>
        ) : (
          groups.map((group) => (
            <div key={group.category} className="mb-2">
              <p className="px-2 py-1 text-xs text-white/40">{CATEGORY_LABELS[group.category]}</p>
              {group.items.map((r) => {
                const index = flat.indexOf(r);
                return (
                  <button
                    key={r.key}
                    onClick={() => openResult(r)}
                    onMouseEnter={() => setSelected(index)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                      index === selected ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    <span className="flex-shrink-0">{iconFor(r)}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-white text-sm truncate">{r.title}</span>
                      <span className="block text-white/40 text-xs truncate">{r.snippet ?? r.location}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
