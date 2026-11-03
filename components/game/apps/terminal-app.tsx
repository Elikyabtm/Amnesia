"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGame, type AppType, type WindowState } from "@/lib/game-context";
import { buildFileSystem, fileDetails, findPath, HOME_PATH, pathToString, type VNode } from "@/lib/filesystem";
import { useFileClueDetector } from "@/lib/use-file-clue-detector";
import { gameNow } from "@/lib/game-clock";
import { parseEventDate } from "@/lib/calendar-utils";
import { COMMAND_HISTORY, COMMAND_HISTORY_DATE, HIDDEN_FILES, TERMINAL_SECRETS } from "@/lib/data/terminal";
import { APPS } from "../app-registry";

interface TerminalAppProps {
  window: WindowState;
}

interface Line {
  text: string;
  kind?: "input" | "error" | "muted";
}

const BANNER: Line[] = [
  { text: "AmnesiaOS [version 1.0.1832]" },
  { text: "(c) Mairie de Bourg-sur-Mer. Tous droits réservés.", kind: "muted" },
  { text: "Tapez « help » pour afficher la liste des commandes.", kind: "muted" },
  { text: "" },
];

const HELP: string[] = [
  "Commandes disponibles :",
  "  help            Affiche cette aide",
  "  dir [dossier]   Liste le contenu d'un dossier",
  "  cd <dossier>    Change de dossier (cd .. pour remonter)",
  "  type <fichier>  Affiche le contenu d'un fichier texte",
  "  start <nom>     Ouvre un fichier ou une application",
  "  whoami          Affiche l'utilisateur courant",
  "  date            Affiche la date et l'heure",
  "  echo <texte>    Affiche un texte",
  "  ver             Version du système",
  "  cls             Efface l'écran",
  "  exit            Ferme le terminal",
];

const strip = (s: string) => s.trim().replace(/^"(.*)"$/, "$1");
const same = (a: string, b: string) => a.localeCompare(b, "fr", { sensitivity: "base" }) === 0;

export function TerminalApp({ window: win }: TerminalAppProps) {
  const {
    desktopFolders,
    trashRestoredIds,
    userFiles,
    isItemLocked,
    discoverSecret,
    addSuspicion,
    openWindow,
    closeWindow,
  } = useGame();
  const detectClues = useFileClueDetector();
  const root = useMemo(() => buildFileSystem({ desktopFolders, trashRestoredIds, userFiles }), [desktopFolders, trashRestoredIds, userFiles]);

  const [cwd, setCwd] = useState<string>("home");
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Bloc explicite : scrollIntoView peut renvoyer une Promise dans les navigateurs récents
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const cwdPath = findPath(root, cwd) ?? [root];
  const prompt = `${pathToString(cwdPath)}>`;

  /** Résout un chemin (absolu ou relatif) vers une liste de nœuds, ou un message d'erreur */
  const resolve = (raw: string): VNode[] | string => {
    let arg = strip(raw).replace(/\//g, "\\");
    let path: VNode[];
    if (/^c:\\?$/i.test(arg) || /^c:\\users\\?$/i.test(arg)) return "Accès refusé.";
    if (/^c:\\users\\bdupuis/i.test(arg)) {
      path = [root];
      arg = arg.slice(HOME_PATH.length);
    } else if (arg.startsWith("\\")) {
      path = [root];
    } else {
      path = [...cwdPath];
    }
    for (const part of arg.split("\\").filter(Boolean)) {
      if (part === ".") continue;
      if (part === "..") {
        if (path.length === 1) return "Accès refusé.";
        path = path.slice(0, -1);
        continue;
      }
      const current = path[path.length - 1];
      if (current.lockId && isItemLocked(current.lockId)) return "Accès refusé.";
      const child = childrenOf(current).find((c) => same(c.name, part));
      if (!child) return "Le chemin d'accès spécifié est introuvable.";
      path = [...path, child];
    }
    return path;
  };

  /** Enfants d'un dossier, y compris les fichiers cachés (pour cd/type) */
  const childrenOf = (node: VNode, includeHidden = true): VNode[] => [
    ...(node.children ?? []),
    ...(includeHidden
      ? HIDDEN_FILES.filter((h) => h.folderId === node.id).map((h) => ({ id: h.file.id, name: h.file.name, kind: "file" as const, file: h.file }))
      : []),
  ];

  const isHidden = (node: VNode) => HIDDEN_FILES.some((h) => h.file.id === node.id);

  const runDir = (args: string[]): Line[] => {
    const showAll = args.some((a) => a.toLowerCase() === "/a");
    const target = args.filter((a) => !a.startsWith("/")).join(" ");
    const resolved = target ? resolve(target) : cwdPath;
    if (typeof resolved === "string") return [{ text: resolved, kind: "error" }];
    const folder = resolved[resolved.length - 1];
    if (folder.kind !== "folder") return [{ text: "Le nom du répertoire n'est pas valide.", kind: "error" }];
    if (folder.lockId && isItemLocked(folder.lockId)) return [{ text: "Accès refusé.", kind: "error" }];
    const items = childrenOf(folder, showAll);
    const dirs = items.filter((i) => i.kind === "folder");
    const files = items.filter((i) => i.kind === "file");
    // "20 février 2025, 14:15" -> "20/02/2025  14:15"
    const date = (n: VNode) => {
      const modified = fileDetails(n)?.modified;
      const [day, time = "08:15"] = modified?.split(", ") ?? [];
      const parsed = day ? parseEventDate(day) : null;
      if (!parsed) return "03/02/2025  08:15";
      const dd = String(parsed.day).padStart(2, "0");
      const mm = String(parsed.month + 1).padStart(2, "0");
      return `${dd}/${mm}/${parsed.year}  ${time}`;
    };
    return [
      { text: " Le volume dans le lecteur C n'a pas de nom." },
      { text: ` Répertoire de ${pathToString(resolved)}` },
      { text: "" },
      ...dirs.map((d) => ({ text: `${date(d).padEnd(20)}  <DIR>          ${d.name}` })),
      ...files.map((f) => ({
        text: `${date(f).padEnd(20)}  ${String((f.file?.content?.length ?? 2048) * 3).padStart(14)} ${f.name}${isHidden(f) ? "   [caché]" : ""}`,
        kind: isHidden(f) ? ("muted" as const) : undefined,
      })),
      { text: `${String(files.length).padStart(16)} fichier(s)` },
      { text: `${String(dirs.length).padStart(16)} Rép(s)` },
    ];
  };

  const runType = (arg: string): Line[] => {
    if (!arg) return [{ text: "Syntaxe de la commande incorrecte.", kind: "error" }];
    const resolved = resolve(arg);
    if (typeof resolved === "string") return [{ text: resolved === "Accès refusé." ? resolved : "Le fichier spécifié est introuvable.", kind: "error" }];
    const node = resolved[resolved.length - 1];
    const parent = resolved[resolved.length - 2];
    if (node.kind === "folder") return [{ text: "Accès refusé.", kind: "error" }];
    if (parent?.lockId && isItemLocked(parent.lockId)) return [{ text: "Accès refusé.", kind: "error" }];
    if (node.file?.type === "image" || (node.file?.type === "audio" && !node.file.content)) return [{ text: `${node.name} : fichier binaire. Utilisez « start ${node.name} » pour l'ouvrir.`, kind: "muted" }];
    if (node.file) detectClues(node.file);
    if (node.id === TERMINAL_SECRETS.hiddenFile.id) {
      addSuspicion({ type: "sensitive_file", amount: 15, message: "Lecture d'un fichier caché" });
      discoverSecret(TERMINAL_SECRETS.hiddenFile.id);
    }
    return (node.file?.content ?? "").split("\n").map((text) => ({ text }));
  };

  const runStart = (arg: string): Line[] => {
    const name = strip(arg);
    if (!name) return [{ text: "Syntaxe : start <fichier ou application>", kind: "error" }];
    const app = (Object.keys(APPS) as AppType[]).find((id) => same(id, name) || same(APPS[id].label, name));
    if (app) {
      openWindow(app);
      return [];
    }
    const resolved = resolve(name);
    if (typeof resolved === "string") return [{ text: `Windows ne trouve pas « ${name} ».`, kind: "error" }];
    const node = resolved[resolved.length - 1];
    if (node.kind === "folder") {
      openWindow("explorer", node.name, undefined, node.id.startsWith("folder-") ? { id: `desktop-folder:${node.id}` } : undefined);
      return [];
    }
    if (node.file?.type === "audio" && node.file.id.startsWith("track")) {
      openWindow("music", undefined, undefined, { id: node.file.id });
      return [];
    }
    if (node.file) {
      openWindow(node.file.type === "image" ? "photos" : "notepad", node.name, node.file);
      detectClues(node.file);
    }
    return [];
  };

  const execute = (raw: string) => {
    const commandLine = raw.trim();
    const echo: Line = { text: `${prompt}${raw}`, kind: "input" };
    if (!commandLine) {
      setLines((l) => [...l, echo]);
      return;
    }
    setHistory((h) => [...h, commandLine]);
    const [cmd, ...args] = commandLine.split(/\s+/);
    const rest = commandLine.slice(cmd.length).trim();
    const c = cmd.toLowerCase();
    let out: Line[] = [];

    switch (c) {
      case "help":
      case "aide":
        out = HELP.map((text) => ({ text }));
        break;
      case "dir":
      case "ls":
        out = runDir(args);
        break;
      case "cd":
      case "cd..":
      case "chdir": {
        const target = c === "cd.." ? ".." : rest;
        if (!target) {
          out = [{ text: pathToString(cwdPath) }];
          break;
        }
        const resolved = resolve(target);
        if (typeof resolved === "string") out = [{ text: resolved, kind: "error" }];
        else if (resolved[resolved.length - 1].kind !== "folder") out = [{ text: "Le nom du répertoire n'est pas valide.", kind: "error" }];
        else {
          const folder = resolved[resolved.length - 1];
          if (folder.lockId && isItemLocked(folder.lockId)) out = [{ text: "Accès refusé.", kind: "error" }];
          else setCwd(folder.id);
        }
        break;
      }
      case "type":
      case "cat":
        out = runType(rest);
        break;
      case "start":
        out = runStart(rest);
        break;
      case "whoami":
        out = [{ text: "mairie-bsm\\bdupuis" }];
        break;
      case "date":
      case "time":
        out = [{ text: gameNow().toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "medium" }) }];
        break;
      case "echo":
        out = [{ text: rest }];
        break;
      case "ver":
        out = [{ text: "AmnesiaOS [version 1.0.1832]" }];
        break;
      case "cls":
      case "clear":
        setLines([]);
        return;
      case "exit":
        closeWindow(win.id);
        return;
      // Commandes cachées (absentes de "help")
      case "history":
      case "doskey":
        if (c === "doskey" && args[0]?.toLowerCase() !== "/history") {
          out = [{ text: "Syntaxe : doskey /history", kind: "error" }];
          break;
        }
        addSuspicion({ type: "sensitive_file", amount: 10, message: "Consultation de l'historique des commandes" });
        discoverSecret(TERMINAL_SECRETS.history.id);
        out = [
          { text: `Historique des commandes — session du ${COMMAND_HISTORY_DATE}`, kind: "muted" },
          ...COMMAND_HISTORY.map((text, i) => ({ text: `${String(i + 1).padStart(3)}  ${text}` })),
        ];
        break;
      default:
        out = [
          { text: `'${cmd}' n'est pas reconnu en tant que commande interne`, kind: "error" },
          { text: "ou externe, un programme exécutable ou un fichier de commandes.", kind: "error" },
        ];
    }
    setLines((l) => [...l, echo, ...out, { text: "" }]);
  };

  const complete = () => {
    const parts = input.split(" ");
    const last = strip(parts[parts.length - 1] ?? "");
    if (!last) return;
    const match = childrenOf(cwdPath[cwdPath.length - 1], false).find((n) => n.name.toLowerCase().startsWith(last.toLowerCase()));
    if (match) {
      parts[parts.length - 1] = match.name.includes(" ") ? `"${match.name}"` : match.name;
      setInput(parts.join(" "));
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      execute(input);
      setInput("");
      setHistoryIndex(null);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const i = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(i);
      setInput(history[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === null) return;
      const i = historyIndex + 1;
      if (i >= history.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(i);
        setInput(history[i]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      className="h-full overflow-y-auto bg-[#0c0c0c] p-3 font-mono text-[13px] leading-5 text-[#cccccc] cursor-text"
      onMouseUp={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus();
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          className={`whitespace-pre-wrap break-words ${line.kind === "error" ? "text-red-400" : line.kind === "muted" ? "text-white/45" : line.kind === "input" ? "text-white" : ""}`}
        >
          {line.text || "\u00a0"}
        </div>
      ))}
      <div className="flex">
        <span className="whitespace-pre text-white">{prompt}</span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent outline-none text-white caret-white"
          aria-label="Ligne de commande"
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}
