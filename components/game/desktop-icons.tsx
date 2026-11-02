"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownAZ,
  Folder,
  FolderPlus,
  FilePlus,
  Info,
  LayoutGrid,
  Palette,
  Pencil,
  RefreshCw,
  Trash2,
  ExternalLink,
  Shapes,
  X,
} from "lucide-react";
import { useGame, type AppType } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { APPS, DESKTOP_APPS } from "./app-registry";
import { ContextMenu, type ContextMenuItem } from "./context-menu";
import { WallpaperPicker } from "./wallpaper-picker";

const CELL = 90;
const MARGIN = 16;
const TASKBAR = 48;

interface DesktopItem {
  id: string;
  label: string;
  kind: "app" | "folder";
  icon: typeof Folder;
  color: string;
}

type Menu = { x: number; y: number; target: string | null } | null;
type ArrangeMode = "name" | "type" | "default";

function rowsPerColumn() {
  return Math.max(1, Math.floor((window.innerHeight - TASKBAR - MARGIN) / CELL));
}

function slotPosition(index: number, rows: number) {
  return { x: MARGIN + Math.floor(index / rows) * CELL, y: MARGIN + (index % rows) * CELL };
}

export function DesktopIcons() {
  const {
    openWindow,
    iconPositions,
    setIconPositions,
    desktopFolders,
    createDesktopFolder,
    renameDesktopFolder,
    deleteDesktopFolder,
  } = useGame();
  const { playSound } = useSound();
  const [selected, setSelected] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ id: string; x: number; y: number } | null>(null);
  const [menu, setMenu] = useState<Menu>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [properties, setProperties] = useState<DesktopItem | null>(null);
  const [personalize, setPersonalize] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rows, setRows] = useState(5);
  const lastClickRef = useRef<{ id: string; time: number } | null>(null);

  useEffect(() => {
    const update = () => setRows(rowsPerColumn());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const items: DesktopItem[] = [
    ...DESKTOP_APPS.map((id) => {
      const app = APPS[id];
      return { id, label: app.desktopLabel ?? app.label, kind: "app" as const, icon: app.icon, color: app.color };
    }),
    ...desktopFolders.map((f) => ({ id: f.id, label: f.name, kind: "folder" as const, icon: Folder, color: "#f4c542" })),
  ];

  // Position de chaque icône : sauvegardée, sinon première case libre de la grille
  const layout = (() => {
    const result: Record<string, { x: number; y: number }> = {};
    const taken = new Set<string>();
    const slotKey = (p: { x: number; y: number }) => `${Math.round((p.x - MARGIN) / CELL)}:${Math.round((p.y - MARGIN) / CELL)}`;
    for (const item of items) {
      const saved = iconPositions[item.id];
      if (saved) {
        result[item.id] = saved;
        taken.add(slotKey(saved));
      }
    }
    let slot = 0;
    for (const item of items) {
      if (result[item.id]) continue;
      let pos = slotPosition(slot, rows);
      while (taken.has(slotKey(pos))) pos = slotPosition(++slot, rows);
      result[item.id] = pos;
      taken.add(slotKey(pos));
      slot++;
    }
    return result;
  })();

  const openItem = useCallback(
    (item: DesktopItem) => {
      playSound("open");
      if (item.kind === "app") openWindow(item.id as AppType);
      else openWindow("explorer", item.label, undefined, { id: `desktop-folder:${item.id}` });
    },
    [openWindow, playSound]
  );

  const arrange = (mode: ArrangeMode) => {
    const sorted = [...items];
    if (mode === "name") sorted.sort((a, b) => a.label.localeCompare(b.label, "fr"));
    if (mode === "type") sorted.sort((a, b) => (a.kind === b.kind ? a.label.localeCompare(b.label, "fr") : a.kind === "app" ? -1 : 1));
    const next: Record<string, { x: number; y: number }> = {};
    sorted.forEach((item, i) => (next[item.id] = slotPosition(i, rows)));
    setIconPositions(next);
  };

  const handleMouseDown = (e: React.MouseEvent, item: DesktopItem) => {
    if (e.button !== 0 || renaming === item.id) return;
    e.preventDefault();
    e.stopPropagation();
    setSelected(item.id);
    const start = { x: e.clientX, y: e.clientY };
    const origin = layout[item.id];
    let moved = false;
    let last = origin;

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      moved = true;
      last = {
        x: Math.max(0, Math.min(window.innerWidth - 80, origin.x + dx)),
        y: Math.max(0, Math.min(window.innerHeight - TASKBAR - 90, origin.y + dy)),
      };
      setDragPos({ id: item.id, ...last });
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      if (moved) {
        // Aligne sur la grille et sauvegarde
        const snapped = {
          x: MARGIN + Math.max(0, Math.round((last.x - MARGIN) / CELL)) * CELL,
          y: MARGIN + Math.max(0, Math.min(rows - 1, Math.round((last.y - MARGIN) / CELL))) * CELL,
        };
        setIconPositions({ ...layout, [item.id]: snapped });
        setDragPos(null);
        lastClickRef.current = null;
        return;
      }
      const now = Date.now();
      const lastClick = lastClickRef.current;
      if (lastClick && lastClick.id === item.id && now - lastClick.time < 400) {
        lastClickRef.current = null;
        openItem(item);
      } else {
        playSound("click");
        lastClickRef.current = { id: item.id, time: now };
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const iconEl = (e.target as HTMLElement).closest("[data-desktop-icon]");
    const target = iconEl?.getAttribute("data-desktop-icon") ?? null;
    if (target) setSelected(target);
    playSound("click");
    setMenu({ x: e.clientX, y: e.clientY, target });
  };

  const newFolder = () => {
    const id = createDesktopFolder();
    setSelected(id);
    setRenaming(id);
  };

  const menuItems = (): ContextMenuItem[] => {
    const item = menu?.target ? items.find((i) => i.id === menu.target) : null;
    if (item) {
      return [
        { label: "Ouvrir", icon: ExternalLink, action: () => openItem(item), divider: true },
        { label: "Renommer", icon: Pencil, action: () => setRenaming(item.id), disabled: item.kind !== "folder" },
        { label: "Supprimer", icon: Trash2, action: () => deleteDesktopFolder(item.id), disabled: item.kind !== "folder", divider: true },
        { label: "Propriétés", icon: Info, action: () => setProperties(item) },
      ];
    }
    return [
      {
        label: "Trier les icônes",
        icon: ArrowDownAZ,
        submenu: [
          { label: "Par nom", icon: ArrowDownAZ, action: () => arrange("name") },
          { label: "Par type", icon: Shapes, action: () => arrange("type") },
          { label: "Disposition par défaut", icon: LayoutGrid, action: () => arrange("default") },
        ],
      },
      {
        label: "Actualiser",
        icon: RefreshCw,
        action: () => setRefreshKey((k) => k + 1),
        divider: true,
      },
      {
        label: "Nouveau",
        icon: FolderPlus,
        submenu: [
          { label: "Dossier", icon: FolderPlus, action: newFolder },
          { label: "Document texte", icon: FilePlus, action: () => openWindow("notepad") },
        ],
        divider: true,
      },
      { label: "Personnaliser", icon: Palette, action: () => setPersonalize(true) },
    ];
  };

  return (
    <div
      className="absolute inset-0 bottom-12 overflow-hidden select-none"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setSelected(null);
      }}
      onContextMenu={handleContextMenu}
    >
      <div key={refreshKey} className="absolute inset-0 animate-fade-in pointer-events-none">
        {items.map((item) => {
          const pos = dragPos?.id === item.id ? dragPos : layout[item.id];
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              data-desktop-icon={item.id}
              onMouseDown={(e) => handleMouseDown(e, item)}
              onKeyDown={(e) => {
                if (e.key === "Enter") openItem(item);
                if (e.key === "F2" && item.kind === "folder") setRenaming(item.id);
              }}
              className={`pointer-events-auto absolute flex flex-col items-center gap-1 p-2 rounded w-20 ${
                dragPos?.id === item.id ? "opacity-80 z-10" : "transition-[left,top] duration-150"
              } ${selected === item.id ? "bg-white/20 ring-1 ring-white/30" : "hover:bg-white/10"}`}
              style={{ left: pos.x, top: pos.y }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                <Icon className="w-7 h-7" style={{ color: item.color }} fill={item.kind === "folder" ? `${item.color}55` : "none"} />
              </div>
              {renaming === item.id ? (
                <input
                  autoFocus
                  defaultValue={item.label}
                  onFocus={(e) => e.target.select()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onBlur={(e) => {
                    renameDesktopFolder(item.id, e.target.value);
                    setRenaming(null);
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    if (e.key === "Escape") setRenaming(null);
                  }}
                  className="w-20 px-1 text-xs text-black bg-white rounded outline-none text-center"
                  aria-label="Nom du dossier"
                />
              ) : (
                <span className="text-xs text-white text-center leading-tight drop-shadow-lg line-clamp-2 break-words">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems()} onClose={() => setMenu(null)} />}

      {properties && (
        <DialogFrame title={`Propriétés de ${properties.label}`} onClose={() => setProperties(null)}>
          <div className="flex items-center gap-4 mb-4">
            <properties.icon className="w-10 h-10" style={{ color: properties.color }} />
            <p className="text-white font-medium">{properties.label}</p>
          </div>
          <dl className="grid grid-cols-[110px_1fr] gap-y-2 text-sm">
            <dt className="text-white/50">Type</dt>
            <dd className="text-white/85">{properties.kind === "app" ? "Raccourci d'application" : "Dossier de fichiers"}</dd>
            <dt className="text-white/50">Emplacement</dt>
            <dd className="text-white/85">C:\Users\BDupuis\Bureau</dd>
            {properties.kind === "folder" && (
              <>
                <dt className="text-white/50">Contenu</dt>
                <dd className="text-white/85">0 fichier, 0 dossier</dd>
                <dt className="text-white/50">Créé le</dt>
                <dd className="text-white/85">
                  {new Date(desktopFolders.find((f) => f.id === properties.id)?.createdAt ?? Date.now()).toLocaleString("fr-FR")}
                </dd>
              </>
            )}
            {properties.kind === "app" && (
              <>
                <dt className="text-white/50">Cible</dt>
                <dd className="text-white/85">{APPS[properties.id as AppType].label}</dd>
              </>
            )}
          </dl>
        </DialogFrame>
      )}

      {personalize && (
        <DialogFrame title="Personnaliser · Arrière-plan" onClose={() => setPersonalize(false)} wide>
          <p className="text-sm text-white/60 mb-3">Choisissez un fond d&apos;écran pour le bureau.</p>
          <WallpaperPicker />
        </DialogFrame>
      )}
    </div>
  );
}

function DialogFrame({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/40" onMouseDown={onClose}>
      <div
        className={`${wide ? "w-[min(640px,calc(100vw-32px))]" : "w-[min(380px,calc(100vw-32px))]"} bg-[#202020] border border-white/15 rounded-lg shadow-2xl overflow-hidden animate-fade-in`}
        onMouseDown={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-[#2b2b2b] border-b border-white/10">
          <span className="text-sm text-white">{title}</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-red-500 transition-colors" aria-label="Fermer">
            <X className="w-3.5 h-3.5 text-white/80" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
