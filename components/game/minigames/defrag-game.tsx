"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MiniGameProps } from "./types";

// Défragmenter le disque : regrouper les blocs de chaque fichier en un seul
// segment continu (dans l'ordre de lecture) en échangeant des blocs.

type Block = 0 | 1 | 2 | null; // 3 fichiers + espace libre

const FILES = [
  { name: "Discours.docx", color: "#3b82f6" },
  { name: "Budget_2025.xlsx", color: "#22c55e" },
  { name: "Photos_port.zip", color: "#f59e0b" },
];
const COLS = 8;
const ROWS = 3;
const PER_FILE = 6;
const TIME_LIMIT = 45;

/** Nombre de segments en trop (0 = disque défragmenté) */
function fragmentation(blocks: Block[]) {
  let extra = 0;
  for (let f = 0; f < FILES.length; f++) {
    let runs = 0;
    blocks.forEach((b, i) => {
      if (b === f && blocks[i - 1] !== f) runs++;
    });
    extra += Math.max(0, runs - 1);
  }
  return extra;
}

function shuffled(seed: number): Block[] {
  const blocks: Block[] = [...FILES.flatMap((_, f) => Array(PER_FILE).fill(f) as Block[]), ...Array(COLS * ROWS - FILES.length * PER_FILE).fill(null)];
  let s = seed * 9301 + 49297;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  do {
    for (let i = blocks.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    }
  } while (fragmentation(blocks) < 6);
  return blocks;
}

export function DefragGame({ onSuccess, onFail, attempt }: MiniGameProps) {
  const initial = useMemo(() => shuffled(attempt + Date.now() % 1000), [attempt]);
  const [blocks, setBlocks] = useState<Block[]>(initial);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [moves, setMoves] = useState(0);
  const doneRef = useRef(false);
  const startFrag = useMemo(() => fragmentation(initial), [initial]);
  const frag = fragmentation(blocks);
  const progress = Math.round(((startFrag - frag) / startFrag) * 100);

  useEffect(() => {
    if (frag === 0 && !doneRef.current) {
      doneRef.current = true;
      setTimeout(onSuccess, 500);
    }
  }, [frag, onSuccess]);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1 && !doneRef.current) {
          doneRef.current = true;
          clearInterval(t);
          onFail("Délai dépassé : la mise à jour est toujours bloquée à 47 %.");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [onFail]);

  const click = (i: number) => {
    if (doneRef.current) return;
    if (selected === null) {
      setSelected(i);
      return;
    }
    if (selected !== i) {
      const next = [...blocks];
      [next[selected], next[i]] = [next[i], next[selected]];
      setBlocks(next);
      setMoves((m) => m + 1);
    }
    setSelected(null);
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div className="w-full max-w-lg">
        <div className="flex justify-between text-xs text-white/60 mb-1">
          <span>Mise à jour AmnesiaOS — installation bloquée</span>
          <span className="tabular-nums">47 %</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-[47%] bg-[#0078d4]" />
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <span className="text-white/70">
          Défragmentation : <b className="text-white tabular-nums">{Math.max(0, progress)} %</b>
        </span>
        <span className="text-white/50 tabular-nums">{moves} échange{moves > 1 ? "s" : ""}</span>
        <span className={`tabular-nums font-mono ${timeLeft <= 10 ? "text-red-400" : "text-white/70"}`}>⏱ {timeLeft} s</span>
      </div>

      <div className="grid gap-1.5 p-3 bg-[#0d1117] rounded-lg" style={{ gridTemplateColumns: `repeat(${COLS}, 48px)` }}>
        {blocks.map((b, i) => (
          <button
            key={i}
            onClick={() => click(i)}
            aria-label={b === null ? "Bloc libre" : `Bloc de ${FILES[b].name}`}
            className={`h-12 rounded transition-transform ${selected === i ? "ring-2 ring-white scale-95" : "hover:brightness-125"}`}
            style={{ backgroundColor: b === null ? "#1f2937" : FILES[b].color }}
          />
        ))}
      </div>

      <div className="flex gap-4 text-xs text-white/70">
        {FILES.map((f) => (
          <span key={f.name} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: f.color }} /> {f.name}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#1f2937] border border-white/20" /> Libre
        </span>
      </div>
      <p className="text-xs text-white/50 text-center max-w-md">
        Cliquez sur deux blocs pour les échanger. Regroupez les blocs de chaque fichier en un seul segment continu (de gauche à droite, ligne par ligne).
      </p>
    </div>
  );
}
