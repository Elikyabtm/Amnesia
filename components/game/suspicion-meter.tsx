"use client";

import { Shield, AlertTriangle, Lock } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { SUSPICION_THRESHOLDS } from "@/lib/game-data";
import { cn } from "@/lib/utils";

/** Jauge de suspicion compacte, réutilisée dans la fenêtre Déverrouiller. */
export function SuspicionMeter({ className }: { className?: string }) {
  const { suspicionLevel, isLockedOut, lockoutRemaining } = useGame();

  const level = isLockedOut
    ? "locked"
    : suspicionLevel >= SUSPICION_THRESHOLDS.DANGER
    ? "danger"
    : suspicionLevel >= SUSPICION_THRESHOLDS.WARNING
    ? "warning"
    : "safe";

  const styles = {
    safe: { bar: "bg-emerald-500", text: "text-emerald-700", box: "bg-white border-gray-200", label: "Sécurisé" },
    warning: { bar: "bg-amber-500", text: "text-amber-700", box: "bg-amber-50 border-amber-200", label: "Alerte" },
    danger: { bar: "bg-red-500", text: "text-red-700", box: "bg-red-50 border-red-200", label: "Critique" },
    locked: { bar: "bg-red-600", text: "text-red-700", box: "bg-red-50 border-red-300", label: "Système bloqué" },
  }[level];

  const Icon = level === "locked" ? Lock : level === "safe" ? Shield : AlertTriangle;

  return (
    <div className={cn("rounded-lg border p-3", styles.box, className)}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("w-4 h-4", styles.text)} />
        <span className="text-sm font-medium text-gray-800">Niveau de suspicion</span>
        <span className={cn("ml-auto text-xs font-bold uppercase", styles.text)}>
          {styles.label} · {suspicionLevel}%
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500", styles.bar)}
          style={{ width: `${suspicionLevel}%` }}
        />
      </div>
      {isLockedOut ? (
        <p className="mt-2 text-sm text-red-700 font-medium">
          Trop de tentatives suspectes. Nouvel essai possible dans{" "}
          <span className="font-mono text-base">{lockoutRemaining}</span> s.
        </p>
      ) : (
        <p className="mt-2 text-xs text-gray-500">
          Chaque mauvais mot de passe augmente la jauge (+10). À 100 %, le système se bloque.
        </p>
      )}
    </div>
  );
}
