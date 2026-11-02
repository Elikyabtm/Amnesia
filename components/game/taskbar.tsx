"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Wifi, Volume2, VolumeX, Battery, ChevronUp } from "lucide-react";
import { StartMenu } from "./start-menu";
import { SearchPanel } from "./search-panel";
import { TaskbarApps } from "./taskbar-apps";
import { useGameClock, gameNow } from "@/lib/game-clock";
import { useSound } from "@/hooks/use-sound";

export function Taskbar() {
  const time = useGameClock() ?? gameNow();
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const { playSound, volume, setVolume, isMuted, toggleMute } = useSound();
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const closeStartMenu = useCallback(() => setShowStartMenu(false), []);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const closeSearch = useCallback(() => setShowSearch(false), []);
  const volumeRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
        setShowVolumeSlider(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <>
      <StartMenu open={showStartMenu} onClose={closeStartMenu} toggleRef={startButtonRef} />

      <SearchPanel open={showSearch} onClose={closeSearch} toggleRef={searchButtonRef} />

      {/* Volume Slider */}
      {showVolumeSlider && (
        <div 
          ref={volumeRef}
          className="fixed bottom-14 right-20 w-48 bg-[#202020]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-[2000] animate-fade-in p-4"
        >
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMute}
              className="text-white/70 hover:text-white transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />
            <span className="text-white/50 text-xs w-8 text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>
      )}

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
        <div className="absolute right-2 flex items-center gap-1 text-white/70">
          <button className="p-1 hover:bg-white/10 rounded transition-colors">
            <ChevronUp className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded transition-colors cursor-pointer">
            <Wifi className="w-4 h-4" />
            <button 
              onClick={() => {
                setShowVolumeSlider(!showVolumeSlider);
                setShowStartMenu(false);
                setShowSearch(false);
              }}
              className="hover:text-white transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <Battery className="w-4 h-4" />
          </div>
          <div className="flex flex-col items-end px-2 py-0.5 hover:bg-white/10 rounded transition-colors cursor-default text-xs">
            <span>{formatTime(time)}</span>
            <span className="text-white/50">{formatDate(time)}</span>
          </div>
        </div>
      </div>
    </>
  );
}
