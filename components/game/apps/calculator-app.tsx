"use client";

import { useEffect, useRef, useState } from "react";
import { Delete, History } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { CALCULATOR_EASTER_EGGS } from "@/lib/data/calculator";

type Op = "+" | "-" | "×" | "÷";

const format = (n: number) => {
  if (!Number.isFinite(n)) return "Erreur";
  const rounded = Math.round(n * 1e10) / 1e10;
  return String(rounded).replace(".", ",");
};
const parse = (s: string) => Number(s.replace(",", "."));

function compute(a: number, b: number, op: Op) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? NaN : a / b;
  }
}

export function CalculatorApp() {
  const { addClue } = useGame();
  const { playSound } = useSound();
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [expression, setExpression] = useState("");
  const [fresh, setFresh] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const egg = CALCULATOR_EASTER_EGGS.find((e) => e.value === display);

  useEffect(() => {
    if (!egg?.clue) return;
    addClue({
      category: egg.clue.category,
      text: egg.clue.text,
      source: "Calculatrice",
      ref: { kind: "app", id: "calculator:" },
    });
  }, [egg, addClue]);

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  const inputDigit = (d: string) => {
    if (display === "Erreur" || fresh) {
      setDisplay(d === "," ? "0," : d);
      setFresh(false);
      return;
    }
    if (d === "," && display.includes(",")) return;
    if (display.replace(/[-,]/g, "").length >= 16) return;
    setDisplay(display === "0" && d !== "," ? d : display + d);
  };

  const chooseOp = (next: Op) => {
    const value = parse(display);
    if (stored !== null && op && !fresh) {
      const result = compute(stored, value, op);
      setStored(result);
      setDisplay(format(result));
      setExpression(`${format(result)} ${next}`);
    } else {
      setStored(value);
      setExpression(`${format(value)} ${next}`);
    }
    setOp(next);
    setFresh(true);
  };

  const equals = () => {
    if (stored === null || !op) return;
    const value = parse(display);
    const result = compute(stored, value, op);
    const line = `${format(stored)} ${op} ${format(value)} = ${format(result)}`;
    setHistory((h) => [line, ...h].slice(0, 20));
    setExpression(`${format(stored)} ${op} ${format(value)} =`);
    setDisplay(format(result));
    setStored(null);
    setOp(null);
    setFresh(true);
  };

  const clearAll = () => {
    setDisplay("0");
    setStored(null);
    setOp(null);
    setExpression("");
    setFresh(true);
  };

  const backspace = () => {
    if (fresh || display === "Erreur") return;
    setDisplay(display.length > 1 && !(display.length === 2 && display.startsWith("-")) ? display.slice(0, -1) : "0");
  };

  const percent = () => {
    const value = parse(display);
    setDisplay(format(stored !== null ? (stored * value) / 100 : value / 100));
    setFresh(true);
  };

  const negate = () => {
    if (display === "0" || display === "Erreur") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : `-${display}`);
  };

  const press = (fn: () => void) => () => {
    playSound("click");
    fn();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const k = e.key;
    if (/^[0-9]$/.test(k)) inputDigit(k);
    else if (k === "," || k === ".") inputDigit(",");
    else if (k === "+" || k === "-") chooseOp(k);
    else if (k === "*" || k === "x") chooseOp("×");
    else if (k === "/") chooseOp("÷");
    else if (k === "Enter" || k === "=") equals();
    else if (k === "Backspace") backspace();
    else if (k === "Escape" || k === "Delete") clearAll();
    else if (k === "%") percent();
    else return;
    e.preventDefault();
  };

  const keys: { label: React.ReactNode; action: () => void; style?: "op" | "eq" | "fn"; aria?: string }[] = [
    { label: "%", action: percent, style: "fn" },
    { label: "CE", action: () => setDisplay("0"), style: "fn" },
    { label: "C", action: clearAll, style: "fn" },
    { label: <Delete className="w-4 h-4 mx-auto" />, action: backspace, style: "fn", aria: "Effacer le dernier chiffre" },
    ...["7", "8", "9"].map((d) => ({ label: d, action: () => inputDigit(d) })),
    { label: "÷", action: () => chooseOp("÷"), style: "op" as const },
    ...["4", "5", "6"].map((d) => ({ label: d, action: () => inputDigit(d) })),
    { label: "×", action: () => chooseOp("×"), style: "op" as const },
    ...["1", "2", "3"].map((d) => ({ label: d, action: () => inputDigit(d) })),
    { label: "−", action: () => chooseOp("-"), style: "op" as const, aria: "Moins" },
    { label: "±", action: negate, style: "fn" },
    { label: "0", action: () => inputDigit("0") },
    { label: ",", action: () => inputDigit(",") },
    { label: "+", action: () => chooseOp("+"), style: "op" as const },
  ];

  return (
    <div ref={rootRef} tabIndex={-1} onKeyDown={onKeyDown} className="relative h-full flex flex-col bg-[#202020] text-white outline-none">
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="text-sm text-white/70">Standard</span>
        <button
          onClick={press(() => setShowHistory((s) => !s))}
          className={`p-1.5 rounded ${showHistory ? "bg-white/15" : "hover:bg-white/10"}`}
          title="Historique"
          aria-label="Historique"
        >
          <History className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 pt-4 pb-3 text-right">
        <div className="h-5 text-sm text-white/50 truncate">{expression}</div>
        <div className={`font-semibold tabular-nums truncate ${display.length > 12 ? "text-3xl" : "text-5xl"}`} aria-live="polite">
          {display}
        </div>
        <div className={`h-6 mt-1 text-sm transition-opacity ${egg ? "opacity-100 text-amber-300" : "opacity-0"}`}>{egg?.message}</div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-1 p-2">
        {[...keys, { label: "=", action: equals, style: "eq" as const }].map((k, i) => (
          <button
            key={i}
            onClick={press(k.action)}
            aria-label={k.aria ?? (typeof k.label === "string" ? k.label : undefined)}
            className={`rounded-md text-lg transition-colors ${
              k.style === "eq"
                ? "col-span-4 bg-[#0078d4] hover:bg-[#1084d8]"
                : k.style === "op" || k.style === "fn"
                ? "bg-[#323232] hover:bg-[#3b3b3b]"
                : "bg-[#3b3b3b] hover:bg-[#454545] font-medium"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      {showHistory && (
        <div className="absolute inset-x-0 bottom-0 top-12 bg-[#1b1b1b]/95 backdrop-blur border-t border-white/10 p-4 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-sm text-white/50">Il n&apos;y a pas encore d&apos;historique.</p>
          ) : (
            <ul className="space-y-3 text-right">
              {history.map((h, i) => (
                <li key={i} className="text-sm text-white/80 tabular-nums">{h}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
