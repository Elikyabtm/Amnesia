"use client";

import { useRef, useCallback, useState, type ReactNode, type MouseEvent } from "react";
import { Minus, Square, X, Maximize2 } from "lucide-react";
import { useGame, type WindowState, type SnapZone } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

interface WindowProps {
  window: WindowState;
  children: ReactNode;
}

export function Window({ window: win, children }: WindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPosition, updateWindowSize, activeWindowId, isLockedOut, snapWindow, detachWindow } = useGame();
  const [snapPreview, setSnapPreview] = useState<SnapZone | null>(null);

  // Pendant un blocage, la fenêtre Déverrouiller passe au-dessus du voile de
  // blocage pour afficher son compte à rebours.
  const raisedAboveLockout = isLockedOut && win.app === "password" && !win.isMinimized;
  const { playSound } = useSound();
  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const isActive = activeWindowId === win.id;

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (e.button !== 0) return;

    focusWindow(win.id);
    const docked = win.isMaximized || !!win.snapped;
    // Une fenêtre agrandie/aimantée se "décroche" seulement après un vrai déplacement
    let detached = !docked;
    let zone: SnapZone | null = null;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: win.position.x,
      initialY: win.position.y,
    };

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      if (!detached) {
        if (Math.hypot(moveEvent.clientX - drag.startX, moveEvent.clientY - drag.startY) < 8) return;
        // Garde le curseur à la même proportion de la barre de titre
        const restoredWidth = win.prevSize?.width ?? win.size.width;
        const ratio = (drag.startX - win.position.x) / win.size.width;
        const x = Math.max(0, moveEvent.clientX - ratio * restoredWidth);
        const y = Math.max(0, moveEvent.clientY - 16);
        detachWindow(win.id, { x, y });
        dragRef.current = { startX: moveEvent.clientX, startY: moveEvent.clientY, initialX: x, initialY: y };
        detached = true;
        return;
      }

      const deltaX = moveEvent.clientX - drag.startX;
      const deltaY = moveEvent.clientY - drag.startY;
      updateWindowPosition(win.id, {
        x: drag.initialX + deltaX,
        y: Math.max(0, drag.initialY + deltaY),
      });

      // Zones d'aimantation : bords gauche/droit, haut = agrandir
      const edge = 4;
      zone =
        moveEvent.clientX <= edge ? "left"
        : moveEvent.clientX >= globalThis.innerWidth - edge ? "right"
        : moveEvent.clientY <= edge ? "max"
        : null;
      setSnapPreview(zone);
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      if (zone) {
        playSound("click");
        snapWindow(win.id, zone);
      }
      setSnapPreview(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [win.id, win.position, win.size, win.prevSize, win.isMaximized, win.snapped, focusWindow, updateWindowPosition, detachWindow, snapWindow, playSound]);

  const handleResize = useCallback((e: MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (win.isMaximized) return;

    setIsResizing(true);
    focusWindow(win.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = win.size.width;
    const startHeight = win.size.height;
    const startPosX = win.position.x;
    const startPosY = win.position.y;

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;

      if (direction.includes("e")) {
        newWidth = Math.max(400, startWidth + deltaX);
      }
      if (direction.includes("w")) {
        newWidth = Math.max(400, startWidth - deltaX);
        newX = startPosX + (startWidth - newWidth);
      }
      if (direction.includes("s")) {
        newHeight = Math.max(300, startHeight + deltaY);
      }
      if (direction.includes("n")) {
        newHeight = Math.max(300, startHeight - deltaY);
        newY = startPosY + (startHeight - newHeight);
      }

      updateWindowSize(win.id, { width: newWidth, height: newHeight });
      updateWindowPosition(win.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [win.id, win.size, win.position, win.isMaximized, focusWindow, updateWindowSize, updateWindowPosition]);

  const handleClose = () => {
    playSound("close");
    closeWindow(win.id);
  };

  const handleMinimize = () => {
    playSound("click");
    minimizeWindow(win.id);
  };

  const handleMaximize = () => {
    playSound("click");
    maximizeWindow(win.id);
  };

  const handleDoubleClick = () => {
    handleMaximize();
  };

  if (win.isMinimized) return null;

  return (
    <>
    {snapPreview && (
      <div
        className="fixed z-[8999] rounded-lg border-2 border-white/40 bg-white/10 backdrop-blur-sm pointer-events-none transition-all"
        style={{
          left: snapPreview === "right" ? "50%" : 0,
          top: 0,
          width: snapPreview === "max" ? "100%" : "50%",
          height: "calc(100% - 48px)",
        }}
      />
    )}
    <div
      ref={windowRef}
      className={`absolute animate-window-open ${isResizing ? "select-none" : ""}`}
      style={{
        left: win.position.x,
        top: win.position.y,
        width: win.size.width,
        height: win.size.height,
        zIndex: raisedAboveLockout ? 9999 : win.zIndex,
      }}
      onClick={() => focusWindow(win.id)}
    >
      <div 
        className={`flex flex-col h-full rounded-lg overflow-hidden shadow-2xl border transition-colors ${
          isActive 
            ? "bg-[#202020] border-[#404040]" 
            : "bg-[#2d2d2d] border-[#3d3d3d]"
        }`}
      >
        {/* Title bar */}
        <div
          className={`flex items-center justify-between px-3 py-2 select-none transition-colors ${
            isActive ? "bg-[#1f1f1f]" : "bg-[#2d2d2d]"
          } cursor-default`}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-sm truncate ${isActive ? "text-white" : "text-white/60"}`}>
              {win.title}
            </span>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={handleMinimize}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <Minus className="w-3.5 h-3.5 text-white/80" />
            </button>
            <button
              onClick={handleMaximize}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              {win.isMaximized ? (
                <Maximize2 className="w-3 h-3 text-white/80" />
              ) : (
                <Square className="w-3 h-3 text-white/80" />
              )}
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-red-500 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white/80" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-[#191919]">
          {children}
        </div>
      </div>

      {/* Resize handles - only show when not maximized */}
      {!win.isMaximized && (
        <>
          {/* Edges */}
          <div 
            className="absolute top-0 left-2 right-2 h-1 cursor-n-resize" 
            onMouseDown={(e) => handleResize(e, "n")}
          />
          <div 
            className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize" 
            onMouseDown={(e) => handleResize(e, "s")}
          />
          <div 
            className="absolute left-0 top-2 bottom-2 w-1 cursor-w-resize" 
            onMouseDown={(e) => handleResize(e, "w")}
          />
          <div 
            className="absolute right-0 top-2 bottom-2 w-1 cursor-e-resize" 
            onMouseDown={(e) => handleResize(e, "e")}
          />
          {/* Corners */}
          <div 
            className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize" 
            onMouseDown={(e) => handleResize(e, "nw")}
          />
          <div 
            className="absolute top-0 right-0 w-2 h-2 cursor-ne-resize" 
            onMouseDown={(e) => handleResize(e, "ne")}
          />
          <div 
            className="absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize" 
            onMouseDown={(e) => handleResize(e, "sw")}
          />
          <div 
            className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize" 
            onMouseDown={(e) => handleResize(e, "se")}
          />
        </>
      )}
    </div>
    </>
  );
}
