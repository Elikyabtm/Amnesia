"use client";

import { useState } from "react";
import { PhoneOff, User } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { MARIE_CHOICES, MARIE_OPENING, type CallChoice } from "@/lib/data/marie-call";
import type { MiniGameProps } from "./types";

// Appel de Marie : pas d'échec possible, la réponse choisie donne un petit
// indice ou rend Marie méfiante (légère hausse de la suspicion).

export function MarieCall({ onSuccess }: MiniGameProps) {
  const { addClue, addSuspicion } = useGame();
  const [choice, setChoice] = useState<CallChoice | null>(null);

  const choose = (c: CallChoice) => {
    setChoice(c);
    if (c.suspicion > 0) {
      addSuspicion({ type: "repeated_access", amount: c.suspicion, message: "Marie trouve votre comportement étrange" });
    }
    if (c.clue) {
      addClue({ category: "password", text: c.clue, source: "Appel de Marie", highlight: c.highlight });
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-5">
        <div className="relative w-14 h-14 rounded-full bg-pink-600/80 flex items-center justify-center">
          <User className="w-7 h-7" />
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#1c1c1c]" />
        </div>
        <div>
          <p className="font-medium">Marie (épouse)</p>
          <p className="text-xs text-emerald-400">Appel en cours</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-white/90">{MARIE_OPENING}</p>
        {choice && (
          <>
            <p className="ml-auto max-w-[85%] bg-[#0078d4]/30 border border-[#0078d4]/40 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white/90">
              {choice.label.replace(/^« | »$/g, "")}
            </p>
            <p className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-white/90">{choice.reply}</p>
          </>
        )}
      </div>

      {!choice ? (
        <div className="mt-5 space-y-2">
          <p className="text-xs text-white/50">Que répondez-vous ?</p>
          {MARIE_CHOICES.map((c) => (
            <button
              key={c.id}
              onClick={() => choose(c)}
              className="w-full text-left px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#4ea8ff]/50 text-sm"
            >
              {c.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className={`text-xs ${choice.suspicion ? "text-amber-400" : "text-emerald-400"}`}>
            {choice.suspicion ? "Marie semble méfiante." : "Marie est rassurée."}
          </p>
          <button onClick={onSuccess} className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 hover:bg-red-500 text-sm">
            <PhoneOff className="w-4 h-4" /> Raccrocher
          </button>
        </div>
      )}
    </div>
  );
}
