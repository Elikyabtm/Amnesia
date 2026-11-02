"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { useSound } from "@/hooks/use-sound";

export interface ContextMenuItem {
  label: string;
  icon?: LucideIcon;
  action?: () => void;
  disabled?: boolean;
  /** Trait de séparation après l'élément */
  divider?: boolean;
  submenu?: ContextMenuItem[];
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

/** Menu contextuel façon Windows 11, avec sous-menus au survol. */
export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });
  const [openSub, setOpenSub] = useState<number | null>(null);
  const { playSound } = useSound();

  // Garde le menu entièrement à l'écran
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setPos({
      x: Math.min(x, window.innerWidth - width - 4),
      y: Math.min(y, window.innerHeight - 48 - height - 4),
    });
  }, [x, y]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("blur", onClose);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", onClose);
    };
  }, [onClose]);

  const renderItems = (list: ContextMenuItem[], isSub = false) =>
    list.map((item, index) => {
      const Icon = item.icon;
      return (
        <div
          key={item.label}
          className="relative"
          onMouseEnter={() => !isSub && setOpenSub(item.submenu ? index : null)}
        >
          <button
            disabled={item.disabled}
            onClick={() => {
              if (item.submenu) {
                setOpenSub(openSub === index ? null : index);
                return;
              }
              playSound("click");
              item.action?.();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-white/85 rounded hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-left"
          >
            <span className="w-4 h-4 flex items-center justify-center">
              {Icon && <Icon className="w-4 h-4 text-white/60" />}
            </span>
            <span className="flex-1 whitespace-nowrap">{item.label}</span>
            {item.submenu && <ChevronRight className="w-3.5 h-3.5 text-white/50" />}
          </button>
          {item.submenu && openSub === index && (
            <div className="absolute left-full top-0 ml-1 min-w-[180px] bg-[#2b2b2b]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl p-1">
              {renderItems(item.submenu, true)}
            </div>
          )}
          {item.divider && <div className="my-1 border-t border-white/10" />}
        </div>
      );
    });

  return (
    <div
      ref={ref}
      role="menu"
      className="fixed z-[5000] min-w-[220px] bg-[#2b2b2b]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl p-1 animate-fade-in"
      style={{ left: pos.x, top: pos.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {renderItems(items)}
    </div>
  );
}
