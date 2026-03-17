"use client";

import { useEffect, useState } from "react";
import { Trophy, RefreshCw, User } from "lucide-react";
import { useSound } from "@/hooks/use-sound";

interface VictoryScreenProps {
  onRestart: () => void;
}

export function VictoryScreen({ onRestart }: VictoryScreenProps) {
  const [showContent, setShowContent] = useState(false);
  const { playSound } = useSound();

  useEffect(() => {
    playSound("success");
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, [playSound]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[3000]">
      <div className={`max-w-lg w-full mx-4 transition-all duration-700 ${
        showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}>
        {/* Success card */}
        <div className="bg-[#1f1f1f] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#0078d4] to-[#00a0ff] p-8 text-center">
            <div className="absolute inset-0 bg-[url('/images/wallpaper.jpg')] opacity-10 bg-cover bg-center" />
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 ring-4 ring-white/30">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Identité retrouvée !
              </h1>
              <p className="text-white/80">
                Vous avez découvert qui vous êtes
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Identity card */}
            <div className="bg-[#252525] rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-[#0078d4] flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Bernard Dupuis</h2>
                  <p className="text-white/60">Maire de Bourg-sur-Mer</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#1a1a1a] rounded p-3">
                  <div className="text-white/50 text-xs mb-1">Date de naissance</div>
                  <div className="text-white">14 avril 1967</div>
                </div>
                <div className="bg-[#1a1a1a] rounded p-3">
                  <div className="text-white/50 text-xs mb-1">Ville</div>
                  <div className="text-white">Bourg-sur-Mer</div>
                </div>
                <div className="bg-[#1a1a1a] rounded p-3">
                  <div className="text-white/50 text-xs mb-1">Fondation ville</div>
                  <div className="text-white">1832</div>
                </div>
                <div className="bg-[#1a1a1a] rounded p-3">
                  <div className="text-white/50 text-xs mb-1">Mot de passe</div>
                  <div className="text-[#0078d4] font-mono">183214Avril1967</div>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="text-center">
              <p className="text-white/70 text-sm leading-relaxed">
                En fouillant dans vos fichiers personnels, vous avez reconstitué votre histoire.
                Votre mot de passe combine la date de fondation de votre ville (1832) et votre 
                date de naissance (14 Avril 1967) - un rappel de vos racines et de votre identité.
              </p>
            </div>

            {/* Action */}
            <button
              onClick={() => {
                playSound("click");
                onRestart();
              }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0078d4] hover:bg-[#1084d8] text-white rounded-lg transition-colors font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              Rejouer
            </button>
          </div>
        </div>

        {/* Credits */}
        <p className="text-center text-white/30 text-sm mt-4">
          Amnesia - Un jeu d&apos;enquête numérique
        </p>
      </div>
    </div>
  );
}
