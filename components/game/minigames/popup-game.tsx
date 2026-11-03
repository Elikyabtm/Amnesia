"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ShieldAlert, X } from "lucide-react";
import type { MiniGameProps } from "./types";

// Attaque de pop-ups : les fermer avec la vraie croix (barre de titre)
// avant qu'elles ne couvrent l'écran. Les gros boutons sont des pièges.

interface Popup {
  id: number;
  x: number;
  y: number;
  variant: number;
}

const FIELD_W = 720;
const FIELD_H = 420;
const POPUP_W = 230;
const POPUP_H = 140;
const WAVE_DURATION = 25; // secondes d'apparition
const MAX_ON_SCREEN = 12;

const VARIANTS = [
  { title: "SecureShield Pro", message: "VOTRE PC EST INFECTÉ ! 47 virus détectés.", trap: "Nettoyer maintenant" },
  { title: "Alerte système", message: "Vos fichiers vont être supprimés dans 30 secondes !", trap: "FERMER ✕" },
  { title: "Félicitations !!!", message: "Vous avez gagné un iPhone ! Cliquez pour réclamer.", trap: "OK" },
  { title: "Mise à jour Flash", message: "Votre lecteur est obsolète. Installez la mise à jour.", trap: "Installer" },
];

let popupSeq = 0;

export function PopupGame({ onSuccess, onFail }: MiniGameProps) {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [closed, setClosed] = useState(0);
  const [trapped, setTrapped] = useState(0);
  const doneRef = useRef(false);

  const spawn = (count = 1) =>
    setPopups((list) => [
      ...list,
      ...Array.from({ length: count }, () => ({
        id: ++popupSeq,
        x: Math.random() * (FIELD_W - POPUP_W),
        y: Math.random() * (FIELD_H - POPUP_H),
        variant: Math.floor(Math.random() * VARIANTS.length),
      })),
    ]);

  // Vague d'apparition qui s'accélère
  useEffect(() => {
    spawn(2);
    let t: ReturnType<typeof setTimeout>;
    const start = Date.now();
    const loop = () => {
      const s = (Date.now() - start) / 1000;
      if (s >= WAVE_DURATION || doneRef.current) return;
      spawn(1);
      t = setTimeout(loop, Math.max(450, 1400 - s * 40));
    };
    t = setTimeout(loop, 1200);
    const clock = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      clearTimeout(t);
      clearInterval(clock);
    };
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    if (popups.length >= MAX_ON_SCREEN) {
      doneRef.current = true;
      onFail("Les pop-ups ont envahi l'écran ! Le faux antivirus a pris la main.");
    } else if (elapsed >= WAVE_DURATION && popups.length === 0) {
      doneRef.current = true;
      setTimeout(onSuccess, 300);
    }
  }, [popups.length, elapsed, onFail, onSuccess]);

  const close = (id: number) => {
    setPopups((list) => list.filter((p) => p.id !== id));
    setClosed((c) => c + 1);
  };

  const trap = () => {
    setTrapped((t) => t + 1);
    spawn(2);
  };

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div className="flex items-center gap-6 text-sm">
        <span className="text-white/70">
          Fenêtres ouvertes : <b className={popups.length >= 9 ? "text-red-400" : "text-white"}>{popups.length}</b> / {MAX_ON_SCREEN}
        </span>
        <span className="text-white/60">Fermées : {closed}</span>
        {trapped > 0 && <span className="text-amber-400">Pièges : {trapped}</span>}
        <span className="text-white/60 tabular-nums">
          {elapsed < WAVE_DURATION ? `Vague : ${WAVE_DURATION - elapsed} s` : "Fermez les dernières !"}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-white/10" style={{ width: FIELD_W, height: FIELD_H, background: "linear-gradient(135deg,#0b3d5c,#1673a8)" }}>
        {popups.map((p, i) => {
          const v = VARIANTS[p.variant];
          return (
            <div
              key={p.id}
              className="absolute bg-[#f3f3f3] text-gray-900 rounded shadow-2xl border border-gray-400 animate-window-open"
              style={{ left: p.x, top: p.y, width: POPUP_W, height: POPUP_H, zIndex: i + 1 }}
            >
              <div className="flex items-center justify-between h-6 px-2 bg-gradient-to-r from-red-700 to-red-500 text-white text-[11px] rounded-t">
                <span className="flex items-center gap-1 truncate">
                  <ShieldAlert className="w-3 h-3" /> {v.title}
                </span>
                {/* La vraie croix : petite, dans la barre de titre */}
                <button onClick={() => close(p.id)} className="w-4 h-4 flex items-center justify-center hover:bg-white/25 rounded-sm" aria-label="Fermer la fenêtre">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="p-2 text-[11px] leading-tight">
                <p className="flex gap-1.5 font-semibold text-red-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {v.message}
                </p>
                <div className="flex gap-1 mt-3">
                  <button onClick={trap} className="flex-1 py-1.5 rounded bg-red-600 text-white font-bold text-xs hover:bg-red-500">
                    {v.trap}
                  </button>
                  {p.variant % 2 === 0 && (
                    <button onClick={trap} className="px-2 py-1.5 rounded bg-gray-300 text-xs hover:bg-gray-200" aria-label="Fermer (piège)">
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-white/50 text-center">
        Seule la <b>petite croix de la barre de titre rouge</b> ferme une fenêtre. Les gros boutons sont des pièges qui en ouvrent d&apos;autres.
      </p>
    </div>
  );
}
