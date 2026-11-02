"use client";

import { useCallback, useEffect, useState } from "react";
import { Bomb, Flag, Trophy } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { gameNow } from "@/lib/game-clock";
import { LEVELS, MINESWEEPER_CLUE, type MinesweeperLevel } from "@/lib/data/minesweeper";

interface Cell {
  mine: boolean;
  open: boolean;
  flag: boolean;
  around: number;
}

type Status = "ready" | "playing" | "won" | "lost";

const NUMBER_COLORS = ["", "#2563eb", "#16a34a", "#dc2626", "#1e3a8a", "#7f1d1d", "#0e7490", "#111827", "#6b7280"];

function emptyBoard(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ mine: false, open: false, flag: false, around: 0 })));
}

const neighbors = (r: number, c: number, rows: number, cols: number) => {
  const list: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < rows && nc < cols) list.push([nr, nc]);
    }
  return list;
};

/** Pose les mines en évitant la première case cliquée et ses voisines */
function plantMines(board: Cell[][], mines: number, safeR: number, safeC: number) {
  const rows = board.length;
  const cols = board[0].length;
  const forbidden = new Set([`${safeR}:${safeC}`, ...neighbors(safeR, safeC, rows, cols).map(([r, c]) => `${r}:${c}`)]);
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (board[r][c].mine || forbidden.has(`${r}:${c}`)) continue;
    board[r][c].mine = true;
    placed++;
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) board[r][c].around = neighbors(r, c, rows, cols).filter(([nr, nc]) => board[nr][nc].mine).length;
}

/** Ouvre une case et, si elle est vide, toute la zone autour */
function reveal(board: Cell[][], r: number, c: number) {
  const rows = board.length;
  const cols = board[0].length;
  const stack: [number, number][] = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop()!;
    const cell = board[cr][cc];
    if (cell.open || cell.flag) continue;
    cell.open = true;
    if (cell.around === 0 && !cell.mine) stack.push(...neighbors(cr, cc, rows, cols));
  }
}

export function MinesweeperApp() {
  const { minesweeperScores, recordMinesweeperScore, addClue } = useGame();
  const { playSound } = useSound();
  const [level, setLevel] = useState<MinesweeperLevel>("beginner");
  const { rows, cols, mines } = LEVELS[level];
  const [board, setBoard] = useState(() => emptyBoard(rows, cols));
  const [status, setStatus] = useState<Status>("ready");
  const [seconds, setSeconds] = useState(0);
  const [showScores, setShowScores] = useState(false);
  const [newRecord, setNewRecord] = useState(false);

  const reset = useCallback((lvl: MinesweeperLevel = level) => {
    setLevel(lvl);
    setBoard(emptyBoard(LEVELS[lvl].rows, LEVELS[lvl].cols));
    setStatus("ready");
    setSeconds(0);
    setNewRecord(false);
  }, [level]);

  useEffect(() => {
    if (status !== "playing") return;
    const t = setInterval(() => setSeconds((s) => Math.min(999, s + 1)), 1000);
    return () => clearInterval(t);
  }, [status]);

  // Indice : le tableau des records signé "BSM"
  useEffect(() => {
    if (!showScores) return;
    addClue({ category: "place", text: MINESWEEPER_CLUE, source: "Démineur : meilleurs scores", ref: { kind: "app", id: "minesweeper:" } });
  }, [showScores, addClue]);

  const flags = board.flat().filter((c) => c.flag).length;

  const openCell = (r: number, c: number) => {
    if (status === "won" || status === "lost") return;
    const next = board.map((row) => row.map((cell) => ({ ...cell })));
    if (status === "ready") {
      plantMines(next, mines, r, c);
      setStatus("playing");
    }
    const cell = next[r][c];
    if (cell.flag || cell.open) return;
    if (cell.mine) {
      next.forEach((row) => row.forEach((x) => x.mine && (x.open = true)));
      setBoard(next);
      setStatus("lost");
      playSound("error");
      return;
    }
    reveal(next, r, c);
    setBoard(next);
    playSound("click");
    const closedSafe = next.flat().filter((x) => !x.open && !x.mine).length;
    if (closedSafe === 0) {
      setStatus("won");
      playSound("success");
      const finalTime = Math.max(1, seconds);
      if (finalTime < minesweeperScores[level].seconds) {
        setNewRecord(true);
        recordMinesweeperScore(level, {
          name: "Vous",
          seconds: finalTime,
          date: gameNow().toLocaleDateString("fr-FR"),
        });
      }
    }
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (status === "won" || status === "lost") return;
    const cell = board[r][c];
    if (cell.open) return;
    setBoard(board.map((row, ri) => row.map((x, ci) => (ri === r && ci === c ? { ...x, flag: !x.flag } : x))));
  };

  const face = status === "lost" ? "😵" : status === "won" ? "😎" : "🙂";
  const cellSize = level === "beginner" ? 34 : 22;

  return (
    <div className="relative h-full flex flex-col bg-[#c0c0c0] select-none" onContextMenu={(e) => e.preventDefault()}>
      <div className="flex items-center gap-1 px-2 py-1 bg-[#efefef] border-b border-gray-400 text-sm text-gray-800">
        {(Object.keys(LEVELS) as MinesweeperLevel[]).map((lvl) => (
          <button
            key={lvl}
            onClick={() => reset(lvl)}
            className={`px-2 py-0.5 rounded ${level === lvl ? "bg-white shadow-sm" : "hover:bg-white/60"}`}
          >
            {LEVELS[lvl].label}
          </button>
        ))}
        <button onClick={() => setShowScores((s) => !s)} className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/60">
          <Trophy className="w-3.5 h-3.5" /> Meilleurs scores
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-3 overflow-auto">
        <div className="p-2 bg-[#c0c0c0] border-4 border-t-white border-l-white border-b-gray-500 border-r-gray-500">
          <div className="flex items-center justify-between mb-2 p-1 border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white">
            <span className="font-mono text-2xl text-red-600 bg-black px-1 tabular-nums">{String(Math.max(0, mines - flags)).padStart(3, "0")}</span>
            <button
              onClick={() => reset()}
              className="w-9 h-9 text-xl bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 active:border-t-gray-500 active:border-l-gray-500"
              aria-label="Nouvelle partie"
            >
              {face}
            </button>
            <span className="font-mono text-2xl text-red-600 bg-black px-1 tabular-nums">{String(seconds).padStart(3, "0")}</span>
          </div>
          <div
            className="grid border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white"
            style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => openCell(r, c)}
                  onContextMenu={(e) => toggleFlag(e, r, c)}
                  className={`flex items-center justify-center font-bold ${
                    cell.open
                      ? `border border-gray-400 ${cell.mine ? "bg-red-500" : "bg-[#d4d4d4]"}`
                      : "bg-[#c0c0c0] border-[3px] border-t-white border-l-white border-b-gray-500 border-r-gray-500"
                  }`}
                  style={{ width: cellSize, height: cellSize, fontSize: cellSize * 0.5, color: NUMBER_COLORS[cell.around] }}
                  aria-label={cell.open ? (cell.mine ? "Mine" : `${cell.around}`) : cell.flag ? "Drapeau" : "Case fermée"}
                >
                  {cell.open ? (cell.mine ? <Bomb className="w-1/2 h-1/2 text-black" /> : cell.around || "") : cell.flag ? <Flag className="w-1/2 h-1/2 text-red-600" /> : ""}
                </button>
              ))
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-700 h-4">
          {status === "won"
            ? newRecord
              ? `Gagné en ${seconds} s — nouveau record !`
              : `Gagné en ${seconds} s. Record à battre : ${minesweeperScores[level].seconds} s.`
            : status === "lost"
            ? "Perdu ! Cliquez sur le visage pour rejouer."
            : "Clic gauche : ouvrir · clic droit : drapeau"}
        </p>
      </div>

      {showScores && (
        <div className="absolute inset-x-6 top-16 bg-white border border-gray-400 shadow-xl p-4 text-sm text-gray-800 z-10">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Meilleurs scores
          </h3>
          <table className="w-full">
            <tbody>
              {(Object.keys(LEVELS) as MinesweeperLevel[]).map((lvl) => (
                <tr key={lvl} className="border-t border-gray-200">
                  <td className="py-1.5">{LEVELS[lvl].label}</td>
                  <td className="py-1.5 font-mono font-semibold">{minesweeperScores[lvl].name}</td>
                  <td className="py-1.5 tabular-nums">{minesweeperScores[lvl].seconds} s</td>
                  <td className="py-1.5 text-gray-500">{minesweeperScores[lvl].date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setShowScores(false)} className="mt-3 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs">
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}
