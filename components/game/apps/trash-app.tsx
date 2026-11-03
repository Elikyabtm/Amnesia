"use client";

import { useState, useRef, useCallback } from "react";
import { Trash2, FileText, RefreshCw, ArchiveRestore, Undo2 } from "lucide-react";
import { TRASH_ORIGIN } from "@/lib/filesystem";
import { ConfirmDialog } from "../confirm-dialog";
import { ContextMenu } from "../context-menu";
import { corbeille, type FileItem } from "@/lib/game-data";
import { useGame, type WindowState } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

interface TrashAppProps {
  window: WindowState;
}

export function TrashApp({ window: win }: TrashAppProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { openWindow, addClue, trashRestoredIds, trashEmptied, restoreTrashItem, emptyTrash } = useGame();
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number; item: FileItem } | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Éléments encore dans la corbeille
  const items = trashEmptied ? [] : corbeille.filter((f) => !trashRestoredIds.includes(f.id));

  const originLabel = (id: string) =>
    TRASH_ORIGIN[id] === "notes" ? "C:\\Users\\BDupuis\\Documents\\Notes" : "C:\\Users\\BDupuis\\Documents";

  const flash = (message: string) => {
    setBanner(message);
    setTimeout(() => setBanner(null), 2500);
  };

  const restore = (ids: string[]) => {
    if (!ids.length) return;
    playSound("click");
    ids.forEach(restoreTrashItem);
    setSelectedItem(null);
    flash(ids.length > 1 ? `${ids.length} éléments restaurés` : "Élément restauré à son emplacement d'origine");
  };
  const { playSound } = useSound();
  const lastClickRef = useRef<{ id: string; time: number } | null>(null);

  const handleItemClick = useCallback((item: FileItem) => {
    playSound("click");
    setSelectedItem(item.id);
    
    const now = Date.now();
    const lastClick = lastClickRef.current;
    
    if (lastClick && lastClick.id === item.id && now - lastClick.time < 300) {
      playSound("open");
      openWindow("notepad", item.name, item);
      
      // Add clue if relevant content
      // Insensible à la casse : la note contient "ANCIEN MOT DE PASSE" en majuscules
      const lower = item.content?.toLowerCase() ?? "";
      if (lower.includes("ancien") || lower.includes("mdp")) {
        addClue({
          category: "password",
          text: "L'ancien mot de passe était trop simple",
          source: item.name,
          ref: { kind: "file", id: item.id },
          highlight: lower.includes("ancien") ? "ancien" : "mdp",
        });
      }
      
      lastClickRef.current = null;
    } else {
      lastClickRef.current = { id: item.id, time: now };
    }
  }, [openWindow, playSound, addClue]);

  return (
    <div className="relative flex flex-col h-full" onContextMenu={(e) => e.preventDefault()}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-[#252525]">
        <button
          onClick={() => {
            playSound("click");
            setConfirmEmpty(true);
          }}
          disabled={items.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 rounded transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-4 h-4" />
          Vider la corbeille
        </button>
        <button
          onClick={() => selectedItem && restore([selectedItem])}
          disabled={!selectedItem}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 rounded transition-colors disabled:opacity-40"
        >
          <Undo2 className="w-4 h-4" />
          Restaurer l&apos;élément
        </button>
        <button
          onClick={() => restore(items.map((i) => i.id))}
          disabled={items.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 rounded transition-colors disabled:opacity-40"
        >
          <ArchiveRestore className="w-4 h-4" />
          Tout restaurer
        </button>
        <button
          onClick={() => {
            playSound("click");
            setRefreshKey((k) => k + 1);
          }}
          className="ml-auto p-1.5 hover:bg-white/10 rounded transition-colors"
          title="Actualiser"
          aria-label="Actualiser"
        >
          <RefreshCw className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Content */}
      <div key={refreshKey} className="flex-1 p-3 overflow-auto animate-fade-in" onMouseDown={(e) => e.target === e.currentTarget && setSelectedItem(null)}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40">
            <Trash2 className="w-16 h-16 mb-4 opacity-50" />
            <p>La corbeille est vide</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-white/50 border-b border-white/10">
                <th className="font-normal py-1.5 px-2">Nom</th>
                <th className="font-normal py-1.5 px-2">Emplacement d&apos;origine</th>
                <th className="font-normal py-1.5 px-2 w-40">Date de suppression</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSelectedItem(item.id);
                    setMenu({ x: e.clientX, y: e.clientY, item });
                  }}
                  className={`cursor-default ${selectedItem === item.id ? "bg-[#0078d4]/30" : "hover:bg-white/5"}`}
                >
                  <td className="py-2 px-2">
                    <span className="flex items-center gap-2 text-white/85">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {item.name}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-white/50 truncate">{originLabel(item.id)}</td>
                  <td className="py-2 px-2 text-white/50">3 février 2025</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Status bar */}
      <div className="px-4 py-2 border-t border-white/10 bg-[#1f1f1f] text-xs text-white/50">
        {items.length} élément{items.length > 1 ? "s" : ""} supprimé{items.length > 1 ? "s" : ""}
        {selectedItem && " · double-cliquez pour ouvrir"}
      </div>

      {banner && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded bg-[#2b2b2b] border border-white/10 shadow-xl text-sm text-white animate-fade-in">
          {banner}
        </div>
      )}

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            { label: "Ouvrir", icon: FileText, action: () => openWindow("notepad", menu.item.name, menu.item), divider: true },
            { label: "Restaurer", icon: Undo2, action: () => restore([menu.item.id]) },
          ]}
        />
      )}

      {confirmEmpty && (
        <ConfirmDialog
          title="Vider la corbeille"
          message={`Voulez-vous vraiment supprimer définitivement ${items.length > 1 ? `ces ${items.length} éléments` : "cet élément"} ? Cette action est irréversible.`}
          confirmLabel="Supprimer définitivement"
          danger
          onConfirm={() => {
            setConfirmEmpty(false);
            playSound("close");
            emptyTrash();
            setSelectedItem(null);
            flash("La corbeille a été vidée");
          }}
          onCancel={() => setConfirmEmpty(false)}
        />
      )}
    </div>
  );
}
