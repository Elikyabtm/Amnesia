"use client";

import { useState, useRef, useCallback } from "react";
import { Trash2, FileText, RefreshCw } from "lucide-react";
import { corbeille, type FileItem } from "@/lib/game-data";
import { useGame, type WindowState } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

interface TrashAppProps {
  window: WindowState;
}

export function TrashApp({ window: win }: TrashAppProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { openWindow } = useGame();
  const { playSound } = useSound();
  const lastClickRef = useRef<{ id: string; time: number } | null>(null);

  const handleItemClick = useCallback((item: FileItem) => {
    playSound("click");
    setSelectedItem(item.id);
    
    const now = Date.now();
    const lastClick = lastClickRef.current;
    
    if (lastClick && lastClick.id === item.id && now - lastClick.time < 300) {
      playSound("open");
      openWindow("notepad", item.name, item);
      lastClickRef.current = null;
    } else {
      lastClickRef.current = { id: item.id, time: now };
    }
  }, [openWindow, playSound]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-white/10 bg-[#252525]">
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 rounded transition-colors">
          <Trash2 className="w-4 h-4" />
          Vider la corbeille
        </button>
        <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
          <RefreshCw className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        {corbeille.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40">
            <Trash2 className="w-16 h-16 mb-4 opacity-50" />
            <p>La corbeille est vide</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {corbeille.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                  selectedItem === item.id
                    ? "bg-[#0078d4]/30 ring-1 ring-[#0078d4]"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="w-12 h-12 flex items-center justify-center opacity-60">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <span className="text-xs text-white/60 text-center line-clamp-2">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="px-4 py-2 border-t border-white/10 bg-[#1f1f1f] text-xs text-white/50">
        {corbeille.length} élément{corbeille.length > 1 ? "s" : ""} supprimé{corbeille.length > 1 ? "s" : ""}
      </div>
    </div>
  );
}
