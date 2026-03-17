"use client";

import { useState } from "react";
import { BookOpen, User, Calendar, MapPin, Key, Lightbulb, Search } from "lucide-react";
import { useGame, type ClueItem } from "@/lib/game-context";

const categoryConfig = {
  identity: { label: "Identite", icon: User, color: "#0078d4" },
  date: { label: "Dates", icon: Calendar, color: "#dc2626" },
  place: { label: "Lieux", icon: MapPin, color: "#00a86b" },
  password: { label: "Mot de passe", icon: Key, color: "#f59e0b" },
};

export function CluesApp() {
  const { clues } = useGame();
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
            <p className="text-sm text-white/50">{clues.length} indice{clues.length > 1 ? "s" : ""} decouvert{clues.length > 1 ? "s" : ""}</p>
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
            <p className="text-center">Aucun indice decouvert</p>
            <p className="text-sm text-center mt-2">
              Explorez les fichiers, emails et photos<br />
              pour decouvrir des indices sur votre identite
            </p>
          </div>
        ) : filteredClues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/40">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p>Aucun resultat trouve</p>
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
                    {categoryClues.map((clue) => (
                      <div
                        key={clue.id}
                        className="p-3 bg-[#2d2d2d] rounded-lg border-l-2 hover:bg-[#353535] transition-colors"
                        style={{ borderLeftColor: config.color }}
                      >
                        <p className="text-white text-sm">{clue.text}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-white/40">
                            Source: {clue.source}
                          </span>
                          <span className="text-xs text-white/30">
                            {clue.discoveredAt.toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Password hint section */}
      {clues.length >= 3 && (
        <div className="p-4 border-t border-white/10 bg-[#2d2d2d]/50">
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white/80 font-medium">Indice mot de passe</p>
              <p className="text-xs text-white/50 mt-1">
                Le mot de passe combine plusieurs informations personnelles...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
