"use client";

import { useEffect } from "react";
import { useGame } from "@/lib/game-context";

/** Écran noir "Arrêt en cours..." / "Redémarrage..." avant l'étape suivante. */
export function PowerScreen() {
  const { gamePhase, finishPowerTransition } = useGame();
  const label = gamePhase === "restarting" ? "Redémarrage..." : "Arrêt en cours...";

  useEffect(() => {
    const timer = setTimeout(finishPowerTransition, 1800);
    return () => clearTimeout(timer);
  }, [finishPowerTransition]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 select-none">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <p className="text-white/80 text-lg font-light">{label}</p>
    </div>
  );
}
