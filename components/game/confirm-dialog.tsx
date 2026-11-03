"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Boîte de confirmation modale, style Windows. Échap annule ; Entrée active le
 * bouton qui a le focus (Annuler par défaut pour une action destructrice).
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = "Annuler",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onMouseDown={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm mx-4 bg-[#202020] border border-white/15 rounded-lg shadow-2xl overflow-hidden animate-fade-in"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-[#2b2b2b] border-b border-white/10">
          <span id="confirm-title" className="text-sm text-white">{title}</span>
          <button onClick={onCancel} className="p-1 rounded hover:bg-red-500 transition-colors" aria-label="Fermer">
            <X className="w-3.5 h-3.5 text-white/80" />
          </button>
        </div>
        <div className="p-5 flex gap-4">
          <AlertTriangle className={`w-8 h-8 flex-shrink-0 ${danger ? "text-amber-400" : "text-[#4ea8ff]"}`} />
          <p className="text-sm text-white/80 leading-relaxed">{message}</p>
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            autoFocus={danger}
            className="px-4 py-1.5 text-sm rounded bg-white/10 hover:bg-white/15 text-white transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            autoFocus={!danger}
            className={`px-4 py-1.5 text-sm rounded text-white transition-colors ${
              danger ? "bg-red-600 hover:bg-red-500" : "bg-[#0078d4] hover:bg-[#1084d8]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
