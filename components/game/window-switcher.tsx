"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/game-context";
import { APPS } from "./app-registry";

/**
 * Sélecteur de fenêtres façon Alt+Tab.
 * Le système intercepte souvent Alt+Tab avant le navigateur : Alt+Q fait la
 * même chose partout. Tab/Q avance, Maj recule, relâcher Alt valide, Échap annule.
 */
export function WindowSwitcher() {
  const { windows, activateWindow, gamePhase } = useGame();
  const [index, setIndex] = useState<number | null>(null);
  const indexRef = useRef<number | null>(null);

  // Fenêtres de la plus récente à la plus ancienne
  const ordered = [...windows].sort((a, b) => b.zIndex - a.zIndex);
  const orderedRef = useRef(ordered);
  orderedRef.current = ordered;

  useEffect(() => {
    if (gamePhase !== "exploring") return;

    const setIdx = (i: number | null) => {
      indexRef.current = i;
      setIndex(i);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const isSwitchKey = e.key === "Tab" || e.code === "KeyQ";
      if (!e.altKey || !isSwitchKey) {
        if (e.key === "Escape" && indexRef.current !== null) setIdx(null);
        return;
      }
      const list = orderedRef.current;
      if (list.length === 0) return;
      e.preventDefault();
      const step = e.shiftKey ? -1 : 1;
      const current = indexRef.current;
      // Premier appui : on présélectionne la fenêtre précédente (la 2e)
      const next = current === null ? (list.length > 1 ? 1 : 0) : (current + step + list.length) % list.length;
      setIdx(next);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== "Alt" || indexRef.current === null) return;
      const target = orderedRef.current[indexRef.current];
      if (target) activateWindow(target.id);
      setIdx(null);
    };

    const onBlur = () => setIdx(null);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [gamePhase, activateWindow]);

  if (index === null || ordered.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center pointer-events-none">
      <div className="bg-[#202020]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 max-w-[90vw]">
        <div className="flex flex-wrap justify-center gap-3">
          {ordered.map((w, i) => {
            const app = APPS[w.app];
            const Icon = app.icon;
            return (
              <div
                key={w.id}
                className={`w-32 rounded-lg p-3 flex flex-col items-center gap-2 border-2 transition-colors ${
                  i === index ? "border-[#4ea8ff] bg-white/10" : "border-transparent"
                }`}
              >
                <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${app.color}33` }}>
                  <Icon className="w-8 h-8" style={{ color: app.color }} />
                </div>
                <span className="text-xs text-white text-center line-clamp-2">{w.title}</span>
                {w.isMinimized && <span className="text-[10px] text-white/40 -mt-1">réduite</span>}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[11px] text-white/40">Alt+Tab ou Alt+Q · Maj pour reculer · relâchez Alt pour valider</p>
      </div>
    </div>
  );
}
