"use client";

import { useEffect, useState } from "react";

// L'histoire se déroule le jeudi 20 février 2025. On garde l'heure réelle du
// joueur au lancement, puis l'horloge avance normalement à partir de là.
export const STORY_DATE = { year: 2025, month: 1 /* février (0-indexé) */, day: 20 };

// Anniversaire de Bernard : 14 avril (cf. Discours_Anniversaire_Ville.txt)
export const BIRTHDAY = { month: 3, day: 14 };

let offsetMs: number | null = null;

function getOffset() {
  if (offsetMs === null) {
    const real = new Date();
    const story = new Date(
      STORY_DATE.year,
      STORY_DATE.month,
      STORY_DATE.day,
      real.getHours(),
      real.getMinutes(),
      real.getSeconds(),
      real.getMilliseconds()
    );
    offsetMs = story.getTime() - real.getTime();
  }
  return offsetMs;
}

/** Date et heure "dans le jeu" (20 février 2025 + temps écoulé). */
export function gameNow(): Date {
  return new Date(Date.now() + getOffset());
}

/** Hook React : renvoie la date du jeu, rafraîchie à intervalle régulier. */
export function useGameClock(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(gameNow());
    const timer = setInterval(() => setNow(gameNow()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/** Texte "Anniversaire dans X mois" calculé depuis la date du jeu. */
export function birthdayCountdownText(from: Date = gameNow()): string {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let next = new Date(today.getFullYear(), BIRTHDAY.month, BIRTHDAY.day);
  if (next < today) next = new Date(today.getFullYear() + 1, BIRTHDAY.month, BIRTHDAY.day);
  const days = Math.round((next.getTime() - today.getTime()) / 86_400_000);

  if (days === 0) return "C'est votre anniversaire aujourd'hui !";
  if (days === 1) return "Anniversaire demain (14 avril)";
  if (days < 31) return `Anniversaire dans ${days} jours (14 avril)`;
  const months = Math.round(days / 30.44);
  return `Anniversaire dans ${months} mois (14 avril)`;
}
