"use client";

import { useState, useEffect } from "react";
import { useGame } from "@/lib/game-context";
import { Trophy, Eye, FileWarning, RotateCcw, AlertTriangle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { SECRET_TOTAL, secretName } from "@/lib/secret-catalog";
import { useSound } from "@/hooks/use-sound";
import { CLUE_TOTAL, isCatalogClue } from "@/lib/clue-catalog";

const TOTAL_SECRETS = SECRET_TOTAL;

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const ss = s.toString().padStart(2, "0");
  return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

function StatCard({ value, label, progress }: { value: string; label: string; progress?: number }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 flex flex-col justify-between">
      <div className="text-2xl font-bold text-white tabular-nums">{value}</div>
      <div className="text-xs text-white/50 mt-1 leading-tight">{label}</div>
      {progress !== undefined && (
        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#4ea8ff]" style={{ width: `${Math.round(Math.min(1, progress) * 100)}%` }} />
        </div>
      )}
    </div>
  );
}

type Ending = "innocent" | "curious" | "detective" | "accomplice";

export function WinScreen() {
  const { secretsDiscovered, passwordAttempts, suspicionLevel, clues, startTime, endTime, revealedPassword, resetGame } = useGame();
  const { playSound } = useSound();
  const duration = startTime && endTime ? formatDuration(endTime - startTime) : "--:--";
  const cluesFound = clues.filter((c) => isCatalogClue(c.text)).length;
  const [ending, setEnding] = useState<Ending>("innocent");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Determine ending based on what was discovered
    const discoveredCount = secretsDiscovered.length;
    
    if (discoveredCount >= TOTAL_SECRETS - 1) {
      setEnding("detective");
    } else if (discoveredCount >= 3) {
      setEnding("curious");
    } else if (discoveredCount === 0) {
      setEnding("innocent");
    } else {
      setEnding("accomplice");
    }
    
    // Show details after delay
    const timer = setTimeout(() => setShowDetails(true), 2000);
    return () => clearTimeout(timer);
  }, [secretsDiscovered]);

  useEffect(() => {
    playSound("success");
  }, [playSound]);

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
      title: "Fin : Le Détective",
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
    resetGame();
  };

  return (
    <div className="fixed inset-0 bg-black z-[10000] flex overflow-y-auto py-10">
      {/* Background effect */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" />
      
      {/* Content */}
      <div className="relative z-10 max-w-2xl m-auto px-8 text-center">
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

        {/* Identity card */}
        {showDetails && (
          <div className="mb-8 bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 text-left animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#0078d4] flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Vous êtes Bernard Dupuis</h2>
                <p className="text-white/60 text-sm">Maire de Bourg-sur-Mer depuis 2015</p>
              </div>
            </div>
            <div className="text-sm text-white/60 leading-relaxed">
              Mot de passe :{" "}
              <span className="font-mono text-[#4ea8ff]">{revealedPassword?.password ?? "—"}</span>
              {revealedPassword && (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {revealedPassword.parts.map((part) => (
                    <span key={part.value} className="bg-black/30 rounded px-2 py-1">
                      <b className="text-white font-mono text-sm">{part.value}</b>
                      <span className="block text-white/50">{part.label}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        {showDetails && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8 animate-fade-in">
            <StatCard value={duration} label="Temps de partie" />
            <StatCard value={String(passwordAttempts)} label={`Tentative${passwordAttempts > 1 ? "s" : ""} de mot de passe`} />
            <StatCard value={`${cluesFound}/${CLUE_TOTAL}`} label="Indices trouvés" progress={cluesFound / CLUE_TOTAL} />
            <StatCard value={`${secretsDiscovered.length}/${TOTAL_SECRETS}`} label="Secrets trouvés" progress={secretsDiscovered.length / TOTAL_SECRETS} />
            <StatCard value={`${suspicionLevel}%`} label="Suspicion finale" />
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
                  {secretName(secret)}
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
            Indice : Il y a d&apos;autres fins à découvrir. Avant de vous connecter en admin, explorez le dossier confidentiel et votre boîte mail...
          </p>
        )}
      </div>
    </div>
  );
}
