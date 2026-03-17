"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { FolderOpen, Mail, Image, FileText, Calendar, Trash2, Lock, Globe, BookOpen, Mic } from "lucide-react";
import { useGame, type AppType } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

interface DesktopIconData {
  id: AppType;
  icon: typeof FolderOpen;
  label: string;
  color: string;
}

const defaultIcons: DesktopIconData[] = [
  { id: "explorer", icon: FolderOpen, label: "Documents", color: "#f4c542" },
  { id: "mail", icon: Mail, label: "Courrier", color: "#0078d4" },
  { id: "photos", icon: Image, label: "Photos", color: "#00a86b" },
  { id: "browser", icon: Globe, label: "Navigateur", color: "#00bcf2" },
  { id: "audio", icon: Mic, label: "Messages", color: "#9333ea" },
  { id: "notepad", icon: FileText, label: "Bloc-notes", color: "#6b7280" },
  { id: "calendar", icon: Calendar, label: "Calendrier", color: "#dc2626" },
  { id: "clues", icon: BookOpen, label: "Indices", color: "#f97316" },
  { id: "trash", icon: Trash2, label: "Corbeille", color: "#6b7280" },
  { id: "password", icon: Lock, label: "Deverrouiller", color: "#22c55e" },
];

interface IconPosition {
  id: string;
  x: number;
  y: number;
}

export function DesktopIcons() {
  const { openWindow } = useGame();
  const { playSound } = useSound();
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [iconPositions, setIconPositions] = useState<IconPosition[]>([]);
  const lastClickRef = useRef<{ id: string; time: number } | null>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  // Initialize icon positions in a grid
  useEffect(() => {
    const positions: IconPosition[] = defaultIcons.map((icon, index) => {
      const col = Math.floor(index / 5);
      const row = index % 5;
      return {
        id: icon.id,
        x: 16 + col * 90,
        y: 16 + row * 90,
      };
    });
    setIconPositions(positions);
  }, []);

  const getIconPosition = (id: string) => {
    return iconPositions.find((p) => p.id === id) || { x: 16, y: 16 };
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    playSound("click");
    setSelectedIcon(id);

    const pos = getIconPosition(id);
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return;

      const deltaX = moveEvent.clientX - dragRef.current.startX;
      const deltaY = moveEvent.clientY - dragRef.current.startY;

      // Only start dragging after a small threshold to differentiate from clicks
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setIconPositions((prev) =>
          prev.map((p) =>
            p.id === dragRef.current?.id
              ? {
                  ...p,
                  x: Math.max(0, Math.min(window.innerWidth - 80, dragRef.current.initialX + deltaX)),
                  y: Math.max(0, Math.min(window.innerHeight - 140, dragRef.current.initialY + deltaY)),
                }
              : p
          )
        );
      }
    };

    const handleMouseUp = () => {
      // Check for double-click after drag ends
      const now = Date.now();
      const lastClick = lastClickRef.current;

      if (lastClick && lastClick.id === id && now - lastClick.time < 300) {
        playSound("open");
        openWindow(id as AppType);
        lastClickRef.current = null;
      } else {
        lastClickRef.current = { id, time: now };
      }

      dragRef.current = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [openWindow, playSound, iconPositions]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none">
      {defaultIcons.map(({ id, icon: Icon, label, color }) => {
        const pos = getIconPosition(id);
        return (
          <button
            key={id}
            data-desktop-icon={id}
            onMouseDown={(e) => handleMouseDown(e, id)}
            className={`absolute flex flex-col items-center gap-1 p-2 rounded transition-colors w-20 ${
              selectedIcon === id
                ? "bg-white/20 ring-1 ring-white/30"
                : "hover:bg-white/10"
            }`}
            style={{
              left: pos.x,
              top: pos.y,
            }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="w-7 h-7" style={{ color }} />
            </div>
            <span className="text-xs text-white text-center leading-tight drop-shadow-lg">
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
