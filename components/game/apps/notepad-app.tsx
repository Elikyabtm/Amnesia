"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Save, Printer, Search, Undo, Redo, Copy, Scissors, ClipboardPaste, X, ChevronDown, ChevronUp } from "lucide-react";
import { useGame, type WindowState } from "@/lib/game-context";
import { type FileItem } from "@/lib/game-data";
import { useSound } from "@/hooks/use-sound";
import { useTextHighlight } from "@/lib/use-text-highlight";
import { gameNow } from "@/lib/game-clock";

interface NotepadAppProps {
  window: WindowState;
}

type MenuId = "file" | "edit" | "format" | "view" | "help";

const MIN_ZOOM = 50;
const MAX_ZOOM = 300;

export function NotepadApp({ window: win }: NotepadAppProps) {
  const { openWindow, closeWindow, saveUserFile } = useGame();
  const { playSound } = useSound();

  const fileContent = win.content as FileItem | string | undefined;
  const sourceFile = typeof fileContent === "object" ? fileContent : undefined;
  // Les fichiers du jeu sont en lecture seule ; les documents du joueur restent modifiables
  const readOnly = !!sourceFile && !sourceFile.id.startsWith("user-");

  const [content, setContent] = useState(typeof fileContent === "string" ? fileContent : sourceFile?.content ?? "");
  const [savedId, setSavedId] = useState<string | undefined>(sourceFile?.id.startsWith("user-") ? sourceFile.id : undefined);
  const [fileName, setFileName] = useState(sourceFile?.name ?? "Sans titre.txt");
  const [dirty, setDirty] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [wordWrap, setWordWrap] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [zoom, setZoom] = useState(100);
  const [showStatus, setShowStatus] = useState(true);
  const [caret, setCaret] = useState({ line: 1, col: 1 });
  const [findOpen, setFindOpen] = useState(false);
  const [findText, setFindText] = useState("");
  const [findIndex, setFindIndex] = useState(0);
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [dialog, setDialog] = useState<string | null>(null);
  const historyRef = useRef<{ stack: string[]; index: number }>({ stack: [content], index: 0 });

  const contentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // Passage venant du carnet d'indices / de la recherche, sinon recherche en cours
  const matches = findText ? countMatches(content, findText) : 0;
  const occurrence = matches > 0 ? ((findIndex % matches) + matches) % matches : 0;
  const finding = findOpen && !!findText && matches > 0;
  // Lecture seule : surlignage ; document modifiable : sélection dans la zone de saisie
  useTextHighlight(
    contentRef,
    finding && readOnly ? findText : finding ? undefined : win.target?.highlight,
    win.id,
    [content, finding],
    finding ? occurrence : 0
  );
  useEffect(() => {
    const el = textareaRef.current;
    if (!finding || readOnly || !el) return;
    const start = nthIndex(content, findText, occurrence);
    if (start < 0) return;
    el.setSelectionRange(start, start + findText.length);
    // Fait défiler jusqu'à la sélection
    const lineHeight = (fontSize * zoom) / 100 * 1.6;
    el.scrollTop = Math.max(0, content.slice(0, start).split("\n").length * lineHeight - el.clientHeight / 2);
  }, [finding, findText, occurrence, content, readOnly, fontSize, zoom]);

  useEffect(() => {
    if (!openMenu) return;
    const close = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [openMenu]);

  // Raccourcis clavier classiques du Bloc-notes
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === "s") { e.preventDefault(); save(); }
    if (k === "f") { e.preventDefault(); setFindOpen(true); }
    if (k === "z" && !readOnly) { e.preventDefault(); undo(); }
    if (k === "y" && !readOnly) { e.preventDefault(); redo(); }
    if (k === "=" || k === "+") { e.preventDefault(); changeZoom(10); }
    if (k === "-") { e.preventDefault(); changeZoom(-10); }
  };

  const pushHistory = (value: string) => {
    const h = historyRef.current;
    h.stack = [...h.stack.slice(0, h.index + 1), value].slice(-100);
    h.index = h.stack.length - 1;
  };

  const updateContent = (value: string) => {
    setContent(value);
    setDirty(true);
    pushHistory(value);
  };

  const undo = () => {
    const h = historyRef.current;
    if (h.index === 0) return;
    h.index -= 1;
    setContent(h.stack[h.index]);
    setDirty(true);
  };

  const redo = () => {
    const h = historyRef.current;
    if (h.index >= h.stack.length - 1) return;
    h.index += 1;
    setContent(h.stack[h.index]);
    setDirty(true);
  };

  const changeZoom = (delta: number) => setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));

  const updateCaret = () => {
    const el = textareaRef.current;
    if (!el) return;
    const before = el.value.slice(0, el.selectionStart);
    const lines = before.split("\n");
    setCaret({ line: lines.length, col: lines[lines.length - 1].length + 1 });
  };

  const save = () => {
    if (readOnly) {
      setDialog("Ce fichier est en lecture seule. Utilisez « Enregistrer sous » pour en faire une copie dans Documents.");
      return;
    }
    if (!savedId) {
      setSaveAsOpen(true);
      return;
    }
    saveUserFile({ id: savedId, name: fileName, content });
    playSound("success");
    setDirty(false);
  };

  const saveAs = (name: string) => {
    const saved = saveUserFile({ name, content });
    setSavedId(saved.id);
    setFileName(saved.name);
    setSaveAsOpen(false);
    setDirty(false);
    playSound("success");
  };

  const clipboard = async (action: "cut" | "copy" | "paste") => {
    const el = textareaRef.current;
    const selection = el ? el.value.slice(el.selectionStart, el.selectionEnd) : window.getSelection()?.toString() ?? "";
    try {
      if (action === "paste") {
        if (readOnly || !el) return;
        const text = await navigator.clipboard.readText();
        const next = el.value.slice(0, el.selectionStart) + text + el.value.slice(el.selectionEnd);
        updateContent(next);
        return;
      }
      if (selection) await navigator.clipboard.writeText(selection);
      if (action === "cut" && el && !readOnly && selection) {
        updateContent(el.value.slice(0, el.selectionStart) + el.value.slice(el.selectionEnd));
      }
    } catch {
      setDialog("Le presse-papiers n'est pas accessible dans ce navigateur.");
    }
  };

  const insertDate = () => {
    if (readOnly) return;
    const el = textareaRef.current;
    const stamp = gameNow().toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
    const pos = el?.selectionStart ?? content.length;
    updateContent(content.slice(0, pos) + stamp + content.slice(el?.selectionEnd ?? pos));
  };

  const selectAll = () => {
    const el = textareaRef.current;
    if (el) {
      el.focus();
      el.select();
    } else if (contentRef.current) {
      const range = document.createRange();
      range.selectNodeContents(contentRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  const menus: Record<MenuId, { label: string; items: { label: string; shortcut?: string; action: () => void; disabled?: boolean; checked?: boolean }[] }> = {
    file: {
      label: "Fichier",
      items: [
        { label: "Nouveau", shortcut: "Ctrl+N", action: () => openWindow("notepad") },
        { label: "Enregistrer", shortcut: "Ctrl+S", action: save },
        { label: "Enregistrer sous...", action: () => setSaveAsOpen(true) },
        { label: "Imprimer...", shortcut: "Ctrl+P", action: () => setDialog("Aucune imprimante n'est connectée à cet ordinateur.") },
        { label: "Fermer", action: () => closeWindow(win.id) },
      ],
    },
    edit: {
      label: "Édition",
      items: [
        { label: "Annuler", shortcut: "Ctrl+Z", action: undo, disabled: readOnly },
        { label: "Rétablir", shortcut: "Ctrl+Y", action: redo, disabled: readOnly },
        { label: "Couper", shortcut: "Ctrl+X", action: () => clipboard("cut"), disabled: readOnly },
        { label: "Copier", shortcut: "Ctrl+C", action: () => clipboard("copy") },
        { label: "Coller", shortcut: "Ctrl+V", action: () => clipboard("paste"), disabled: readOnly },
        { label: "Rechercher...", shortcut: "Ctrl+F", action: () => setFindOpen(true) },
        { label: "Tout sélectionner", shortcut: "Ctrl+A", action: selectAll },
        { label: "Heure/Date", shortcut: "F5", action: insertDate, disabled: readOnly },
      ],
    },
    format: {
      label: "Format",
      items: [
        { label: "Retour automatique à la ligne", action: () => setWordWrap((w) => !w), checked: wordWrap },
        { label: "Agrandir la police", action: () => setFontSize((s) => Math.min(28, s + 2)) },
        { label: "Réduire la police", action: () => setFontSize((s) => Math.max(10, s - 2)) },
      ],
    },
    view: {
      label: "Affichage",
      items: [
        { label: "Zoom avant", shortcut: "Ctrl++", action: () => changeZoom(10) },
        { label: "Zoom arrière", shortcut: "Ctrl+-", action: () => changeZoom(-10) },
        { label: "Rétablir le zoom par défaut", action: () => setZoom(100) },
        { label: "Barre d'état", action: () => setShowStatus((s) => !s), checked: showStatus },
      ],
    },
    help: {
      label: "Aide",
      items: [{ label: "À propos du Bloc-notes", action: () => setDialog("Bloc-notes — AmnesiaOS v1.0\nMairie de Bourg-sur-Mer, poste du maire.") }],
    },
  };

  const toolbar: { icon: typeof FileText; title: string; action: () => void; disabled?: boolean }[] = [
    { icon: FileText, title: "Nouveau", action: () => openWindow("notepad") },
    { icon: Save, title: "Enregistrer", action: save },
    { icon: Printer, title: "Imprimer", action: () => setDialog("Aucune imprimante n'est connectée à cet ordinateur.") },
    { icon: Undo, title: "Annuler", action: undo, disabled: readOnly },
    { icon: Redo, title: "Rétablir", action: redo, disabled: readOnly },
    { icon: Scissors, title: "Couper", action: () => clipboard("cut"), disabled: readOnly },
    { icon: Copy, title: "Copier", action: () => clipboard("copy") },
    { icon: ClipboardPaste, title: "Coller", action: () => clipboard("paste"), disabled: readOnly },
    { icon: Search, title: "Rechercher", action: () => setFindOpen(true) },
  ];

  const textStyle = { fontSize: (fontSize * zoom) / 100 };

  return (
    // tabIndex : la fenêtre reçoit le focus au clic, même en lecture seule, pour les raccourcis
    <div className="relative flex flex-col h-full bg-[#1e1e1e] outline-none" onKeyDown={onKeyDown} tabIndex={-1}>
      {/* Barre de menus */}
      <div ref={menuBarRef} className="relative flex items-center gap-1 px-2 py-1 border-b border-white/10 bg-[#252525] text-xs">
        {(Object.keys(menus) as MenuId[]).map((id) => (
          <div key={id} className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === id ? null : id)}
              onMouseEnter={() => openMenu && setOpenMenu(id)}
              className={`px-3 py-1 rounded transition-colors ${openMenu === id ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10"}`}
            >
              {menus[id].label}
            </button>
            {openMenu === id && (
              <div className="absolute left-0 top-full mt-0.5 z-30 min-w-[230px] bg-[#2b2b2b] border border-white/10 rounded-md shadow-xl p-1">
                {menus[id].items.map((item) => (
                  <button
                    key={item.label}
                    disabled={item.disabled}
                    onClick={() => {
                      playSound("click");
                      setOpenMenu(null);
                      item.action();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-1.5 rounded text-left text-white/85 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <span className="w-3 text-[#4ea8ff]">{item.checked ? "✓" : ""}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.shortcut && <span className="text-white/40">{item.shortcut}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {readOnly && <span className="ml-auto px-2 py-0.5 rounded bg-white/10 text-white/50">Lecture seule</span>}
      </div>

      {/* Barre d'outils */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-white/10 bg-[#1f1f1f]">
        {toolbar.map(({ icon: Icon, title, action, disabled }, i) => (
          <span key={title} className="flex items-center">
            {(i === 3 || i === 5 || i === 8) && <span className="w-px h-4 bg-white/10 mx-1" />}
            <button
              onClick={() => {
                playSound("click");
                action();
              }}
              disabled={disabled}
              className="p-1.5 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
              title={title}
              aria-label={title}
            >
              <Icon className="w-4 h-4 text-white/70" />
            </button>
          </span>
        ))}
      </div>

      {/* Barre de recherche */}
      {findOpen && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/10 bg-[#252525] text-xs">
          <Search className="w-3.5 h-3.5 text-white/50" />
          <input
            autoFocus
            value={findText}
            onChange={(e) => {
              setFindText(e.target.value);
              setFindIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") setFindIndex((i) => i + (e.shiftKey ? -1 + matches : 1));
              if (e.key === "Escape") setFindOpen(false);
            }}
            placeholder="Rechercher"
            className="w-56 px-2 py-1 bg-[#1e1e1e] border border-white/10 rounded text-white outline-none focus:border-[#4ea8ff]"
            aria-label="Texte à rechercher"
          />
          <span className="text-white/50 tabular-nums">
            {findText ? (matches ? `${(findIndex % matches) + 1} sur ${matches}` : "Aucun résultat") : ""}
          </span>
          <button onClick={() => setFindIndex((i) => i - 1 + matches)} disabled={!matches} className="p-1 rounded hover:bg-white/10 disabled:opacity-30" aria-label="Précédent">
            <ChevronUp className="w-3.5 h-3.5 text-white/70" />
          </button>
          <button onClick={() => setFindIndex((i) => i + 1)} disabled={!matches} className="p-1 rounded hover:bg-white/10 disabled:opacity-30" aria-label="Suivant">
            <ChevronDown className="w-3.5 h-3.5 text-white/70" />
          </button>
          <button onClick={() => setFindOpen(false)} className="ml-auto p-1 rounded hover:bg-white/10" aria-label="Fermer la recherche">
            <X className="w-3.5 h-3.5 text-white/70" />
          </button>
        </div>
      )}

      {/* Zone de texte */}
      <div ref={contentRef} className="flex-1 overflow-auto">
        {readOnly ? (
          <pre
            className={`p-4 text-white/90 font-mono leading-relaxed min-h-full ${wordWrap ? "whitespace-pre-wrap" : "whitespace-pre"}`}
            style={textStyle}
          >
            {content}
          </pre>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              updateContent(e.target.value);
              updateCaret();
            }}
            onKeyUp={updateCaret}
            onClick={updateCaret}
            wrap={wordWrap ? "soft" : "off"}
            className="w-full h-full p-4 bg-transparent text-white/90 resize-none outline-none font-mono leading-relaxed"
            style={textStyle}
            placeholder="Tapez votre texte ici..."
            spellCheck={false}
            aria-label="Contenu du document"
          />
        )}
      </div>

      {showStatus && (
        <div className="flex items-center justify-between px-3 py-1 border-t border-white/10 bg-[#1f1f1f] text-xs text-white/50">
          <div className="flex items-center gap-4">
            <span>{readOnly ? `${content.split("\n").length} lignes` : `Ln ${caret.line}, Col ${caret.col}`}</span>
            <span>{zoom}%</span>
            <span className="truncate max-w-[220px]">
              {fileName}
              {dirty ? " •" : ""}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>UTF-8</span>
            <span>Windows (CRLF)</span>
          </div>
        </div>
      )}

      {saveAsOpen && <SaveAsDialog initialName={fileName.replace(/\.txt$/i, "")} onSave={saveAs} onCancel={() => setSaveAsOpen(false)} />}

      {dialog && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40" onMouseDown={() => setDialog(null)}>
          <div className="w-80 bg-[#2b2b2b] border border-white/10 rounded-lg shadow-2xl p-5" onMouseDown={(e) => e.stopPropagation()}>
            <p className="text-sm text-white/85 whitespace-pre-line">{dialog}</p>
            <div className="flex justify-end mt-4">
              <button autoFocus onClick={() => setDialog(null)} className="px-4 py-1.5 text-sm rounded bg-[#0078d4] hover:bg-[#1084d8] text-white">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SaveAsDialog({ initialName, onSave, onCancel }: { initialName: string; onSave: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState(initialName);
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40" onMouseDown={onCancel}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onSave(name);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-96 bg-[#2b2b2b] border border-white/10 rounded-lg shadow-2xl p-5"
      >
        <p className="text-white text-sm font-medium mb-1">Enregistrer sous</p>
        <p className="text-white/50 text-xs mb-3">Dossier : C:\Users\BDupuis\Documents</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => e.target.select()}
          className="w-full px-3 py-2 rounded bg-[#1e1e1e] border border-white/10 text-white text-sm outline-none focus:border-[#4ea8ff]"
          aria-label="Nom du fichier"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onCancel} className="px-4 py-1.5 text-sm rounded bg-white/10 hover:bg-white/15 text-white">
            Annuler
          </button>
          <button type="submit" className="px-4 py-1.5 text-sm rounded bg-[#0078d4] hover:bg-[#1084d8] text-white">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}

function countMatches(text: string, query: string) {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  let count = 0;
  for (let i = t.indexOf(q); i >= 0; i = t.indexOf(q, i + q.length)) count++;
  return count;
}

/** Position de la n-ième occurrence (insensible à la casse), ou -1 */
function nthIndex(text: string, query: string, n: number) {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  let i = t.indexOf(q);
  for (let k = 0; k < n && i >= 0; k++) i = t.indexOf(q, i + q.length);
  return i;
}
