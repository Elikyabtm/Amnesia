"use client";

import { useState, useEffect } from "react";
import { User, ArrowRight, Wifi, Battery, Volume2 } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

export function LoginScreen() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);
  const { enterDesktop } = useGame();
  const { playSound } = useSound();

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEnter = () => {
    playSound("startup");
    enterDesktop();
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  // Prevent hydration mismatch by not rendering time until mounted
  if (!mounted) {
    return (
      <div 
        className="min-h-screen flex flex-col bg-cover bg-center relative select-none"
        style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center relative select-none"
      style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Status bar */}
      <div className="relative z-10 flex justify-end items-center gap-4 p-4 text-white/90">
        <Wifi className="w-4 h-4" />
        <Volume2 className="w-4 h-4" />
        <Battery className="w-4 h-4" />
        <span className="text-sm">{formatTime(time)}</span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Time display */}
        <div className="text-center mb-12">
          <div className="text-8xl font-extralight text-white tracking-tight">
            {formatTime(time)}
          </div>
          <div className="text-2xl text-white/80 mt-2 capitalize">
            {formatDate(time)}
          </div>
        </div>

        {/* User card */}
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-[#0078d4] flex items-center justify-center mb-4 ring-4 ring-white/20">
            <User className="w-16 h-16 text-white" />
          </div>

          {/* Username */}
          <div className="text-2xl font-medium text-white mb-2">???</div>
          <p className="text-white/60 text-sm mb-6">Vous ne vous souvenez de rien...</p>

          {/* Enter button */}
          <button
            onClick={handleEnter}
            className="flex items-center gap-3 px-8 py-3 bg-white/10 backdrop-blur-md rounded-sm border border-white/20 text-white hover:bg-white/20 transition-all group"
          >
            <span>Acceder au bureau</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Hint text */}
          <p className="text-white/50 text-sm mt-6 max-w-md text-center">
            Explorez les fichiers pour decouvrir qui vous etes et retrouver votre mot de passe...
          </p>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="relative z-10 p-6 text-center">
        <p className="text-white/60 text-sm">
          Cliquez pour commencer votre enquete
        </p>
      </div>
    </div>
  );
}
