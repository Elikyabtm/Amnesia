"use client";

import { useEffect, useRef, useState } from "react";
import { useGame, type AppType, type WindowState } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { APPS, PINNED_APPS } from "./app-registry";

/**
 * Zone centrale de la barre des tâches : applications épinglées, puis toute
 * application qui a une fenêtre ouverte. Les fenêtres sont groupées par
 * application ; avec plusieurs fenêtres, un clic ouvre la liste pour choisir.
 */
export function TaskbarApps() {
  const { windows, openWindow, minimizeWindow, activateWindow, activeWindowId } = useGame();
  const { playSound } = useSound();
  const [openList, setOpenList] = useState<AppType | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Ferme la liste des fenêtres au clic à l'extérieur
  useEffect(() => {
    if (!openList) return;
    const onDown = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) setOpenList(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openList]);

  const openApps = [...new Set(windows.map((w) => w.app))].filter((app) => !PINNED_APPS.includes(app));
  const shown: AppType[] = [...PINNED_APPS, ...openApps];

  const handleClick = (appId: AppType, appWindows: WindowState[]) => {
    playSound("click");
    if (appWindows.length === 0) {
      playSound("open");
      openWindow(appId);
      return;
    }
    if (appWindows.length > 1) {
      setOpenList(openList === appId ? null : appId);
      return;
    }
    const win = appWindows[0];
    // Comme sous Windows : clic sur la fenêtre active = la réduire
    if (win.id === activeWindowId && !win.isMinimized) {
      minimizeWindow(win.id);
    } else {
      activateWindow(win.id);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-[#2d2d2d]/50 rounded-lg px-2 py-1">
      {shown.map((appId) => {
        const app = APPS[appId];
        const Icon = app.icon;
        const appWindows = windows.filter((w) => w.app === appId);
        const hasWindow = appWindows.length > 0;
        const isActive = appWindows.some((w) => w.id === activeWindowId && !w.isMinimized);
        const allMinimized = hasWindow && appWindows.every((w) => w.isMinimized);

        return (
          <div key={appId} className="relative" ref={openList === appId ? listRef : undefined}>
            <button
              onClick={() => handleClick(appId, appWindows)}
              className={`relative p-2.5 rounded transition-all group ${
                isActive ? "bg-white/15" : hasWindow ? "bg-white/5 hover:bg-white/15" : "hover:bg-white/10"
              }`}
              title={app.label}
              aria-label={app.label}
            >
              <Icon className={`w-5 h-5 ${hasWindow ? "text-white" : "text-white/70"}`} />

              {hasWindow && (
                <div
                  className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all ${
                    isActive ? "w-4 bg-[#0078d4]" : allMinimized ? "w-1 bg-white/40" : "w-2 bg-white/60"
                  }`}
                />
              )}
              {appWindows.length > 1 && (
                <span className="absolute top-0.5 right-0.5 min-w-3.5 h-3.5 px-0.5 rounded-full bg-[#0078d4] text-[9px] leading-[14px] text-white">
                  {appWindows.length}
                </span>
              )}

              {openList !== appId && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#2d2d2d] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {app.label}
                </div>
              )}
            </button>

            {openList === appId && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-[#202020]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-1 animate-fade-in">
                {appWindows.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      playSound("click");
                      activateWindow(w.id);
                      setOpenList(null);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left text-sm transition-colors ${
                      w.id === activeWindowId && !w.isMinimized ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: app.color }} />
                    <span className="truncate flex-1">{w.title}</span>
                    {w.isMinimized && <span className="text-[10px] text-white/40">réduite</span>}
                  </button>
                ))}
                <button
                  onClick={() => {
                    playSound("open");
                    openWindow(appId);
                    setOpenList(null);
                  }}
                  className="w-full mt-1 border-t border-white/10 px-3 py-2 text-left text-xs text-white/60 hover:text-white hover:bg-white/10 rounded"
                >
                  + Nouvelle fenêtre
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
