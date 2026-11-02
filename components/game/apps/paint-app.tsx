"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Circle, Eraser, Minus, PaintBucket, Pencil, Redo2, Square, Trash2, Undo2 } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { PAINT_CLUE, PAINT_PALETTE, drawPenseBete } from "@/lib/data/paint";

type Tool = "pencil" | "eraser" | "line" | "rect" | "ellipse" | "fill";

const TOOLS: { id: Tool; label: string; icon: typeof Pencil }[] = [
  { id: "pencil", label: "Crayon", icon: Pencil },
  { id: "eraser", label: "Gomme", icon: Eraser },
  { id: "line", label: "Ligne", icon: Minus },
  { id: "rect", label: "Rectangle", icon: Square },
  { id: "ellipse", label: "Ellipse", icon: Circle },
  { id: "fill", label: "Remplissage", icon: PaintBucket },
];

const WIDTH = 900;
const HEIGHT = 560;

export function PaintApp() {
  const { saveUserFile, addClue } = useGame();
  const { playSound } = useSound();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(4);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fileName, setFileName] = useState("Sans titre");
  const [toast, setToast] = useState<string | null>(null);
  const undoRef = useRef<ImageData[]>([]);
  const redoRef = useRef<ImageData[]>([]);
  const drawRef = useRef<{ x: number; y: number; snapshot: ImageData } | null>(null);

  const ctx = () => canvasRef.current?.getContext("2d", { willReadFrequently: true }) ?? null;

  const clearCanvas = useCallback(() => {
    const c = ctx();
    if (!c) return;
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, WIDTH, HEIGHT);
  }, []);

  useEffect(() => {
    clearCanvas();
  }, [clearCanvas]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const pushUndo = () => {
    const c = ctx();
    if (!c) return;
    undoRef.current = [...undoRef.current, c.getImageData(0, 0, WIDTH, HEIGHT)].slice(-30);
    redoRef.current = [];
  };

  const undo = () => {
    const c = ctx();
    const last = undoRef.current.pop();
    if (!c || !last) return;
    redoRef.current.push(c.getImageData(0, 0, WIDTH, HEIGHT));
    c.putImageData(last, 0, 0);
  };

  const redo = () => {
    const c = ctx();
    const next = redoRef.current.pop();
    if (!c || !next) return;
    undoRef.current.push(c.getImageData(0, 0, WIDTH, HEIGHT));
    c.putImageData(next, 0, 0);
  };

  const pointer = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * WIDTH, y: ((e.clientY - rect.top) / rect.height) * HEIGHT };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const c = ctx();
    if (!c) return;
    const p = pointer(e);
    pushUndo();
    if (tool === "fill") {
      floodFill(c, Math.round(p.x), Math.round(p.y), color);
      return;
    }
    canvasRef.current!.setPointerCapture(e.pointerId);
    drawRef.current = { ...p, snapshot: c.getImageData(0, 0, WIDTH, HEIGHT) };
    if (tool === "pencil" || tool === "eraser") {
      c.beginPath();
      c.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
      c.fillStyle = tool === "eraser" ? "#ffffff" : color;
      c.fill();
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const c = ctx();
    const start = drawRef.current;
    if (!c || !start) return;
    const p = pointer(e);
    c.lineCap = "round";
    c.lineJoin = "round";
    c.lineWidth = tool === "eraser" ? size * 3 : size;
    c.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    if (tool === "pencil" || tool === "eraser") {
      c.beginPath();
      c.moveTo(start.x, start.y);
      c.lineTo(p.x, p.y);
      c.stroke();
      drawRef.current = { ...start, x: p.x, y: p.y };
      return;
    }
    // Formes : on repart de l'image d'avant pour afficher un aperçu
    c.putImageData(start.snapshot, 0, 0);
    c.beginPath();
    if (tool === "line") {
      c.moveTo(start.x, start.y);
      c.lineTo(p.x, p.y);
    } else if (tool === "rect") {
      c.rect(start.x, start.y, p.x - start.x, p.y - start.y);
    } else if (tool === "ellipse") {
      c.ellipse((start.x + p.x) / 2, (start.y + p.y) / 2, Math.abs(p.x - start.x) / 2, Math.abs(p.y - start.y) / 2, 0, 0, Math.PI * 2);
    }
    c.stroke();
  };

  const onPointerUp = () => {
    drawRef.current = null;
  };

  const openRecent = () => {
    const c = ctx();
    if (!c) return;
    pushUndo();
    drawPenseBete(c, WIDTH, HEIGHT);
    setFileName("pense-bete.png");
    addClue({ category: "password", text: PAINT_CLUE.text, source: "Paint : pense-bete.png", ref: { kind: "app", id: "paint:" } });
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const name = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
    saveUserFile({ name: name === "pense-bete.png" ? "pense-bete (copie).png" : name, content: "", imageSrc: canvas.toDataURL("image/png") });
    playSound("success");
    setToast("Image enregistrée dans Images");
  };

  const menu: { label: string; action: () => void }[] = [
    {
      label: "Nouveau",
      action: () => {
        pushUndo();
        clearCanvas();
        setFileName("Sans titre");
      },
    },
    { label: "Récent : pense-bete.png (3 février 2025)", action: openRecent },
    { label: "Enregistrer dans Images", action: save },
  ];

  return (
    <div className="relative flex flex-col h-full bg-[#f3f3f3] text-gray-800 select-none">
      <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-300 bg-white text-sm">
        <div className="relative">
          <button onClick={() => setMenuOpen((o) => !o)} className={`px-3 py-1 rounded ${menuOpen ? "bg-gray-200" : "hover:bg-gray-100"}`}>
            Fichier
          </button>
          {menuOpen && (
            <div className="absolute left-0 top-full mt-1 z-20 w-72 bg-white border border-gray-200 rounded-md shadow-xl p-1">
              {menu.map((m) => (
                <button
                  key={m.label}
                  onClick={() => {
                    playSound("click");
                    setMenuOpen(false);
                    m.action();
                  }}
                  className="w-full text-left px-3 py-1.5 rounded hover:bg-gray-100"
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="ml-3 text-xs text-gray-500 truncate">{fileName}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-3 py-2 border-b border-gray-300 bg-[#fafafa]">
        <div className="flex gap-1">
          {TOOLS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              className={`p-2 rounded border ${tool === id ? "bg-blue-100 border-blue-400" : "border-transparent hover:bg-gray-200"}`}
              title={label}
              aria-label={label}
              aria-pressed={tool === id}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
        <div className="w-px h-8 bg-gray-300" />
        <label className="flex items-center gap-2 text-xs text-gray-600">
          Taille
          <input type="range" min={1} max={30} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-24" aria-label="Taille du trait" />
        </label>
        <div className="w-px h-8 bg-gray-300" />
        <div className="flex flex-wrap gap-1 max-w-[260px]">
          {PAINT_PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded border ${color === c ? "ring-2 ring-blue-500 ring-offset-1" : "border-gray-300"}`}
              style={{ backgroundColor: c }}
              aria-label={`Couleur ${c}`}
            />
          ))}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 p-0 border-0 bg-transparent" aria-label="Autre couleur" />
        </div>
        <div className="w-px h-8 bg-gray-300" />
        <button onClick={undo} className="p-2 rounded hover:bg-gray-200" title="Annuler" aria-label="Annuler">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={redo} className="p-2 rounded hover:bg-gray-200" title="Rétablir" aria-label="Rétablir">
          <Redo2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            pushUndo();
            clearCanvas();
          }}
          className="p-2 rounded hover:bg-gray-200"
          title="Tout effacer"
          aria-label="Tout effacer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-[#e8ebf0]">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`bg-white shadow-md max-w-full touch-none ${tool === "fill" ? "cursor-cell" : "cursor-crosshair"}`}
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
          aria-label="Zone de dessin"
        />
      </div>

      {toast && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded bg-gray-900 text-white text-sm shadow-xl animate-fade-in">{toast}</div>
      )}
    </div>
  );
}

/** Pot de peinture : remplit la zone de même couleur autour du point */
function floodFill(c: CanvasRenderingContext2D, x: number, y: number, hex: string) {
  const { width, height } = c.canvas;
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const image = c.getImageData(0, 0, width, height);
  const data = image.data;
  const target = (y * width + x) * 4;
  const [tr, tg, tb, ta] = [data[target], data[target + 1], data[target + 2], data[target + 3]];
  const fill = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255];
  if (tr === fill[0] && tg === fill[1] && tb === fill[2]) return;
  const match = (i: number) =>
    Math.abs(data[i] - tr) < 24 && Math.abs(data[i + 1] - tg) < 24 && Math.abs(data[i + 2] - tb) < 24 && Math.abs(data[i + 3] - ta) < 24;
  const stack = [[x, y]];
  while (stack.length) {
    const [px, py] = stack.pop()!;
    const i = (py * width + px) * 4;
    if (px < 0 || py < 0 || px >= width || py >= height || !match(i)) continue;
    data[i] = fill[0];
    data[i + 1] = fill[1];
    data[i + 2] = fill[2];
    data[i + 3] = 255;
    stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
  }
  c.putImageData(image, 0, 0);
}
