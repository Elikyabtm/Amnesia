"use client";

import { useEffect, useState } from "react";
import { useSound } from "@/hooks/use-sound";

interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const [phase, setPhase] = useState<"logo" | "loading" | "welcome">("logo");
  const [progress, setProgress] = useState(0);
  const { playSound } = useSound();

  useEffect(() => {
    playSound("startup");
    
    // Phase 1: Logo appears (1.5s)
    const logoTimer = setTimeout(() => {
      setPhase("loading");
    }, 1500);

    return () => clearTimeout(logoTimer);
  }, [playSound]);

  useEffect(() => {
    if (phase === "loading") {
      // Simulate loading progress
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setPhase("welcome");
            return 100;
          }
          // Variable speed loading
          const increment = Math.random() * 15 + 5;
          return Math.min(p + increment, 100);
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "welcome") {
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  return (
    <div className="fixed inset-0 bg-[#0078d4] flex flex-col items-center justify-center z-[9999]">
      {/* Windows-style logo */}
      <div className="mb-12 animate-fade-in">
        <div className="grid grid-cols-2 gap-1 w-24 h-24">
          <div className="bg-white/90 rounded-tl-sm" />
          <div className="bg-white/90 rounded-tr-sm" />
          <div className="bg-white/90 rounded-bl-sm" />
          <div className="bg-white/90 rounded-br-sm" />
        </div>
      </div>

      {phase === "logo" && (
        <div className="text-white/80 text-lg animate-pulse">
          Demarrage...
        </div>
      )}

      {phase === "loading" && (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          {/* Loading dots animation */}
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ 
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "1s"
                }}
              />
            ))}
          </div>
          <div className="text-white/60 text-sm mt-4">
            Preparation de votre session...
          </div>
          {/* Progress bar (subtle) */}
          <div className="w-48 h-0.5 bg-white/20 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-white/60 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {phase === "welcome" && (
        <div className="text-center animate-fade-in">
          <div className="text-4xl font-light text-white mb-2">
            Bienvenue
          </div>
          <div className="text-white/60">
            Preparation du bureau...
          </div>
        </div>
      )}

      {/* Subtle system info at bottom */}
      <div className="absolute bottom-8 text-white/40 text-xs">
        AmnesiaOS v1.0 - Session utilisateur
      </div>
    </div>
  );
}
