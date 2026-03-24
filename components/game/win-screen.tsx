"use client";

import { useState, useEffect } from "react";
import { useGame } from "@/lib/game-context";
import { Trophy, Eye, FileWarning, RotateCcw, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Ending = "innocent" | "curious" | "detective" | "accomplice";

export function WinScreen() {
  const { secretsDiscovered, passwordAttempts, suspicionLevel } = useGame();
  const [ending, setEnding] = useState<Ending>("innocent");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Determine ending based on what was discovered
    const discoveredCount = secretsDiscovered.length;
    
    if (discoveredCount >= 4) {
      setEnding("detective");
    } else if (discoveredCount >= 2) {
      setEnding("curious");
    } else if (discoveredCount === 0) {
      setEnding("innocent");
    } else {
      setEnding("accomplice");
    }
    
    // Show details after delay
    setTimeout(() => setShowDetails(true), 2000);
  }, [secretsDiscovered]);

  const endings = {
    innocent: {
      title: "Fin : L'Innocent",
      subtitle: "Vous avez trouvé le mot de passe sans fouiller trop loin.",
      description: "Vous avez retrouvé votre identité sans découvrir les secrets sombres du maire. Parfois, l'ignorance est une bénédiction...",
      icon: Trophy,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
    },
    curious: {
      title: "Fin : Le Curieux",
      subtitle: "Vous avez commencé à gratter la surface...",
      description: "Vous avez découvert quelques irrégularités, mais pas assez pour comprendre l'ampleur de la corruption. Le maire continue ses activités... pour l'instant.",
      icon: Eye,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
    },
    detective: {
      title: "Fin : Le Detective",
      subtitle: "Vous avez tout découvert.",
      description: "Corruption, menaces, comptes offshore... Vous connaissez maintenant la vérité sur Bernard Dupuis. La question est : qu'allez-vous faire de ces informations ?",
      icon: FileWarning,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
    },
    accomplice: {
      title: "Fin : Le Complice",
      subtitle: "Vous en savez juste assez pour être dangereux.",
      description: "Vous avez vu des choses que vous n'auriez pas dû voir, mais pas assez pour agir. Félicitations, vous êtes maintenant impliqué dans le secret...",
      icon: AlertTriangle,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
    },
  };

  const currentEnding = endings[ending];
  const Icon = currentEnding.icon;

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black z-[10000] flex items-center justify-center">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" />
      
      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-8 text-center">
        {/* Icon */}
        <div className={cn(
          "w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center border-2 animate-fade-in",
          currentEnding.bgColor,
          currentEnding.borderColor
        )}>
          <Icon className={cn("w-12 h-12", currentEnding.color)} />
        </div>

        {/* Title */}
        <h1 className={cn(
          "text-4xl font-bold mb-2 animate-fade-in",
          currentEnding.color
        )} style={{ animationDelay: "0.2s" }}>
          {currentEnding.title}
        </h1>

        <p className="text-xl text-white/70 mb-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          {currentEnding.subtitle}
        </p>

        <p className="text-white/50 mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: "0.6s" }}>
          {currentEnding.description}
        </p>

        {/* Stats */}
        {showDetails && (
          <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-white">{passwordAttempts}</div>
              <div className="text-xs text-white/50 mt-1">Tentatives MDP</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-white">{secretsDiscovered.length}</div>
              <div className="text-xs text-white/50 mt-1">Secrets trouvés</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-white">{suspicionLevel}%</div>
              <div className="text-xs text-white/50 mt-1">Suspicion finale</div>
            </div>
          </div>
        )}

        {/* Secrets discovered */}
        {showDetails && secretsDiscovered.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <h3 className="text-sm font-medium text-white/40 mb-3">Secrets découverts :</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {secretsDiscovered.map((secret) => (
                <span
                  key={secret}
                  className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-xs text-red-400"
                >
                  {secret}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Restart button */}
        {showDetails && (
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all animate-fade-in"
          >
            <RotateCcw className="w-5 h-5" />
            Rejouer
          </button>
        )}

        {/* Hint for other endings */}
        {showDetails && ending !== "detective" && (
          <p className="mt-6 text-xs text-white/30 animate-fade-in">
            Indice : Il y a d&apos;autres fins à découvrir. Explorez le dossier confidentiel...
          </p>
        )}
      </div>
    </div>
  );
}
