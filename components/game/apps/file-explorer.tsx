"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Folder,
  Image as ImageIcon,
  Info,
  LayoutGrid,
  List,
  Lock,
  Monitor,
  Music,
  RefreshCw,
  X,
} from "lucide-react";
import { useGame, type WindowState } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { useFileClueDetector } from "@/lib/use-file-clue-detector";
import { buildFileSystem, fileDetails, fileSize, fileTypeLabel, findPath, pathToString, type VNode } from "@/lib/filesystem";
import { FolderLockDialog } from "../folder-lock-dialog";
import { ContextMenu, type ContextMenuItem } from "../context-menu";

interface FileExplorerProps {
  window: WindowState;
}

type ViewMode = "icons" | "list";

const QUICK_ACCESS: { id: string; label: string; icon: typeof Folder }[] = [
  { id: "desktop", label: "Bureau", icon: Monitor },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "downloads", label: "Téléchargements", icon: Download },
];

export function FileExplorer({ window: win }: FileExplorerProps) {
  const { openWindow, addSuspicion, accountLevel, isItemLocked, desktopFolders, trashRestoredIds, userFiles } = useGame();
  const { playSound } = useSound();

  const root = useMemo(
    () => buildFileSystem({ desktopFolders, trashRestoredIds, userFiles }),
    [desktopFolders, trashRestoredIds, userFiles]
  );

  // Ouvert depuis un dossier du bureau : on y va directement
  const initialFolder = win.target?.id.startsWith("desktop-folder:") ? win.target.id.slice("desktop-folder:".length) : "documents";
  const [currentId, setCurrentId] = useState(initialFolder);
  const [back, setBack] = useState<string[]>([]);
  const [forward, setForward] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("icons");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [lockTarget, setLockTarget] = useState<VNode | null>(null);
  const [expanded, setExpanded] = useState<string[]>(["documents"]);
  const [menu, setMenu] = useState<{ x: number; y: number; node: VNode } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const lastClickRef = useRef<{ id: string; time: number } | null>(null);

  const path = findPath(root, currentId) ?? [root];
  const current = path[path.length - 1];
  const items = current.children ?? [];
  const selected = items.find((n) => n.id === selectedId) ?? null;

  const detectClues = useFileClueDetector();

  const navigate = useCallback(
    (id: string, opts: { fromHistory?: boolean } = {}) => {
      const target = findPath(root, id);
      if (!target) return;
      const node = target[target.length - 1];
      if (node.lockId && isItemLocked(node.lockId)) {
        setLockTarget(node);
        return;
      }
      // Un invité qui ouvre le dossier confidentiel attire l'attention
      if (node.id === "confidential" && accountLevel === "guest") {
        addSuspicion({ type: "sensitive_file", amount: 10, message: "Tentative d'accès au dossier confidentiel" });
      }
      if (!opts.fromHistory && id !== currentId) {
        setBack((b) => [...b, currentId]);
        setForward([]);
      }
      setCurrentId(id);
      setSelectedId(null);
      setExpanded((e) => [...new Set([...e, ...target.map((n) => n.id)])]);
    },
    [root, currentId, isItemLocked, accountLevel, addSuspicion]
  );

  const goBack = () => {
    const prev = back[back.length - 1];
    if (!prev) return;
    playSound("click");
    setBack((b) => b.slice(0, -1));
    setForward((f) => [currentId, ...f]);
    navigate(prev, { fromHistory: true });
  };

  const goForward = () => {
    const next = forward[0];
    if (!next) return;
    playSound("click");
    setForward((f) => f.slice(1));
    setBack((b) => [...b, currentId]);
    navigate(next, { fromHistory: true });
  };

  const goUp = () => {
    if (path.length < 2) return;
    playSound("click");
    navigate(path[path.length - 2].id);
  };

  const openNode = useCallback(
    (node: VNode) => {
      playSound("open");
      if (node.kind === "folder") {
        navigate(node.id);
        return;
      }
      const file = node.file!;
      if (file.type === "image") openWindow("photos", file.name, file);
      else openWindow("notepad", file.name, file);
      detectClues(file);
    },
    [navigate, openWindow, playSound, detectClues]
  );

  const handleItemClick = (node: VNode) => {
    const now = Date.now();
    const last = lastClickRef.current;
    setSelectedId(node.id);
    if (last && last.id === node.id && now - last.time < 400) {
      lastClickRef.current = null;
      openNode(node);
    } else {
      playSound("click");
      lastClickRef.current = { id: node.id, time: now };
    }
  };

  const iconFor = (node: VNode, size: "sm" | "lg") => {
    const cls = size === "lg" ? "w-10 h-10" : "w-4 h-4";
    if (node.kind === "folder") {
      return node.lockId && isItemLocked(node.lockId) ? (
        <span className="relative">
          <Folder className={`${cls} text-yellow-400`} fill="#facc1555" />
          <Lock className={`absolute ${size === "lg" ? "-right-1 -bottom-1 w-4 h-4" : "-right-1 -bottom-1 w-2.5 h-2.5"} text-amber-300`} />
        </span>
      ) : (
        <Folder className={`${cls} text-yellow-400`} fill="#facc1555" />
      );
    }
    if (node.file?.type === "image") {
      return size === "lg" && node.file.imageSrc ? (
        <span className="w-10 h-10 rounded overflow-hidden bg-white/10 block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={node.file.imageSrc} alt="" className="w-full h-full object-cover" />
        </span>
      ) : (
        <ImageIcon className={`${cls} text-green-400`} />
      );
    }
    if (node.file?.type === "audio") return <Music className={`${cls} text-purple-400`} />;
    return <FileText className={`${cls} text-blue-400`} />;
  };

  const menuItems = (node: VNode): ContextMenuItem[] => [
    { label: "Ouvrir", icon: ExternalLink, action: () => openNode(node), divider: true },
    {
      label: "Propriétés",
      icon: Info,
      action: () => {
        setSelectedId(node.id);
        setShowDetails(true);
      },
    },
  ];

  const renderTree = (node: VNode, depth: number): React.ReactNode =>
    (node.children ?? [])
      .filter((c) => c.kind === "folder")
      .map((child) => {
        const hasSub = (child.children ?? []).some((c) => c.kind === "folder");
        const isOpen = expanded.includes(child.id);
        return (
          <div key={child.id}>
            <button
              onClick={() => {
                playSound("click");
                navigate(child.id);
              }}
              className={`w-full flex items-center gap-1 py-1 pr-2 rounded text-sm transition-colors ${
                currentId === child.id ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
              }`}
              style={{ paddingLeft: 8 + depth * 14 }}
            >
              <span
                role="button"
                aria-label={isOpen ? "Replier" : "Déplier"}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((ex) => (ex.includes(child.id) ? ex.filter((x) => x !== child.id) : [...ex, child.id]));
                }}
                className={`w-4 h-4 flex items-center justify-center ${hasSub ? "" : "invisible"}`}
              >
                {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </span>
              {iconFor(child, "sm")}
              <span className="truncate">{child.name}</span>
            </button>
            {isOpen && hasSub && renderTree(child, depth + 1)}
          </div>
        );
      });

  const details = selected ? fileDetails(selected) : null;

  return (
    <div className="flex h-full" onContextMenu={(e) => e.preventDefault()}>
      {/* Sidebar */}
      <div className="w-52 bg-[#1f1f1f] border-r border-white/10 p-2 flex flex-col gap-0.5 overflow-y-auto">
        <div className="text-xs text-white/50 px-2 py-1 font-medium">Accès rapide</div>
        {QUICK_ACCESS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              playSound("click");
              navigate(id);
            }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
              currentId === id ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
        <div className="text-xs text-white/50 px-2 pt-3 pb-1 font-medium">Ce PC · C:\Users\BDupuis</div>
        {renderTree(root, 0)}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-[#252525]">
          <button onClick={goBack} disabled={!back.length} className="p-1.5 hover:bg-white/10 rounded disabled:opacity-30" title="Précédent" aria-label="Précédent">
            <ArrowLeft className="w-4 h-4 text-white/70" />
          </button>
          <button onClick={goForward} disabled={!forward.length} className="p-1.5 hover:bg-white/10 rounded disabled:opacity-30" title="Suivant" aria-label="Suivant">
            <ArrowRight className="w-4 h-4 text-white/70" />
          </button>
          <button onClick={goUp} disabled={path.length < 2} className="p-1.5 hover:bg-white/10 rounded disabled:opacity-30" title="Dossier parent" aria-label="Dossier parent">
            <ArrowUp className="w-4 h-4 text-white/70" />
          </button>
          <button
            onClick={() => {
              playSound("click");
              setRefreshKey((k) => k + 1);
            }}
            className="p-1.5 hover:bg-white/10 rounded"
            title="Actualiser"
            aria-label="Actualiser"
          >
            <RefreshCw className="w-4 h-4 text-white/70" />
          </button>

          {/* Fil d'Ariane cliquable */}
          <nav aria-label="Chemin" className="flex-1 flex items-center gap-0.5 px-2 py-1 bg-[#1f1f1f] rounded text-sm text-white/70 min-w-0 overflow-x-auto">
            <span className="text-white/40 px-1 whitespace-nowrap">C: › Users ›</span>
            {path.map((node, i) => (
              <span key={node.id} className="flex items-center whitespace-nowrap">
                {i > 0 && <ChevronRight className="w-3 h-3 text-white/30" />}
                <button
                  onClick={() => {
                    playSound("click");
                    navigate(node.id);
                  }}
                  className={`px-1.5 py-0.5 rounded hover:bg-white/10 ${i === path.length - 1 ? "text-white" : ""}`}
                >
                  {node.name}
                </button>
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 ml-1">
            <button
              onClick={() => setViewMode("icons")}
              className={`p-1.5 rounded ${viewMode === "icons" ? "bg-white/15" : "hover:bg-white/10"}`}
              title="Grandes icônes"
              aria-label="Vue icônes"
              aria-pressed={viewMode === "icons"}
            >
              <LayoutGrid className="w-4 h-4 text-white/70" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${viewMode === "list" ? "bg-white/15" : "hover:bg-white/10"}`}
              title="Détails"
              aria-label="Vue liste"
              aria-pressed={viewMode === "list"}
            >
              <List className="w-4 h-4 text-white/70" />
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`p-1.5 rounded ${showDetails ? "bg-white/15" : "hover:bg-white/10"}`}
              title="Volet des propriétés"
              aria-label="Propriétés"
              aria-pressed={showDetails}
            >
              <Info className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          <div
            key={refreshKey}
            className="flex-1 p-3 overflow-auto animate-fade-in"
            onMouseDown={(e) => e.target === e.currentTarget && setSelectedId(null)}
          >
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/40">
                <Folder className="w-16 h-16 mb-4 opacity-50" />
                <p>Ce dossier est vide</p>
              </div>
            ) : viewMode === "icons" ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2">
                {items.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => handleItemClick(node)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedId(node.id);
                      setMenu({ x: e.clientX, y: e.clientY, node });
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                      selectedId === node.id ? "bg-[#0078d4]/30 ring-1 ring-[#0078d4]" : "hover:bg-white/5"
                    }`}
                  >
                    <span className="w-12 h-12 flex items-center justify-center">{iconFor(node, "lg")}</span>
                    <span className="text-xs text-white/80 text-center line-clamp-2 break-all">{node.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-white/50 border-b border-white/10">
                    <th className="font-normal py-1.5 px-2">Nom</th>
                    <th className="font-normal py-1.5 px-2 w-40">Type</th>
                    <th className="font-normal py-1.5 px-2 w-24 text-right">Taille</th>
                    <th className="font-normal py-1.5 px-2 w-44">Modifié le</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((node) => (
                    <tr
                      key={node.id}
                      onClick={() => handleItemClick(node)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setSelectedId(node.id);
                        setMenu({ x: e.clientX, y: e.clientY, node });
                      }}
                      className={`cursor-default ${selectedId === node.id ? "bg-[#0078d4]/30" : "hover:bg-white/5"}`}
                    >
                      <td className="py-1.5 px-2">
                        <span className="flex items-center gap-2 text-white/85 min-w-0">
                          {iconFor(node, "sm")}
                          <span className="truncate">{node.name}</span>
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-white/50">{fileTypeLabel(node)}</td>
                      <td className="py-1.5 px-2 text-white/50 text-right tabular-nums">{fileSize(node)}</td>
                      <td className="py-1.5 px-2 text-white/50">{fileDetails(node)?.modified ?? (node.kind === "file" ? "—" : "")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {showDetails && (
            <aside className="w-64 border-l border-white/10 bg-[#1c1c1c] p-4 overflow-y-auto text-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">Propriétés</h3>
                <button onClick={() => setShowDetails(false)} className="p-1 rounded hover:bg-white/10" aria-label="Fermer les propriétés">
                  <X className="w-3.5 h-3.5 text-white/60" />
                </button>
              </div>
              {selected ? (
                <>
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <span className="w-14 h-14 flex items-center justify-center">{iconFor(selected, "lg")}</span>
                    <p className="text-white text-center break-all">{selected.name}</p>
                  </div>
                  <dl className="space-y-2">
                    <Detail label="Type" value={fileTypeLabel(selected)} />
                    {selected.kind === "file" && <Detail label="Taille" value={fileSize(selected)} />}
                    {selected.kind === "folder" && (
                      <Detail label="Contenu" value={selected.lockId && isItemLocked(selected.lockId) ? "Accès protégé" : `${selected.children?.length ?? 0} élément(s)`} />
                    )}
                    <Detail label="Emplacement" value={pathToString(path)} />
                    {details && (
                      <>
                        <Detail label="Créé le" value={details.created} />
                        <Detail label="Modifié le" value={details.modified} />
                        {details.author && <Detail label="Auteur" value={details.author} />}
                      </>
                    )}
                  </dl>
                </>
              ) : (
                <p className="text-white/40">Sélectionnez un élément pour afficher ses propriétés.</p>
              )}
            </aside>
          )}
        </div>

        <div className="px-4 py-1.5 border-t border-white/10 bg-[#1f1f1f] text-xs text-white/50 flex justify-between">
          <span>
            {items.length} élément{items.length > 1 ? "s" : ""}
            {selected && " · 1 élément sélectionné"}
          </span>
          <span className="truncate ml-4">{pathToString(path)}</span>
        </div>
      </div>

      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems(menu.node)} onClose={() => setMenu(null)} />}

      {lockTarget && (
        <FolderLockDialog
          folderId={lockTarget.lockId!}
          folderName={lockTarget.name}
          onClose={() => setLockTarget(null)}
          onUnlock={() => {
            const target = lockTarget;
            setLockTarget(null);
            setBack((b) => [...b, currentId]);
            setForward([]);
            setCurrentId(target.id);
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="text-white/85 break-words">{value}</dd>
    </div>
  );
}
