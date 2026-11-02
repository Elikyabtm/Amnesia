"use client";

import { useEffect, useRef, useState } from "react";
import { Plug, Zap } from "lucide-react";
import type { MiniGameProps } from "./types";

// Relier chaque câble du chargeur à la prise de sa couleur, case par case,
// sans croiser les autres fils. Grilles construites à partir d'une solution.

type Cell = [number, number];

interface Puzzle {
  size: number;
  pairs: { color: string; name: string; from: Cell; to: Cell }[];
}

const PUZZLES: Puzzle[] = [
  {
    size: 5,
    pairs: [
      { color: "#ef4444", name: "Secteur", from: [0, 0], to: [4, 1] },
      { color: "#facc15", name: "Adaptateur", from: [0, 1], to: [2, 3] },
      { color: "#3b82f6", name: "USB-C", from: [0, 4], to: [3, 2] },
      { color: "#22c55e", name: "Terre", from: [2, 1], to: [1, 2] },
    ],
  },
  {
    size: 5,
    pairs: [
      { color: "#ef4444", name: "Secteur", from: [0, 0], to: [2, 4] },
      { color: "#3b82f6", name: "USB-C", from: [1, 0], to: [4, 2] },
      { color: "#facc15", name: "Adaptateur", from: [1, 1], to: [4, 4] },
      { color: "#22c55e", name: "Terre", from: [2, 1], to: [3, 2] },
    ],
  },
  {
    size: 5,
    pairs: [
      { color: "#ef4444", name: "Secteur", from: [0, 4], to: [4, 3] },
      { color: "#facc15", name: "Adaptateur", from: [0, 3], to: [2, 1] },
      { color: "#3b82f6", name: "USB-C", from: [0, 0], to: [3, 2] },
      { color: "#22c55e", name: "Terre", from: [2, 3], to: [1, 2] },
    ],
  },
];

const TIME_LIMIT = 45;
const key = ([r, c]: Cell) => `${r}:${c}`;
const adjacent = (a: Cell, b: Cell) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;

export function CableGame({ onSuccess, onFail, attempt }: MiniGameProps) {
  const puzzle = PUZZLES[attempt % PUZZLES.length];
  const [paths, setPaths] = useState<Record<number, Cell[]>>({});
  const [drawing, setDrawing] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const doneRef = useRef(false);

  const endpointAt = (cell: Cell) =>
    puzzle.pairs.findIndex((p) => key(p.from) === key(cell) || key(p.to) === key(cell));

  const ownerAt = (cell: Cell) => {
    for (const [i, path] of Object.entries(paths)) if (path.some((c) => key(c) === key(cell))) return Number(i);
    return -1;
  };

  const isConnected = (i: number) => {
    const path = paths[i];
    if (!path || path.length < 2) return false;
    const { from, to } = puzzle.pairs[i];
    const ends = [key(path[0]), key(path[path.length - 1])];
    return ends.includes(key(from)) && ends.includes(key(to));
  };

  useEffect(() => {
    if (doneRef.current) return;
    if (puzzle.pairs.every((_, i) => isConnected(i)) && drawing === null) {
      doneRef.current = true;
      setTimeout(onSuccess, 400);
    }
  });

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1 && !doneRef.current) {
          doneRef.current = true;
          clearInterval(t);
          onFail("Trop tard : le chargeur n'est pas branché. Les câbles se sont encore emmêlés.");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [onFail]);

  const startAt = (cell: Cell) => {
    const ep = endpointAt(cell);
    if (ep < 0) return;
    // Repartir de cette extrémité efface l'ancien fil de cette couleur
    setPaths((p) => ({ ...p, [ep]: [cell] }));
    setDrawing(ep);
  };

  const extendTo = (cell: Cell) => {
    if (drawing === null) return;
    const path = paths[drawing] ?? [];
    const last = path[path.length - 1];
    if (!last || key(last) === key(cell) || !adjacent(last, cell)) return;
    // Retour en arrière sur sa propre trace
    if (path.length >= 2 && key(path[path.length - 2]) === key(cell)) {
      setPaths((p) => ({ ...p, [drawing]: path.slice(0, -1) }));
      return;
    }
    if (isConnected(drawing)) return;
    const ep = endpointAt(cell);
    if (ep >= 0 && ep !== drawing) return; // extrémité d'une autre couleur
    const owner = ownerAt(cell);
    if (owner >= 0 && owner !== drawing) return; // pas de croisement
    if (path.some((c) => key(c) === key(cell))) return;
    setPaths((p) => ({ ...p, [drawing]: [...path, cell] }));
  };

  const cellFromPoint = (x: number, y: number): Cell | null => {
    const el = document.elementFromPoint(x, y)?.closest("[data-cell]");
    if (!el) return null;
    const [r, c] = (el.getAttribute("data-cell") ?? "").split(":").map(Number);
    return [r, c];
  };

  const size = 64;
  const connected = puzzle.pairs.filter((_, i) => isConnected(i)).length;

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div className="flex items-center gap-6 text-sm">
        <span className="text-white/70">
          Câbles branchés : <b className="text-white">{connected}/{puzzle.pairs.length}</b>
        </span>
        <span className={`tabular-nums font-mono ${timeLeft <= 10 ? "text-red-400" : "text-white/70"}`}>⏱ {timeLeft} s</span>
      </div>
      <div
        className="relative grid bg-[#111] rounded-lg p-2 touch-none"
        style={{ gridTemplateColumns: `repeat(${puzzle.size}, ${size}px)` }}
        onPointerMove={(e) => {
          if (drawing === null) return;
          const cell = cellFromPoint(e.clientX, e.clientY);
          if (cell) extendTo(cell);
        }}
        onPointerUp={() => setDrawing(null)}
        onPointerLeave={() => setDrawing(null)}
      >
        {Array.from({ length: puzzle.size * puzzle.size }, (_, i) => {
          const cell: Cell = [Math.floor(i / puzzle.size), i % puzzle.size];
          const ep = endpointAt(cell);
          const owner = ownerAt(cell);
          const color = ep >= 0 ? puzzle.pairs[ep].color : owner >= 0 ? puzzle.pairs[owner].color : undefined;
          const isFrom = ep >= 0 && key(puzzle.pairs[ep].from) === key(cell);
          return (
            <div
              key={i}
              data-cell={key(cell)}
              onPointerDown={(e) => {
                (e.currentTarget.parentElement as HTMLElement).releasePointerCapture?.(e.pointerId);
                startAt(cell);
              }}
              className="relative border border-white/5 flex items-center justify-center"
              style={{ width: size, height: size }}
            >
              {owner >= 0 && ep < 0 && <span className="absolute inset-3 rounded-md opacity-80" style={{ backgroundColor: color }} />}
              {ep >= 0 && (
                <span
                  className="relative w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-black/40 cursor-pointer"
                  style={{ backgroundColor: color }}
                  title={`${puzzle.pairs[ep].name} — ${isFrom ? "câble" : "prise"}`}
                >
                  {isFrom ? <Plug className="w-5 h-5 text-black/70" /> : <Zap className="w-5 h-5 text-black/70" />}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-white/50 text-center max-w-md">
        Glissez depuis une fiche <Plug className="inline w-3 h-3" /> jusqu&apos;à la prise <Zap className="inline w-3 h-3" /> de la même couleur, case par case.
        Les fils ne doivent pas se croiser.
      </p>
    </div>
  );
}
