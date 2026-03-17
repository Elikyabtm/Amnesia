"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Folder, 
  FileText, 
  Image, 
  RefreshCw, 
  Settings, 
  Info, 
  Copy, 
  Trash2,
  Eye,
  ExternalLink
} from "lucide-react";
import { useGame, type AppType } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

interface ContextMenuProps {
  children: React.ReactNode;
}

interface MenuPosition {
  x: number;
  y: number;
}

interface MenuItem {
  label: string;
  icon: typeof Folder;
  action: () => void;
  divider?: boolean;
}

export function ContextMenuProvider({ children }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const [menuType, setMenuType] = useState<"desktop" | "file">("desktop");
  const { openWindow } = useGame();
  const { playSound } = useSound();

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    playSound("click");
    
    const target = e.target as HTMLElement;
    const isDesktopIcon = target.closest("[data-desktop-icon]");
    
    setMenuType(isDesktopIcon ? "file" : "desktop");
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  }, [playSound]);

  const handleClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClick);
    };
  }, [handleContextMenu, handleClick]);

  const desktopMenuItems: MenuItem[] = [
    { 
      label: "Affichage", 
      icon: Eye, 
      action: () => {} 
    },
    { 
      label: "Actualiser", 
      icon: RefreshCw, 
      action: () => window.location.reload(),
      divider: true
    },
    { 
      label: "Nouveau dossier", 
      icon: Folder, 
      action: () => {} 
    },
    { 
      label: "Nouveau document", 
      icon: FileText, 
      action: () => openWindow("notepad"),
      divider: true
    },
    { 
      label: "Parametres d'affichage", 
      icon: Settings, 
      action: () => {} 
    },
    { 
      label: "Proprietes", 
      icon: Info, 
      action: () => {} 
    },
  ];

  const fileMenuItems: MenuItem[] = [
    { 
      label: "Ouvrir", 
      icon: ExternalLink, 
      action: () => {} 
    },
    { 
      label: "Ouvrir avec...", 
      icon: Folder, 
      action: () => {},
      divider: true
    },
    { 
      label: "Copier", 
      icon: Copy, 
      action: () => {} 
    },
    { 
      label: "Supprimer", 
      icon: Trash2, 
      action: () => {},
      divider: true
    },
    { 
      label: "Proprietes", 
      icon: Info, 
      action: () => {} 
    },
  ];

  const menuItems = menuType === "desktop" ? desktopMenuItems : fileMenuItems;

  // Adjust position to keep menu in viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 200),
    y: Math.min(position.y, window.innerHeight - (menuItems.length * 36 + 16)),
  };

  return (
    <>
      {children}
      
      {isOpen && (
        <div
          className="fixed z-[5000] min-w-[180px] bg-[#2d2d2d]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl py-1 animate-fade-in"
          style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index}>
                <button
                  onClick={() => {
                    playSound("click");
                    item.action();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4 text-white/50" />
                  {item.label}
                </button>
                {item.divider && (
                  <div className="my-1 border-t border-white/10" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
