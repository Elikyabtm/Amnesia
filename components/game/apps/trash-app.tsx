"use client";

import { useState, useRef, useCallback } from "react";
import { Trash2, FileText, RefreshCw, Lock, ShieldAlert } from "lucide-react";
import { corbeille, type FileItem } from "@/lib/game-data";
import { useGame, type WindowState } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

interface TrashAppProps {
  window: WindowState;
}

export function TrashApp({ window: win }: TrashAppProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(0);
  const { openWindow, isItemLocked, tryUnlockItem, lockedItems, addClue } = useGame();
  const { playSound } = useSound();
  const lastClickRef = useRef<{ id: string; time: number } | null>(null);

  const isLocked = isItemLocked("trash");
  const trashLockInfo = lockedItems.find((i) => i.id === "trash");

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tryUnlockItem("trash", pinInput)) {
      playSound("open");
      setPinInput("");
      setPinError(false);
      addClue({
        category: "password",
        text: "La corbeille contenait des informations sur le format du mot de passe",
        source: "Corbeille déverrouillée",
      });
    } else {
      playSound("error");
      setPinError(true);
      setPinAttempts((a) => a + 1);
      setTimeout(() => setPinError(false), 500);
    }
  };

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

  if (isLocked) {
    return (
      <div className="flex flex-col h-full bg-[#1a1a1a]">
        {/* Lock screen */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-amber-500" />
          </div>
          
          <h2 className="text-xl font-semibold text-white mb-2">Corbeille protégée</h2>
          <p className="text-white/60 text-sm text-center mb-6 max-w-xs">
            Cette corbeille est protégée par un code PIN à 4 chiffres.
          </p>
          
          <form onSubmit={handlePinSubmit} className="w-full max-w-xs">
            <div className="relative mb-4">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                placeholder="____"
                className={`w-full text-center text-2xl tracking-[0.5em] py-3 px-4 bg-[#252525] border rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
                  pinError 
                    ? "border-red-500 ring-red-500/50 animate-shake" 
                    : "border-white/20 focus:ring-[#0078d4] focus:border-[#0078d4]"
                }`}
              />
            </div>
            
            <button
              type="submit"
              disabled={pinInput.length !== 4}
              className="w-full py-2.5 bg-[#0078d4] text-white rounded-lg font-medium hover:bg-[#0066b8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Déverrouiller
            </button>
          </form>

          {pinAttempts >= 2 && trashLockInfo && (
            <div className="mt-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg max-w-xs">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-500/90">
                  Indice : {trashLockInfo.hint}
                </p>
              </div>
            </div>
          )}

          {pinAttempts > 0 && (
            <p className="mt-4 text-xs text-red-400">
              {pinAttempts} tentative{pinAttempts > 1 ? "s" : ""} échouée{pinAttempts > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    );
  }

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
