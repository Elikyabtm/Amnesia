"use client";

import { useState } from "react";
import { Lock, ShieldAlert, X } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

interface FolderLockDialogProps {
  folderId: string;
  folderName: string;
  onUnlock: () => void;
  onClose: () => void;
}

export function FolderLockDialog({ folderId, folderName, onUnlock, onClose }: FolderLockDialogProps) {
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(0);
  const { tryUnlockItem, lockedItems, addClue } = useGame();
  const { playSound } = useSound();

  const lockInfo = lockedItems.find((i) => i.id === folderId);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tryUnlockItem(folderId, pinInput)) {
      playSound("open");
      setPinInput("");
      setPinError(false);
      addClue({
        category: "password",
        text: "Le dossier confidentiel contient des secrets compromettants",
        source: "Dossier Confidentiel déverrouillé",
      });
      onUnlock();
    } else {
      playSound("error");
      setPinError(true);
      setPinAttempts((a) => a + 1);
      setTimeout(() => setPinError(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/20 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#252525] border-b border-white/10">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-white">Dossier protégé</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">{folderName}</h2>
            <p className="text-white/60 text-sm text-center">
              Ce dossier est protégé par un code PIN à 4 chiffres.
            </p>
          </div>
          
          <form onSubmit={handlePinSubmit}>
            <div className="relative mb-4">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                placeholder="____"
                autoFocus
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

          {pinAttempts >= 2 && lockInfo && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-500/90">
                  Indice : {lockInfo.hint}
                </p>
              </div>
            </div>
          )}

          {pinAttempts > 0 && (
            <p className="mt-3 text-xs text-red-400 text-center">
              {pinAttempts} tentative{pinAttempts > 1 ? "s" : ""} échouée{pinAttempts > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
