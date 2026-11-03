"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Monitor, Router } from "lucide-react";
import type { MiniGameProps } from "./types";

// Faire pivoter les tuyaux pour relier la box (à gauche) au PC (à droite).
// La grille est générée autour d'un chemin aléatoire : une solution existe toujours.

const N = 1;
const E = 2;
const S = 4;
const W = 8;
const SIZE = 5;
const TIME_LIMIT = 50;

type Dir = typeof N | typeof E | typeof S | typeof W;
const DIRS: { bit: Dir; dr: number; dc: number; opposite: Dir }[] = [
  { bit: N, dr: -1, dc: 0, opposite: S },
  { bit: E, dr: 0, dc: 1, opposite: W },
  { bit: S, dr: 1, dc: 0, opposite: N },
  { bit: W, dr: 0, dc: -1, opposite: E },
];

const SHAPES = { straight: N | S, corner: N | E, tee: N | E | S };

/** Rotation d'un quart de tour dans le sens horaire */
const rotate = (mask: number, times: number) => {
  let m = mask;
  for (let i = 0; i < ((times % 4) + 4) % 4; i++) m = ((m << 1) | (m >> 3)) & 15;
  return m;
};

interface Tile {
  base: number;
  rot: number;
}

interface Puzzle {
  tiles: Tile[];
  sourceRow: number;
  sinkRow: number;
}

function generate(): Puzzle {
  const sourceRow = Math.floor(Math.random() * SIZE);
  const sinkRow = Math.floor(Math.random() * SIZE);
  // Chemin aléatoire de (sourceRow, 0) à (sinkRow, SIZE-1)
  const path: [number, number][] = [];
  const seen = new Set<string>();
  const dfs = (r: number, c: number): boolean => {
    path.push([r, c]);
    seen.add(`${r}:${c}`);
    if (r === sinkRow && c === SIZE - 1) return true;
    const options = DIRS.map((d) => [r + d.dr, c + d.dc] as [number, number])
      .filter(([nr, nc]) => nr >= 0 && nc >= 0 && nr < SIZE && nc < SIZE && !seen.has(`${nr}:${nc}`))
      .sort(() => Math.random() - 0.5);
    for (const [nr, nc] of options) if (dfs(nr, nc)) return true;
    path.pop();
    return false;
  };
  dfs(sourceRow, 0);

  const tiles: Tile[] = Array.from({ length: SIZE * SIZE }, () => {
    const kinds = [SHAPES.straight, SHAPES.corner, SHAPES.corner, SHAPES.tee];
    return { base: kinds[Math.floor(Math.random() * kinds.length)], rot: 0 };
  });
  path.forEach(([r, c], i) => {
    const dirTo = ([ar, ac]: [number, number], [br, bc]: [number, number]) => DIRS.find((d) => ar + d.dr === br && ac + d.dc === bc)!.bit;
    const a: number = i === 0 ? W : dirTo([r, c], path[i - 1]);
    const b: number = i === path.length - 1 ? E : dirTo([r, c], path[i + 1]);
    const need = a | b;
    tiles[r * SIZE + c] = { base: need === (N | S) || need === (E | W) ? SHAPES.straight : SHAPES.corner, rot: 0 };
  });
  // Rotations aléatoires
  tiles.forEach((t) => (t.rot = Math.floor(Math.random() * 4)));
  return { tiles, sourceRow, sinkRow };
}

/** Cases remplies d'eau depuis la box ; true si l'eau atteint le PC */
function flow({ tiles, sourceRow, sinkRow }: Puzzle) {
  const open = (r: number, c: number) => rotate(tiles[r * SIZE + c].base, tiles[r * SIZE + c].rot);
  const filled = new Set<number>();
  if (!(open(sourceRow, 0) & W)) return { filled, connected: false };
  const stack: [number, number][] = [[sourceRow, 0]];
  while (stack.length) {
    const [r, c] = stack.pop()!;
    const idx = r * SIZE + c;
    if (filled.has(idx)) continue;
    filled.add(idx);
    for (const d of DIRS) {
      if (!(open(r, c) & d.bit)) continue;
      const nr = r + d.dr;
      const nc = c + d.dc;
      if (nr < 0 || nc < 0 || nr >= SIZE || nc >= SIZE) continue;
      if (open(nr, nc) & d.opposite) stack.push([nr, nc]);
    }
  }
  const connected = filled.has(sinkRow * SIZE + SIZE - 1) && !!(open(sinkRow, SIZE - 1) & E);
  return { filled, connected };
}

export function PipesGame({ onSuccess, onFail, attempt }: MiniGameProps) {
  const initial = useMemo(() => {
    let p = generate();
    while (flow(p).connected) p = generate();
    return p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);
  const [puzzle, setPuzzle] = useState(initial);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const doneRef = useRef(false);
  const { filled, connected } = flow(puzzle);

  useEffect(() => {
    if (connected && !doneRef.current) {
      doneRef.current = true;
      setTimeout(onSuccess, 600);
    }
  }, [connected, onSuccess]);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1 && !doneRef.current) {
          doneRef.current = true;
          clearInterval(t);
          onFail("Temps écoulé : la box n'est toujours pas reliée au PC.");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [onFail]);

  const turn = (i: number) => {
    if (doneRef.current) return;
    setPuzzle((p) => ({ ...p, tiles: p.tiles.map((t, j) => (j === i ? { ...t, rot: t.rot + 1 } : t)) }));
  };

  const cell = 64;
  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div className="flex items-center gap-6 text-sm">
        <span className={connected ? "text-emerald-400" : "text-white/70"}>{connected ? "Connexion rétablie !" : "Réseau : hors ligne"}</span>
        <span className={`tabular-nums font-mono ${timeLeft <= 10 ? "text-red-400" : "text-white/70"}`}>⏱ {timeLeft} s</span>
      </div>
      <div className="flex items-stretch">
        <div className="flex flex-col py-2 pr-2">
          {Array.from({ length: SIZE }, (_, r) => (
            <div key={r} className="flex items-center" style={{ height: cell }}>
              {r === puzzle.sourceRow && (
                <span className="flex items-center gap-1 text-xs text-sky-300">
                  <Router className="w-6 h-6" /> Box
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="grid p-2 bg-[#0d1117] rounded-lg" style={{ gridTemplateColumns: `repeat(${SIZE}, ${cell}px)` }}>
          {puzzle.tiles.map((t, i) => {
            const mask = rotate(t.base, t.rot);
            const wet = filled.has(i);
            const stroke = wet ? "#38bdf8" : "#6b7280";
            return (
              <button
                key={i}
                onClick={() => turn(i)}
                className="relative border border-white/5 hover:bg-white/5"
                style={{ width: cell, height: cell }}
                aria-label={`Tuyau ligne ${Math.floor(i / SIZE) + 1}, colonne ${(i % SIZE) + 1}`}
              >
                <svg viewBox="0 0 64 64" className="w-full h-full transition-transform">
                  {mask & N ? <line x1="32" y1="32" x2="32" y2="0" stroke={stroke} strokeWidth="12" strokeLinecap="square" /> : null}
                  {mask & E ? <line x1="32" y1="32" x2="64" y2="32" stroke={stroke} strokeWidth="12" strokeLinecap="square" /> : null}
                  {mask & S ? <line x1="32" y1="32" x2="32" y2="64" stroke={stroke} strokeWidth="12" strokeLinecap="square" /> : null}
                  {mask & W ? <line x1="32" y1="32" x2="0" y2="32" stroke={stroke} strokeWidth="12" strokeLinecap="square" /> : null}
                  <circle cx="32" cy="32" r="7" fill={stroke} />
                </svg>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col py-2 pl-2">
          {Array.from({ length: SIZE }, (_, r) => (
            <div key={r} className="flex items-center" style={{ height: cell }}>
              {r === puzzle.sinkRow && (
                <span className={`flex items-center gap-1 text-xs ${connected ? "text-emerald-400" : "text-white/70"}`}>
                  PC <Monitor className="w-6 h-6" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-white/50 text-center max-w-md">
        Cliquez sur un tuyau pour le faire pivoter d&apos;un quart de tour. Reliez la box (à gauche) au PC (à droite).
      </p>
    </div>
  );
}
