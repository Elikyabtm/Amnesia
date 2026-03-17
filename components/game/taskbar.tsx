"use client";

import { useState, useEffect } from "react";
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
  Battery,
  ChevronUp
} from "lucide-react";
import { useGame, type AppType } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

const apps: { id: AppType; icon: typeof FolderOpen; label: string }[] = [
  { id: "explorer", icon: FolderOpen, label: "Explorateur" },
  { id: "mail", icon: Mail, label: "Courrier" },
  { id: "photos", icon: Image, label: "Photos" },
  { id: "notepad", icon: FileText, label: "Bloc-notes" },
  { id: "calendar", icon: Calendar, label: "Calendrier" },
  { id: "trash", icon: Trash2, label: "Corbeille" },
];

export function Taskbar() {
  const [time, setTime] = useState(new Date());
  const { openWindow, windows, focusWindow, restoreWindow } = useGame();
  const { playSound } = useSound();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAppClick = (appId: AppType) => {
    playSound("click");
    
    // Check if there's already a window for this app
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-[#1f1f1f]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-center px-2 z-[1000]">
      {/* Start button and search */}
      <div className="absolute left-2 flex items-center gap-1">
        <button className="p-2 hover:bg-white/10 rounded transition-colors">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z"/>
          </svg>
        </button>
        <button className="p-2 hover:bg-white/10 rounded transition-colors">
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
        <div className="flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded transition-colors cursor-default">
          <Wifi className="w-4 h-4" />
          <Volume2 className="w-4 h-4" />
          <Battery className="w-4 h-4" />
        </div>
        <div className="flex flex-col items-end px-2 py-0.5 hover:bg-white/10 rounded transition-colors cursor-default text-xs">
          <span>{formatTime(time)}</span>
          <span className="text-white/50">{formatDate(time)}</span>
        </div>
      </div>
    </div>
  );
}
