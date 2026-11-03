"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ShieldQuestion } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { availableSecurityQuestions } from "@/lib/data/security-questions";
import type { MiniGameProps } from "./types";

// Le service informatique vérifie l'identité de l'utilisateur : 3 questions
// tirées parmi celles que les indices déjà trouvés permettent de résoudre.

const TIME_LIMIT = 45;
const QUESTIONS = 3;
const WRONG_ANSWER_SUSPICION = 8;

const shuffle = <T,>(list: T[]) => [...list].sort(() => Math.random() - 0.5);

export function SecurityQuestions({ onSuccess, onFail, attempt }: MiniGameProps) {
  const { clues, addSuspicion } = useGame();
  const questions = useMemo(
    () =>
      shuffle(availableSecurityQuestions(clues.map((c) => c.text)))
        .slice(0, QUESTIONS)
        .map((q) => ({ ...q, options: shuffle([q.answer, ...q.wrong]) })),
    // Nouvelles questions à chaque tentative
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt]
  );
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const doneRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1 && !doneRef.current) {
          doneRef.current = true;
          clearInterval(t);
          onFail("Délai dépassé : le service informatique n'a pas pu vérifier votre identité.");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [onFail]);

  const answer = (option: string) => {
    if (doneRef.current) return;
    const q = questions[index];
    if (option !== q.answer) {
      doneRef.current = true;
      addSuspicion({ type: "password_fail", amount: WRONG_ANSWER_SUSPICION, message: "Réponse incorrecte à une question de sécurité" });
      onFail("Réponse incorrecte. Le service informatique a signalé une activité suspecte sur ce poste.");
      return;
    }
    if (index + 1 >= questions.length) {
      doneRef.current = true;
      onSuccess();
    } else {
      setIndex(index + 1);
    }
  };

  const q = questions[index];
  if (!q) return null;

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-[#0078d4]/10 border border-[#0078d4]/30">
        <ShieldQuestion className="w-8 h-8 text-[#4ea8ff] flex-shrink-0" />
        <p className="text-sm text-white/80">
          <b>Service informatique — Mairie de Bourg-sur-Mer.</b> Activité inhabituelle détectée sur le poste PC-MAIRE-BSM. Répondez aux questions
          de sécurité du compte pour confirmer votre identité.
        </p>
      </div>
      <div className="flex justify-between text-xs text-white/50 mb-2">
        <span>
          Question {index + 1} / {questions.length}
        </span>
        <span className={`tabular-nums font-mono ${timeLeft <= 10 ? "text-red-400" : ""}`}>⏱ {timeLeft} s</span>
      </div>
      <p className="text-lg text-white mb-4">{q.question}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {q.options.map((option) => (
          <button
            key={option}
            onClick={() => answer(option)}
            className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#4ea8ff]/50 text-left text-sm"
          >
            {option}
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-white/40">Une mauvaise réponse augmente le niveau de suspicion du poste.</p>
    </div>
  );
}
