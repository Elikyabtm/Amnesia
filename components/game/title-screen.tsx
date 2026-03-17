"use client";

import { useState, useEffect } from "react";
import { Play, Info, Settings, Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/hooks/use-sound";

interface TitleScreenProps {
  onStart: () => void;
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [glitchText, setGlitchText] = useState("AMNESIA");
  const { playSound } = useSound();

  useEffect(() => {
    // Glitch effect on title
    const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    let interval: NodeJS.Timeout;
    
    const startGlitch = () => {
      let iterations = 0;
      interval = setInterval(() => {
        setGlitchText(
          "AMNESIA".split("").map((char, i) => {
            if (i < iterations) return "AMNESIA"[i];
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
          }).join("")
        );
        iterations += 1/3;
        if (iterations >= "AMNESIA".length) {
          clearInterval(interval);
          setGlitchText("AMNESIA");
        }
      }, 50);
    };

    const timeout = setTimeout(startGlitch, 500);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const handleStart = () => {
    if (soundEnabled) playSound("click");
    onStart();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-black to-purple-900/50" />
        {/* Grid lines */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,120,212,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,120,212,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "gridMove 20s linear infinite",
          }}
        />
      </div>

      {/* Scanlines effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Title */}
        <h1 
          className="text-7xl md:text-9xl font-bold mb-4 tracking-wider"
          style={{
            fontFamily: "monospace",
            color: "#0078d4",
            textShadow: "0 0 20px rgba(0,120,212,0.5), 0 0 40px rgba(0,120,212,0.3)",
          }}
        >
          {glitchText}
        </h1>
        
        <p className="text-white/60 text-lg mb-2 tracking-widest">
          QUI ÊTES-VOUS ?
        </p>
        <p className="text-white/40 text-sm mb-12 max-w-md mx-auto px-4">
          Vous vous réveillez devant un ordinateur sans aucun souvenir.
          Explorez les fichiers pour découvrir votre identité et retrouver votre mot de passe.
        </p>

        {/* Menu buttons */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleStart}
            className="group flex items-center gap-3 px-8 py-4 bg-[#0078d4] text-white rounded-sm hover:bg-[#1084d8] transition-all hover:scale-105"
          >
            <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="text-lg font-medium tracking-wide">COMMENCER</span>
          </button>

          <button
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-3 px-6 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-sm transition-all"
          >
            <Info className="w-4 h-4" />
            <span>Comment jouer</span>
          </button>
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute bottom-8 right-8 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Info modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f1f1f] rounded-lg border border-white/10 max-w-lg w-full p-6 animate-window-open">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#0078d4]" />
              Comment jouer
            </h2>
            
            <div className="space-y-4 text-white/80 text-sm">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#0078d4] flex items-center justify-center text-white text-xs flex-shrink-0">1</span>
                <p>Explorez le bureau de votre ordinateur en double-cliquant sur les icônes.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#0078d4] flex items-center justify-center text-white text-xs flex-shrink-0">2</span>
                <p>Lisez les emails, documents, regardez les photos et écoutez les messages vocaux.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#0078d4] flex items-center justify-center text-white text-xs flex-shrink-0">3</span>
                <p>Collectez des indices dans votre carnet pour reconstituer votre identité.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#0078d4] flex items-center justify-center text-white text-xs flex-shrink-0">4</span>
                <p>Une fois que vous pensez connaître le mot de passe, utilisez l&apos;icône &quot;Déverrouiller&quot;.</p>
              </div>
              
              <div className="mt-4 p-3 bg-white/5 rounded border border-white/10">
                <p className="text-white/60 text-xs">
                  <strong className="text-white/80">Astuce :</strong> Le mot de passe est composé d&apos;éléments liés à votre histoire personnelle. 
                  Cherchez des dates, des lieux, des noms...
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="w-full mt-6 px-4 py-2.5 bg-[#0078d4] text-white rounded hover:bg-[#1084d8] transition-colors"
            >
              Compris
            </button>
          </div>
        </div>
      )}

      {/* CSS for grid animation */}
      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}
