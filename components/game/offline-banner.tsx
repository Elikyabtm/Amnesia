"use client";

import { WifiOff } from "lucide-react";
import { useGame } from "@/lib/game-context";

/** Écran "Hors ligne" affiché par les applications qui ont besoin du réseau */
export function OfflineOverlay({ app }: { app: string }) {
  const { networkOnline } = useGame();
  if (networkOnline) return null;
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-[#1b1b1b]/95 text-center p-6">
      <WifiOff className="w-12 h-12 text-white/40" />
      <p className="text-lg text-white">Hors ligne</p>
      <p className="text-sm text-white/50 max-w-sm">
        {app} a besoin d&apos;une connexion Internet. Vérifiez la connexion Wi-Fi « Mairie-BSM » dans la zone de notifications.
      </p>
    </div>
  );
}
