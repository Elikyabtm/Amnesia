"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Moon, Power, RotateCcw, RefreshCw, User } from "lucide-react";
import { useGame, type AppType } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { ConfirmDialog } from "./confirm-dialog";
import { APPS, START_PINNED_APPS } from "./app-registry";

type PowerAction = "restart" | "shutdown" | "newgame";

interface StartMenuProps {
  open: boolean;
  onClose: () => void;
  /** Bouton Démarrer : les clics dessus ne doivent pas fermer le menu */
  toggleRef: React.RefObject<HTMLElement | null>;
}

const POWER_CONFIRM: Record<PowerAction, { title: string; message: string; confirm: string; danger?: boolean }> = {
  restart: {
    title: "Redémarrer",
    message: "Redémarrer l'ordinateur ? Les fenêtres ouvertes seront fermées. Votre enquête (indices, dossiers, temps) est conservée.",
    confirm: "Redémarrer",
  },
  shutdown: {
    title: "Arrêter",
    message: "Arrêter l'ordinateur ? Vous reviendrez à l'écran titre et pourrez reprendre avec « Continuer ». Le chronomètre est mis en pause.",
    confirm: "Arrêter",
  },
  newgame: {
    title: "Nouvelle partie",
    message: "Commencer une nouvelle partie ? Votre progression actuelle (indices, dossiers déverrouillés, temps de jeu) sera définitivement effacée.",
    confirm: "Effacer et recommencer",
    danger: true,
  },
};

export function StartMenu({ open, onClose, toggleRef }: StartMenuProps) {
  const { openWindow, accountLevel, identityKnown, sleep, restartComputer, shutdownComputer, resetGame } = useGame();
  const { playSound } = useSound();
  const [view, setView] = useState<"pinned" | "all">("pinned");
  const [showPower, setShowPower] = useState(false);
  const [confirm, setConfirm] = useState<PowerAction | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermeture au clic à l'extérieur et avec Échap
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, toggleRef]);

  useEffect(() => {
    if (!open) {
      setView("pinned");
      setShowPower(false);
    }
  }, [open]);

  const launch = (id: AppType) => {
    playSound("open");
    openWindow(id);
    onClose();
  };

  const askPower = (action: PowerAction) => {
    playSound("click");
    onClose();
    setConfirm(action);
  };

  const runPower = () => {
    const action = confirm;
    setConfirm(null);
    if (action === "restart") restartComputer();
    if (action === "shutdown") shutdownComputer();
    if (action === "newgame") resetGame();
  };

  const allApps = Object.values(APPS).sort((a, b) => a.label.localeCompare(b.label, "fr"));
  const accountLabel = accountLevel === "admin" ? "Administrateur" : accountLevel === "guest" ? "Invité" : "Session non vérifiée";

  return (
    <>
      {confirm && (
        <ConfirmDialog
          title={POWER_CONFIRM[confirm].title}
          message={POWER_CONFIRM[confirm].message}
          confirmLabel={POWER_CONFIRM[confirm].confirm}
          danger={POWER_CONFIRM[confirm].danger}
          onConfirm={runPower}
          onCancel={() => setConfirm(null)}
        />
      )}

      {open && (
        <div
          ref={menuRef}
          className="fixed bottom-14 left-1/2 -translate-x-1/2 w-[min(560px,calc(100vw-16px))] bg-[#202020]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-[2000] animate-fade-in overflow-hidden"
        >
          <div className="p-5 min-h-[340px]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-semibold">
                {view === "pinned" ? "Épinglées" : "Toutes les applications"}
              </p>
              <button
                onClick={() => setView(view === "pinned" ? "all" : "pinned")}
                className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-white/80 transition-colors"
              >
                {view === "pinned" ? (
                  <>Toutes les applications <ChevronRight className="w-3.5 h-3.5" /></>
                ) : (
                  <><ChevronLeft className="w-3.5 h-3.5" /> Retour</>
                )}
              </button>
            </div>

            {view === "pinned" ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
                {START_PINNED_APPS.map((id) => {
                  const app = APPS[id];
                  const Icon = app.icon;
                  return (
                    <button
                      key={id}
                      onClick={() => launch(id)}
                      className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Icon className="w-7 h-7" style={{ color: app.color }} />
                      <span className="text-white/80 text-[11px] text-center leading-tight line-clamp-2">
                        {app.desktopLabel ?? app.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto pr-1">
                {allApps.map((app, i) => {
                  const Icon = app.icon;
                  const letter = app.label[0].toUpperCase();
                  const showLetter = i === 0 || allApps[i - 1].label[0].toUpperCase() !== letter;
                  return (
                    <div key={app.id}>
                      {showLetter && <p className="px-2 pt-2 pb-1 text-xs text-white/40">{letter}</p>}
                      <button
                        onClick={() => launch(app.id)}
                        className="w-full flex items-center gap-3 px-2 py-1.5 rounded hover:bg-white/10 transition-colors text-left"
                      >
                        <Icon className="w-5 h-5" style={{ color: app.color }} />
                        <span className="text-sm text-white/85">{app.label}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Profil + alimentation */}
          <div className="relative flex items-center justify-between px-5 py-3 bg-black/20 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0078d4] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{identityKnown ? "Bernard Dupuis" : "???"}</p>
                <p className="text-white/50 text-xs">{accountLabel}</p>
              </div>
            </div>

            <button
              onClick={() => {
                playSound("click");
                setShowPower(!showPower);
              }}
              className={`p-2 rounded transition-colors ${showPower ? "bg-white/15" : "hover:bg-white/10"}`}
              title="Alimentation"
              aria-label="Alimentation"
            >
              <Power className="w-5 h-5 text-white/80" />
            </button>

            {showPower && (
              <div className="absolute right-3 bottom-full mb-1 w-52 bg-[#2b2b2b] border border-white/10 rounded-lg shadow-2xl p-1 animate-fade-in">
                <button
                  onClick={() => {
                    playSound("click");
                    onClose();
                    sleep();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 text-sm text-white/85"
                >
                  <Moon className="w-4 h-4" /> Mettre en veille
                </button>
                <button onClick={() => askPower("restart")} className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 text-sm text-white/85">
                  <RefreshCw className="w-4 h-4" /> Redémarrer
                </button>
                <button onClick={() => askPower("shutdown")} className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 text-sm text-white/85">
                  <Power className="w-4 h-4" /> Arrêter
                </button>
                <div className="my-1 border-t border-white/10" />
                <button onClick={() => askPower("newgame")} className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 text-sm text-amber-300/90">
                  <RotateCcw className="w-4 h-4" /> Nouvelle partie
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
