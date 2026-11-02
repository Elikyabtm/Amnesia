"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Bug, CheckCircle2, RotateCcw, SkipForward, X } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { gameNow } from "@/lib/game-clock";
import { RANDOM_EVENT_POOL, INITIAL_EVENTS_STATE, type GameEventId, type PlannedEvent } from "@/lib/events/types";
import {
  BATTERY_DIM_LEVEL,
  BATTERY_DRAIN_MS,
  BATTERY_WARNING_LEVEL,
  EVENT_COOLDOWN_MS,
  FAILS_BEFORE_SKIP,
  FIRST_EVENT_MIN_MS,
  MARIE_CALL_AT_MS,
  MAX_EVENTS_PER_GAME,
  RANDOM_EVENT_WINDOWS,
  SECURITY_QUESTIONS_AFTER_CLUES,
  SKIP_PENALTY,
} from "@/lib/events/config";
import { EVENT_REGISTRY, type EventOutcome } from "./event-registry";
import { availableSecurityQuestions } from "@/lib/data/security-questions";
import "./events"; // enregistre tous les événements

type Stage = "intro" | "playing" | "failed" | "success";

interface ActiveEvent {
  id: GameEventId;
  stage: Stage;
  failures: number;
  attempt: number;
  failReason?: string;
}

const randomBetween = ([a, b]: [number, number]) => a + Math.random() * (b - a);

/** Tire 1 ou 2 événements aléatoires et leur moment de déclenchement */
function makePlan(): PlannedEvent[] {
  const count = Math.random() < 0.5 ? 1 : 2;
  const pool = [...RANDOM_EVENT_POOL].sort(() => Math.random() - 0.5);
  return pool.slice(0, count).map((id, i) => ({ id, at: randomBetween(RANDOM_EVENT_WINDOWS[i]) }));
}

/**
 * Gestionnaire central des événements système : décide quand déclencher
 * chaque événement selon le temps de jeu et la progression, bloque le bureau
 * pendant le mini-jeu et applique les règles (écart, maximum, saisie du mot
 * de passe, "Passer" après 2 échecs).
 */
export function useEventScheduler() {
  const game = useGame();
  const {
    gamePhase,
    eventsState,
    setEventsState,
    getElapsedMs,
    clues,
    windows,
    activeWindowId,
    setBatteryLevel,
    batteryLevel,
    addNotification,
  } = game;
  const [active, setActive] = useState<ActiveEvent | null>(null);
  const [debugBattery, setDebugBattery] = useState<number | null>(null);
  const gameRef = useRef(game);
  gameRef.current = game;

  // Plan des événements aléatoires, tiré une fois par partie
  useEffect(() => {
    if (gamePhase === "exploring" && eventsState.plan.length === 0 && eventsState.done.length === 0) {
      setEventsState((s) => (s.plan.length ? s : { ...s, plan: makePlan() }));
    }
  }, [gamePhase, eventsState.plan.length, eventsState.done.length, setEventsState]);

  const passwordBusy = useCallback(() => {
    const focused = typeof document !== "undefined" && document.activeElement instanceof HTMLInputElement && document.activeElement.type === "password";
    const pwdActive = windows.some((w) => w.id === activeWindowId && w.app === "password" && !w.isMinimized);
    return focused || pwdActive;
  }, [windows, activeWindowId]);

  const start = useCallback((id: GameEventId) => {
    const def = EVENT_REGISTRY[id];
    if (!def) return;
    def.onStart?.(gameRef.current);
    setActive({ id, stage: "intro", failures: 0, attempt: 0 });
  }, []);

  const finish = useCallback(
    (outcome: EventOutcome) => {
      if (!active) return;
      const def = EVENT_REGISTRY[active.id];
      const g = gameRef.current;
      if (outcome === "skipped") {
        g.addSuspicion({ type: "repeated_access", amount: SKIP_PENALTY, message: `Mini-jeu passé : ${def?.title}` });
      }
      def?.onEnd?.(g, outcome);
      const elapsed = g.getElapsedMs();
      const firstTry = outcome === "success" && active.failures === 0;
      setEventsState((s) => ({
        ...s,
        done: s.done.includes(active.id) ? s.done : [...s.done, active.id],
        lastEventEnd: elapsed,
        stats: def?.countsAsMiniGame
          ? {
              played: s.stats.played + 1,
              firstTry: s.stats.firstTry + (firstTry ? 1 : 0),
              skipped: s.stats.skipped + (outcome === "skipped" ? 1 : 0),
            }
          : s.stats,
      }));
      setActive(null);
    },
    [active, setEventsState]
  );

  // Boucle de planification (toutes les secondes)
  useEffect(() => {
    if (gamePhase !== "exploring") return;
    const tick = () => {
      const elapsed = getElapsedMs();
      const s = eventsState;
      const isDone = (id: GameEventId) => s.done.includes(id);
      const cooldownOk = s.lastEventEnd === null ? elapsed >= FIRST_EVENT_MIN_MS : elapsed - s.lastEventEnd >= EVENT_COOLDOWN_MS;
      const canStart = !active && cooldownOk && !passwordBusy() && s.done.length < MAX_EVENTS_PER_GAME;

      // Batterie : se décharge avec le temps ; tant qu'un événement ne peut pas
      // démarrer, elle reste bloquée à 1 % pour respecter l'écart entre événements.
      let level = 100;
      if (EVENT_REGISTRY.battery && !s.batteryResolved && !isDone("battery")) {
        const raw = debugBattery ?? 100 - (elapsed / BATTERY_DRAIN_MS) * 100;
        level = Math.max(0, Math.min(100, Math.ceil(raw)));
        if (level <= 0 && !canStart) level = 1;
      }
      if (level !== batteryLevel) setBatteryLevel(level);
      for (const threshold of [BATTERY_WARNING_LEVEL, BATTERY_DIM_LEVEL]) {
        if (level <= threshold && level > 0 && !s.batteryWarned.includes(threshold)) {
          addNotification({
            title: threshold === BATTERY_WARNING_LEVEL ? "Batterie faible" : "Batterie très faible",
            message:
              threshold === BATTERY_WARNING_LEVEL
                ? `Il reste ${level} % de batterie. Branchez votre ordinateur.`
                : `${level} % : l'ordinateur va bientôt s'éteindre. Économie d'énergie activée.`,
            icon: "system",
          });
          setEventsState((st) => ({ ...st, batteryWarned: [...st.batteryWarned, threshold] }));
        }
      }

      if (!canStart) return;
      const candidates: GameEventId[] = [];
      if (level <= 0) candidates.push("battery");
      // Questions de sécurité : seulement si les indices trouvés permettent d'en poser 3
      if (clues.length >= SECURITY_QUESTIONS_AFTER_CLUES && availableSecurityQuestions(clues.map((c) => c.text)).length >= 3) {
        candidates.push("security");
      }
      if (elapsed >= MARIE_CALL_AT_MS) candidates.push("marie");
      for (const p of s.plan) if (elapsed >= p.at) candidates.push(p.id);
      const next = candidates.find((id) => EVENT_REGISTRY[id] && !isDone(id));
      if (next) start(next);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [gamePhase, eventsState, active, getElapsedMs, passwordBusy, clues, batteryLevel, setBatteryLevel, addNotification, setEventsState, start, debugBattery]);

  return { active, setActive, start, finish, setDebugBattery, debugBattery };
}

export function EventManager() {
  const { active, setActive, start, finish, setDebugBattery, debugBattery } = useEventScheduler();
  const { batteryLevel, eventsState, getElapsedMs, gamePhase, setEventsState, setBatteryCharging, setNetworkOnline } = useGame();
  const { playSound } = useSound();
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    setDebug(new URLSearchParams(window.location.search).get("debug") === "1");
  }, []);

  const def = active ? EVENT_REGISTRY[active.id] : undefined;

  const onSuccess = useCallback(() => {
    // Un événement sans échec possible (appel de Marie) se termine directement
    if (def && !def.canFail) {
      finish("success");
      return;
    }
    playSound("success");
    setActive((a) => (a ? { ...a, stage: "success" } : a));
  }, [playSound, setActive, def, finish]);

  const onFail = useCallback(
    (reason: string) => {
      playSound("error");
      setActive((a) => (a ? { ...a, stage: "failed", failures: a.failures + 1, failReason: reason } : a));
    },
    [playSound, setActive]
  );

  const showDim = batteryLevel <= BATTERY_DIM_LEVEL && batteryLevel > 0 && !active;

  return (
    <>
      {/* Écran légèrement assombri quand la batterie est presque vide */}
      {showDim && <div className="fixed inset-0 z-[8800] bg-black/35 pointer-events-none transition-opacity duration-1000" aria-hidden />}

      {active && def && (
        <div
          className={`fixed inset-0 z-[9500] flex items-center justify-center p-4 ${def.backdrop === "black" ? "bg-black" : "bg-black/75 backdrop-blur-sm"}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-title"
        >
          <div className="w-full max-w-3xl max-h-full overflow-auto bg-[#1c1c1c] border border-white/15 rounded-xl shadow-2xl text-white">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10">
              <def.icon className="w-5 h-5 text-amber-400" />
              <h2 id="event-title" className="font-semibold flex-1">{def.title}</h2>
              {active.stage === "playing" && active.failures > 0 && (
                <span className="text-xs text-white/50">Tentative {active.attempt + 1}</span>
              )}
            </div>

            <div className="p-5">
              {active.stage === "intro" && (
                <div className="text-center py-6">
                  <p className="text-white/80 whitespace-pre-line max-w-xl mx-auto leading-relaxed">{def.intro}</p>
                  <button
                    autoFocus
                    onClick={() => {
                      playSound("click");
                      setActive({ ...active, stage: "playing" });
                    }}
                    className="mt-6 px-6 py-2.5 rounded-lg bg-[#0078d4] hover:bg-[#1084d8] font-medium"
                  >
                    {def.startLabel}
                  </button>
                </div>
              )}

              {active.stage === "playing" && (
                <def.miniGame key={active.attempt} attempt={active.attempt} onSuccess={onSuccess} onFail={onFail} />
              )}

              {active.stage === "failed" && (
                <div className="text-center py-6">
                  <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                  <p className="text-white/85">{active.failReason}</p>
                  <div className="mt-6 flex justify-center gap-3">
                    <button
                      autoFocus
                      onClick={() => setActive({ ...active, stage: "playing", attempt: active.attempt + 1 })}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#0078d4] hover:bg-[#1084d8]"
                    >
                      <RotateCcw className="w-4 h-4" /> Réessayer
                    </button>
                    {def.canFail && active.failures >= FAILS_BEFORE_SKIP && (
                      <button
                        onClick={() => finish("skipped")}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white/10 hover:bg-white/15"
                      >
                        <SkipForward className="w-4 h-4" /> Passer (+{SKIP_PENALTY} suspicion)
                      </button>
                    )}
                  </div>
                </div>
              )}

              {active.stage === "success" && (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <p className="text-white/85 whitespace-pre-line">{def.successText}</p>
                  <button autoFocus onClick={() => finish("success")} className="mt-6 px-6 py-2.5 rounded-lg bg-[#0078d4] hover:bg-[#1084d8] font-medium">
                    Continuer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {debug && gamePhase === "exploring" && (
        <DebugPanel
          activeId={active?.id ?? null}
          onTrigger={(id) => !active && start(id)}
          onBattery={setDebugBattery}
          debugBattery={debugBattery}
          onReset={() => {
            setActive(null);
            setDebugBattery(null);
            setBatteryCharging(false);
            setNetworkOnline(true);
            setEventsState(INITIAL_EVENTS_STATE);
          }}
          elapsed={getElapsedMs()}
          state={eventsState}
          battery={batteryLevel}
        />
      )}
    </>
  );
}

function DebugPanel({
  activeId,
  onTrigger,
  onBattery,
  debugBattery,
  onReset,
  elapsed,
  state,
  battery,
}: {
  activeId: GameEventId | null;
  onTrigger: (id: GameEventId) => void;
  onBattery: (level: number | null) => void;
  debugBattery: number | null;
  onReset: () => void;
  elapsed: number;
  state: typeof INITIAL_EVENTS_STATE;
  battery: number;
}) {
  const [open, setOpen] = useState(true);
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;
  const cooldownLeft = state.lastEventEnd === null ? Math.max(0, FIRST_EVENT_MIN_MS - elapsed) : Math.max(0, EVENT_COOLDOWN_MS - (elapsed - state.lastEventEnd));

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="fixed bottom-16 left-2 z-[9700] p-2 rounded-full bg-fuchsia-700 text-white shadow-lg" aria-label="Ouvrir le mode debug">
        <Bug className="w-4 h-4" />
      </button>
    );
  }
  return (
    <div className="fixed bottom-16 left-2 z-[9700] w-72 bg-[#1a0f1f]/95 border border-fuchsia-500/40 rounded-lg shadow-2xl p-3 text-xs text-white font-mono">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-fuchsia-300 font-semibold">
          <Bug className="w-3.5 h-3.5" /> Mode debug
        </span>
        <button onClick={() => setOpen(false)} aria-label="Réduire le panneau debug">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <p>Temps de jeu : {fmt(elapsed)} · heure du jeu {gameNow().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
      <p>Prochain événement possible dans : {fmt(cooldownLeft)}</p>
      <p>Batterie : {battery} %{debugBattery !== null ? " (forcée)" : ""}</p>
      <p>Joués : {state.done.join(", ") || "aucun"} ({state.done.length}/{MAX_EVENTS_PER_GAME})</p>
      <p>Prévus : {state.plan.map((p) => `${p.id}@${fmt(p.at)}`).join(", ") || "—"}</p>
      <p className="mb-2">
        Mini-jeux : {state.stats.firstTry} du 1er coup / {state.stats.played} joués, {state.stats.skipped} passés
      </p>
      <div className="grid grid-cols-2 gap-1 mb-2">
        {(["battery", "update", "popups", "wifi", "security", "marie"] as GameEventId[]).map((id) => {
          const available = !!EVENT_REGISTRY[id];
          return (
            <button
              key={id}
              disabled={!available || !!activeId}
              onClick={() => onTrigger(id)}
              className="px-2 py-1 rounded bg-fuchsia-800/60 hover:bg-fuchsia-700 disabled:opacity-30"
            >
              {id}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {[BATTERY_WARNING_LEVEL, BATTERY_DIM_LEVEL, 0].map((lvl) => (
          <button key={lvl} onClick={() => onBattery(lvl)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20">
            Batterie {lvl} %
          </button>
        ))}
        <button onClick={() => onBattery(null)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20">
          Batterie auto
        </button>
      </div>
      <button onClick={onReset} className="w-full px-2 py-1 rounded bg-red-900/60 hover:bg-red-800">
        Réinitialiser les événements
      </button>
    </div>
  );
}
