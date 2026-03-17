"use client";

import { useState, useEffect, useRef } from "react";
import { 
  FolderOpen, 
  Mail, 
  Image, 
  FileText, 
  Calendar, 
  Trash2,
  Search,
  Wifi,
  Volume2,
  VolumeX,
  Battery,
  ChevronUp,
  Settings,
  Power,
  User,
  Globe,
  Lock,
  X
} from "lucide-react";
import { useGame, type AppType } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { fileSystem, mails, notes, corbeille } from "@/lib/game-data";

const apps: { id: AppType; icon: typeof FolderOpen; label: string }[] = [
  { id: "explorer", icon: FolderOpen, label: "Explorateur" },
  { id: "mail", icon: Mail, label: "Courrier" },
  { id: "photos", icon: Image, label: "Photos" },
  { id: "notepad", icon: FileText, label: "Bloc-notes" },
  { id: "calendar", icon: Calendar, label: "Calendrier" },
  { id: "trash", icon: Trash2, label: "Corbeille" },
];

const startMenuApps = [
  { id: "explorer" as AppType, icon: FolderOpen, label: "Explorateur de fichiers" },
  { id: "mail" as AppType, icon: Mail, label: "Courrier" },
  { id: "photos" as AppType, icon: Image, label: "Photos" },
  { id: "notepad" as AppType, icon: FileText, label: "Bloc-notes" },
  { id: "calendar" as AppType, icon: Calendar, label: "Calendrier" },
  { id: "browser" as AppType, icon: Globe, label: "Navigateur" },
  { id: "password" as AppType, icon: Lock, label: "Changement MDP" },
];

export function Taskbar() {
  const [time, setTime] = useState(new Date());
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { openWindow, windows, focusWindow, restoreWindow, accountLevel } = useGame();
  const { playSound, volume, setVolume, isMuted, toggleMute } = useSound();
  const startMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (startMenuRef.current && !startMenuRef.current.contains(e.target as Node)) {
        setShowStartMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
      if (volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
        setShowVolumeSlider(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAppClick = (appId: AppType) => {
    playSound("click");
    
    const existingWindow = windows.find((w) => w.app === appId);
    
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        restoreWindow(existingWindow.id);
      } else {
        focusWindow(existingWindow.id);
      }
    } else {
      playSound("open");
      openWindow(appId);
    }
  };

  const handleStartMenuAppClick = (appId: AppType) => {
    setShowStartMenu(false);
    playSound("click");
    playSound("open");
    openWindow(appId);
  };

  // Search functionality
  const searchResults = searchQuery.trim() ? [
    ...fileSystem.flatMap(folder => 
      folder.children?.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.content?.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []
    ),
    ...mails.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    ...notes.filter(n => 
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  ].slice(0, 6) : [];

  const handleSearchResultClick = (item: typeof searchResults[0]) => {
    setShowSearch(false);
    setSearchQuery("");
    playSound("click");
    
    if (item.type === "mail") {
      openWindow("mail");
    } else if (item.type === "image") {
      openWindow("photos");
    } else {
      openWindow("notepad", item.name, item);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <>
      {/* Start Menu */}
      {showStartMenu && (
        <div 
          ref={startMenuRef}
          className="fixed bottom-14 left-2 w-80 bg-[#202020]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-[2000] animate-fade-in overflow-hidden"
        >
          {/* User section */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0078d4] flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Bernard Dupuis</p>
                <p className="text-white/50 text-xs">
                  {accountLevel === "admin" ? "Administrateur" : accountLevel === "guest" ? "Invité" : "Non connecté"}
                </p>
              </div>
            </div>
          </div>

          {/* Apps grid */}
          <div className="p-3">
            <p className="text-white/50 text-xs mb-2 px-1">Applications</p>
            <div className="grid grid-cols-3 gap-1">
              {startMenuApps.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => handleStartMenuAppClick(id)}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-6 h-6 text-white/80" />
                  <span className="text-white/70 text-xs text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom actions */}
          <div className="p-2 border-t border-white/10 flex justify-between">
            <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/10 transition-colors text-white/70 text-sm">
              <Settings className="w-4 h-4" />
              Paramètres
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/10 transition-colors text-white/70 text-sm">
              <Power className="w-4 h-4" />
              Arrêter
            </button>
          </div>
        </div>
      )}

      {/* Search Panel */}
      {showSearch && (
        <div 
          ref={searchRef}
          className="fixed bottom-14 left-14 w-96 bg-[#202020]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-[2000] animate-fade-in overflow-hidden"
        >
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Rechercher des fichiers, emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/40"
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-white/50 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="p-2 max-h-80 overflow-y-auto">
            {searchQuery.trim() === "" ? (
              <p className="text-white/40 text-sm text-center py-4">Tapez pour rechercher...</p>
            ) : searchResults.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-4">Aucun résultat pour &quot;{searchQuery}&quot;</p>
            ) : (
              <div className="space-y-1">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSearchResultClick(item)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                  >
                    {item.type === "mail" ? (
                      <Mail className="w-5 h-5 text-blue-400" />
                    ) : item.type === "image" ? (
                      <Image className="w-5 h-5 text-green-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-yellow-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{item.name}</p>
                      <p className="text-white/40 text-xs truncate">
                        {item.content?.slice(0, 50)}...
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
        <div className="flex items-center gap-1 bg-[#2d2d2d]/50 rounded-lg px-2 py-1">
          {apps.map(({ id, icon: Icon, label }) => {
            const hasWindow = windows.some((w) => w.app === id);
            const isMinimized = windows.some((w) => w.app === id && w.isMinimized);
            
            return (
              <button
                key={id}
                onClick={() => handleAppClick(id)}
                className={`relative p-2.5 rounded transition-all group ${
                  hasWindow 
                    ? "bg-white/10 hover:bg-white/15" 
                    : "hover:bg-white/10"
                }`}
                title={label}
              >
                <Icon className={`w-5 h-5 ${hasWindow ? "text-white" : "text-white/70"}`} />
                
                {/* Active indicator */}
                {hasWindow && (
                  <div 
                    className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all ${
                      isMinimized ? "w-1 bg-white/50" : "w-4 bg-[#0078d4]"
                    }`}
                  />
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#2d2d2d] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {label}
                </div>
              </button>
            );
          })}
        </div>

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
