"use client";

import { useState, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import { StartMenu } from "./start-menu";
import { SearchPanel } from "./search-panel";
import { SystemTray } from "./system-tray";
import { TaskbarApps } from "./taskbar-apps";
import { useSound } from "@/hooks/use-sound";

export function Taskbar() {
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { playSound } = useSound();
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const closeStartMenu = useCallback(() => setShowStartMenu(false), []);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const closeSearch = useCallback(() => setShowSearch(false), []);

  return (
    <>
      <StartMenu open={showStartMenu} onClose={closeStartMenu} toggleRef={startButtonRef} />

      <SearchPanel open={showSearch} onClose={closeSearch} toggleRef={searchButtonRef} />

      {/* Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-[#1f1f1f]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-center px-2 z-[1000]">
        {/* Start button and search */}
        <div className="absolute left-2 flex items-center gap-1">
          <button 
            ref={startButtonRef}
            aria-label="Démarrer"
            onClick={() => {
              playSound("click");
              setShowStartMenu(!showStartMenu);
              setShowSearch(false);
            }}
            className={`p-2 rounded transition-colors ${showStartMenu ? "bg-white/15" : "hover:bg-white/10"}`}
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z"/>
            </svg>
          </button>
          <button 
            ref={searchButtonRef}
            aria-label="Rechercher"
            onClick={() => {
              playSound("click");
              setShowSearch(!showSearch);
              setShowStartMenu(false);
            }}
            className={`p-2 rounded transition-colors ${showSearch ? "bg-white/15" : "hover:bg-white/10"}`}
          >
            <Search className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Center apps */}
        <TaskbarApps />

        {/* System tray */}
        <SystemTray />
      </div>
    </>
  );
}
