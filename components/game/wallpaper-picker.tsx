"use client";

import { Check } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { WALLPAPERS } from "@/lib/data/wallpapers";

/** Grille de fonds d'écran (Personnaliser, Paramètres > Personnalisation). */
export function WallpaperPicker() {
  const { wallpaper, setWallpaper } = useGame();
  const { playSound } = useSound();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {WALLPAPERS.map((w) => {
        const active = w.id === wallpaper;
        return (
          <button
            key={w.id}
            onClick={() => {
              playSound("click");
              setWallpaper(w.id);
            }}
            className={`group text-left rounded-lg overflow-hidden border-2 transition-colors ${
              active ? "border-[#4ea8ff]" : "border-transparent hover:border-white/30"
            }`}
            aria-pressed={active}
          >
            <div className="relative h-20" style={{ background: w.background }}>
              {active && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#0078d4] flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </span>
              )}
            </div>
            <p className="px-2 py-1.5 text-xs text-white/80 bg-black/30 truncate">{w.label}</p>
          </button>
        );
      })}
    </div>
  );
}
