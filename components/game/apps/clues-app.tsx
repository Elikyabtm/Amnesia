"use client";

import { useState } from "react";
import { BookOpen, User, Calendar, MapPin, Key, Lightbulb, Search, ExternalLink } from "lucide-react";
import { resolveClueSource } from "@/lib/clue-sources";
import { useGame, type ClueItem } from "@/lib/game-context";

const GUEST_HINTS = [
  "Votre ancien mot de passe a été noté quelque part... puis jeté.",
  "Ouvrez la corbeille : certains fichiers n'auraient pas dû y rester.",
  "Le journal des connexions dans Documents mentionne l'ancien mot de passe.",
];

const ADMIN_HINTS = [
  "Le nouveau mot de passe est \"plus personnel\" : relisez les échanges avec le Service IT.",
  "Les initiales de votre ville sont gravées sur plusieurs photos.",
  "Quelle année votre ville a-t-elle été fondée ?",
  "Un symbole musical revient souvent : regardez la photo du concert de jazz.",
  "Votre date de naissance, au format JJMMAAAA, termine le mot de passe... suivie d'un point d'exclamation.",
];

const categoryConfig = {
  identity: { label: "Identité", icon: User, color: "#0078d4" },
  date: { label: "Dates", icon: Calendar, color: "#dc2626" },
  place: { label: "Lieux", icon: MapPin, color: "#00a86b" },
  password: { label: "Mot de passe", icon: Key, color: "#f59e0b" },
};

export function CluesApp() {
  const { clues, accountLevel, openWindow } = useGame();

  const openSource = (clue: ClueItem) => {
    if (!clue.ref) return;
    const source = resolveClueSource(clue.ref, clue.highlight);
    if (source) openWindow(source.app, source.title, source.content, source.target);
  };
  const [hintsShown, setHintsShown] = useState(0);
  const hints = accountLevel === "locked" ? GUEST_HINTS : ADMIN_HINTS;
  const hintsKey = accountLevel === "locked" ? "guest" : "admin";
  const [hintStage, setHintStage] = useState(hintsKey);
  if (hintStage !== hintsKey) {
    setHintStage(hintsKey);
    setHintsShown(0);
  }
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClues = clues.filter((clue) => {
    const matchesCategory = !selectedCategory || clue.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      clue.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clue.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedClues = filteredClues.reduce((acc, clue) => {
    if (!acc[clue.category]) acc[clue.category] = [];
    acc[clue.category].push(clue);
    return acc;
  }, {} as Record<string, ClueItem[]>);

  return (
    <div className="h-full flex flex-col bg-[#1f1f1f]">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#0078d4]/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#0078d4]" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">Carnet d'indices</h2>
            <p className="text-sm text-white/50">Cliquez sur un indice pour ouvrir sa source · {clues.length} indice{clues.length > 1 ? "s" : ""} découvert{clues.length > 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un indice..."
            className="w-full pl-10 pr-4 py-2 bg-[#2d2d2d] border border-white/10 rounded text-white placeholder-white/40 outline-none focus:border-[#0078d4]"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              !selectedCategory
                ? "bg-[#0078d4] text-white"
                : "bg-[#2d2d2d] text-white/70 hover:text-white"
            }`}
          >
            Tous
          </button>
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            const count = clues.filter((c) => c.category === key).length;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                  selectedCategory === key
                    ? "text-white"
                    : "bg-[#2d2d2d] text-white/70 hover:text-white"
                }`}
                style={selectedCategory === key ? { backgroundColor: config.color } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {config.label}
                {count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-black/20 rounded text-xs">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clues list */}
      <div className="flex-1 overflow-auto p-4">
        {clues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/40">
            <Lightbulb className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center">Aucun indice découvert</p>
            <p className="text-sm text-center mt-2">
              Explorez les fichiers, emails et photos<br />
              pour découvrir des indices sur votre identité
            </p>
          </div>
        ) : filteredClues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/40">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p>Aucun résultat trouvé</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedClues).map(([category, categoryClues]) => {
              const config = categoryConfig[category as keyof typeof categoryConfig];
              const Icon = config.icon;
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                    <span className="text-sm font-medium text-white/80">{config.label}</span>
                  </div>
                  <div className="space-y-2">
                    {categoryClues.map((clue) => {
                      const canOpen = !!clue.ref;
                      return (
                        <button
                          key={clue.id}
                          type="button"
                          disabled={!canOpen}
                          onClick={() => openSource(clue)}
                          title={canOpen ? "Ouvrir le document source" : undefined}
                          className="group w-full text-left p-3 bg-[#2d2d2d] rounded-lg border-l-2 hover:bg-[#353535] transition-colors disabled:cursor-default enabled:cursor-pointer"
                          style={{ borderLeftColor: config.color }}
                        >
                          <p className="text-white text-sm">{clue.text}</p>
                          <div className="flex items-center justify-between mt-2 gap-2">
                            <span className="text-xs text-white/40 flex items-center gap-1 min-w-0">
                              <span className="truncate">Source : {clue.source}</span>
                              {canOpen && (
                                <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </span>
                            <span className="text-xs text-white/30 flex-shrink-0">
                              {clue.discoveredAt.toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Progressive hints */}
      <div className="p-4 border-t border-white/10 bg-[#2d2d2d]/50">
        <div className="flex items-start gap-3">
          <Key className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-white/80 font-medium">
                {accountLevel === "locked" ? "Objectif : compte invité" : "Objectif : compte administrateur"}
              </p>
              {hintsShown < hints.length && (
                <button
                  onClick={() => setHintsShown((n) => n + 1)}
                  className="text-xs px-2 py-1 rounded bg-[#f59e0b]/20 text-[#f59e0b] hover:bg-[#f59e0b]/30 transition-colors flex-shrink-0"
                >
                  Indice ({hintsShown}/{hints.length})
                </button>
              )}
            </div>
            {hintsShown === 0 ? (
              <p className="text-xs text-white/50 mt-1">
                Bloqué ? Demandez un indice — ils deviennent de plus en plus précis.
              </p>
            ) : (
              <ol className="text-xs text-white/60 mt-2 space-y-1 list-decimal list-inside">
                {hints.slice(0, hintsShown).map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
