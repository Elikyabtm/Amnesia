"use client";

import { useGame } from "@/lib/game-context";
import { SUSPICION_THRESHOLDS } from "@/lib/game-data";
import { Shield, AlertTriangle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function SuspicionBar() {
  const { suspicionLevel, isLockedOut, accountLevel } = useGame();

  // Don't show if not exploring
  if (accountLevel === "locked") return null;

  const getColor = () => {
    if (suspicionLevel >= SUSPICION_THRESHOLDS.DANGER) return "bg-red-500";
    if (suspicionLevel >= SUSPICION_THRESHOLDS.WARNING) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getIcon = () => {
    if (isLockedOut) return <Lock className="w-4 h-4 text-red-400" />;
    if (suspicionLevel >= SUSPICION_THRESHOLDS.WARNING) return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <Shield className="w-4 h-4 text-emerald-400" />;
  };

  const getLabel = () => {
    if (isLockedOut) return "SYSTÈME BLOQUÉ";
    if (suspicionLevel >= SUSPICION_THRESHOLDS.DANGER) return "CRITIQUE";
    if (suspicionLevel >= SUSPICION_THRESHOLDS.WARNING) return "ALERTE";
    return "SÉCURISÉ";
  };

  return (
    <div className="fixed top-4 right-4 z-[9999]">
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-lg border backdrop-blur-md transition-all duration-300",
          isLockedOut
            ? "bg-red-950/90 border-red-500/50"
            : suspicionLevel >= SUSPICION_THRESHOLDS.WARNING
            ? "bg-amber-950/90 border-amber-500/50"
            : "bg-slate-900/90 border-slate-700/50"
        )}
      >
        {getIcon()}
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-white/70">Niveau de suspicion</span>
            <span className={cn(
              "text-xs font-bold",
              isLockedOut ? "text-red-400" :
              suspicionLevel >= SUSPICION_THRESHOLDS.DANGER ? "text-red-400" :
              suspicionLevel >= SUSPICION_THRESHOLDS.WARNING ? "text-amber-400" : "text-emerald-400"
            )}>
              {getLabel()}
            </span>
          </div>
          
          <div className="w-32 h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-500", getColor())}
              style={{ width: `${suspicionLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lockout overlay */}
      {isLockedOut && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] flex items-center justify-center">
          <div className="bg-slate-900 border border-red-500/30 rounded-lg p-8 max-w-md text-center animate-fade-in">
            <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Système Bloqué</h2>
            <p className="text-white/60 mb-4">
              Activité suspecte détectée. Le système est temporairement bloqué.
            </p>
            <p className="text-red-400 text-sm">
              Veuillez patienter 10 secondes...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
