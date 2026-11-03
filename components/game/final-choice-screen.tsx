"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Flame, KeyRound, Lock, Scale } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { CHOICE_DECISION_SECONDS, CHOICE_INTRO, CHOICES, KNOWLEDGE, type FinalChoice } from "@/lib/data/final-choice";

const ICONS: Record<FinalChoice, typeof Scale> = { justice: Scale, mayor: Flame, player: KeyRound };
const COLORS: Record<FinalChoice, string> = {
  justice: "hover:border-sky-400/60 focus-visible:border-sky-400",
  mayor: "hover:border-red-400/60 focus-visible:border-red-400",
  player: "hover:border-amber-400/60 focus-visible:border-amber-400",
};

/**
 * Choix moral final : que faire des preuves ? 60 secondes pour décider,
 * sinon Maurin agit seul (fin "Le Maire").
 */
export function FinalChoiceScreen() {
  const { secretsDiscovered, setFinalChoice } = useGame();
  const { playSound } = useSound();
  const [timeLeft, setTimeLeft] = useState(CHOICE_DECISION_SECONDS);
  const [picked, setPicked] = useState<FinalChoice | null>(null);
  const doneRef = useRef(false);

  const known = KNOWLEDGE.filter((k) => secretsDiscovered.includes(k.secretId));
  const options = CHOICES.map((c) => ({ ...c, locked: !!c.requiresSecret && !secretsDiscovered.includes(c.requiresSecret) }));

  const decide = useCallback(
    (choice: FinalChoice, timedOut = false) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setPicked(choice);
      playSound(timedOut ? "error" : "click");
      // Courte pause sur le choix avant l'écran de fin
      setTimeout(() => setFinalChoice({ choice, timedOut }), 1200);
    },
    [playSound, setFinalChoice]
  );

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          decide("mayor", true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [decide]);

  // Raccourcis 1, 2, 3
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const option = options[Number(e.key) - 1];
      if (option && !option.locked) decide(option.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const progress = timeLeft / CHOICE_DECISION_SECONDS;

  return (
    <div className="fixed inset-0 z-[10000] bg-black flex overflow-y-auto py-10" role="dialog" aria-modal="true" aria-labelledby="choice-title">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,#1e293b_0%,#000_70%)]" />
      <div className="relative z-10 w-full max-w-3xl m-auto px-6 text-white">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <p className="text-sm text-white/50 font-mono">{CHOICE_INTRO.date}</p>
            <h1 id="choice-title" className="text-3xl font-semibold mt-1">
              Que faire de ces preuves ?
            </h1>
            {CHOICE_INTRO.lines.map((l) => (
              <p key={l} className="text-white/70 mt-2">
                {l}
              </p>
            ))}
          </div>
          {/* Compte à rebours */}
          <div className="relative w-20 h-20 flex-shrink-0" aria-label={`${timeLeft} secondes pour décider`}>
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke={timeLeft <= 10 ? "#f87171" : "#fbbf24"}
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - progress)}
                className="transition-[stroke-dashoffset] duration-1000 ease-linear"
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-2xl font-mono tabular-nums ${timeLeft <= 10 ? "text-red-400" : ""}`}>
              {timeLeft}
            </span>
          </div>
        </div>

        {known.length > 0 && (
          <section className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
            <h2 className="text-xs uppercase tracking-wider text-white/40 mb-2">Ce que vous savez</h2>
            <ul className="space-y-1.5 text-sm text-white/80">
              {known.map((k) => (
                <li key={k.secretId} className="flex gap-2">
                  <span className="text-red-400">•</span>
                  {k.text}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          {options.map((o, i) => {
            const Icon = o.locked ? Lock : ICONS[o.id];
            const isPicked = picked === o.id;
            return (
              <button
                key={o.id}
                disabled={o.locked || picked !== null}
                onClick={() => decide(o.id)}
                className={`text-left rounded-xl border p-4 transition-all outline-none ${
                  isPicked ? "border-white bg-white/15 scale-[1.02]" : "border-white/15 bg-white/[0.04]"
                } ${o.locked ? "opacity-40 cursor-not-allowed" : COLORS[o.id]} ${picked && !isPicked ? "opacity-30" : ""}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5" />
                  <span className="text-xs text-white/40 font-mono">{i + 1}</span>
                </div>
                <p className="font-medium">{o.label}</p>
                <p className="text-sm text-white/60 mt-1">{o.locked ? o.lockedHint : o.description}</p>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          {picked === "mayor" && timeLeft === 0
            ? "Trop tard. Maurin a pris la décision pour vous."
            : "Si vous ne décidez pas à temps, Maurin agira seul."}
        </p>
      </div>
    </div>
  );
}
