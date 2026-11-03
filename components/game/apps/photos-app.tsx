"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { 
  Image, 
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  ZoomOut,
  X,
  Info
} from "lucide-react";
import { photos, type FileItem } from "@/lib/game-data";
import { type WindowState } from "@/lib/game-context";
import { useTextHighlight } from "@/lib/use-text-highlight";
import { useSound } from "@/hooks/use-sound";

interface PhotosAppProps {
  window: WindowState;
}

export function PhotosApp({ window: win }: PhotosAppProps) {
  const initialPhoto = win.content as FileItem | undefined;
  const [selectedPhoto, setSelectedPhoto] = useState<FileItem | null>(
    initialPhoto || null
  );
  // Ouverte depuis le carnet d'indices : on affiche directement la description
  const [showInfo, setShowInfo] = useState(!!win.target?.highlight);
  // Zoom et déplacement de l'image agrandie
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const zoomBy = (delta: number) =>
    setZoom((z) => {
      const next = Math.min(4, Math.max(1, Math.round((z + delta) * 4) / 4));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  // Nouvelle photo affichée : zoom remis à 100 %
  useEffect(() => {
    resetZoom();
  }, [selectedPhoto?.id]);
  const infoRef = useRef<HTMLDivElement>(null);
  useTextHighlight(
    infoRef,
    showInfo && selectedPhoto?.id === win.target?.id ? win.target?.highlight : undefined,
    win.id,
    [showInfo, selectedPhoto?.id]
  );
  const { playSound } = useSound();
  const lastClickRef = useRef<{ id: string; time: number } | null>(null);

  const currentIndex = selectedPhoto 
    ? photos.findIndex((p) => p.id === selectedPhoto.id) 
    : -1;

  const handlePhotoClick = useCallback((photo: FileItem) => {
    playSound("click");
    
    const now = Date.now();
    const lastClick = lastClickRef.current;
    
    if (lastClick && lastClick.id === photo.id && now - lastClick.time < 300) {
      setSelectedPhoto(photo);
      lastClickRef.current = null;
    } else {
      lastClickRef.current = { id: photo.id, time: now };
      setSelectedPhoto(photo);
    }
  }, [playSound]);

  const navigatePhoto = (direction: "prev" | "next") => {
    playSound("click");
    const newIndex = direction === "prev" 
      ? (currentIndex - 1 + photos.length) % photos.length
      : (currentIndex + 1) % photos.length;
    setSelectedPhoto(photos[newIndex]);
    resetZoom();
  };

  return (
    <div className="flex h-full bg-[#0a0a0a]">
      {selectedPhoto ? (
        // Photo viewer
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-2 bg-[#1a1a1a]">
            <button 
              onClick={() => {
                playSound("click");
                setSelectedPhoto(null);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-white/70 hover:bg-white/10 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Retour</span>
            </button>
            
            <div className="text-sm text-white/60">{selectedPhoto.name}</div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => zoomBy(-0.25)}
                disabled={zoom <= 1}
                className="p-2 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
                title="Zoom arrière"
                aria-label="Zoom arrière"
              >
                <ZoomOut className="w-4 h-4 text-white/70" />
              </button>
              <button
                onClick={resetZoom}
                className="px-2 py-1 text-xs text-white/70 hover:bg-white/10 rounded tabular-nums min-w-[48px]"
                title="Taille d'origine"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={() => zoomBy(0.25)}
                disabled={zoom >= 4}
                className="p-2 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
                title="Zoom avant"
                aria-label="Zoom avant"
              >
                <ZoomIn className="w-4 h-4 text-white/70" />
              </button>
              <button 
                onClick={() => {
                  playSound("click");
                  setShowInfo(!showInfo);
                }}
                className={`p-2 rounded transition-colors ${
                  showInfo ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                <Info className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          {/* Image display */}
          <div
            className={`flex-1 flex items-center justify-center relative overflow-hidden ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
            onWheel={(e) => zoomBy(e.deltaY < 0 ? 0.25 : -0.25)}
            onDoubleClick={() => (zoom > 1 ? resetZoom() : zoomBy(1))}
            onMouseDown={(e) => {
              if (zoom <= 1) return;
              e.preventDefault();
              panRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
              const move = (ev: MouseEvent) => {
                const start = panRef.current;
                if (start) setPan({ x: start.px + ev.clientX - start.x, y: start.py + ev.clientY - start.y });
              };
              const up = () => {
                panRef.current = null;
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", up);
              };
              document.addEventListener("mousemove", move);
              document.addEventListener("mouseup", up);
            }}
          >
            {selectedPhoto.imageSrc && (
              <img 
                src={selectedPhoto.imageSrc}
                alt={selectedPhoto.name}
                draggable={false}
                className="max-w-full max-h-full object-contain transition-transform duration-150 select-none"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
              />
            )}
            
            {/* Navigation arrows */}
            <button 
              onClick={() => navigatePhoto("prev")}
              className="absolute left-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button 
              onClick={() => navigatePhoto("next")}
              className="absolute right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Info panel */}
            {showInfo && (
              <div ref={infoRef} className="absolute right-0 top-0 bottom-0 w-72 bg-[#1a1a1a] border-l border-white/10 p-4 overflow-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Informations</h3>
                  <button 
                    onClick={() => setShowInfo(false)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <X className="w-4 h-4 text-white/70" />
                  </button>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="text-white/50 mb-1">Nom du fichier</div>
                    <div className="text-white">{selectedPhoto.name}</div>
                  </div>
                  <div>
                    <div className="text-white/50 mb-1">Description</div>
                    <div className="text-white/80 whitespace-pre-wrap">
                      {selectedPhoto.content}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex items-center justify-center gap-2 p-3 bg-[#1a1a1a] border-t border-white/10">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => {
                  playSound("click");
                  setSelectedPhoto(photo);
                }}
                className={`w-12 h-12 rounded overflow-hidden transition-all ${
                  selectedPhoto.id === photo.id
                    ? "ring-2 ring-[#0078d4]"
                    : "opacity-50 hover:opacity-75"
                }`}
              >
                {photo.imageSrc && (
                  <img 
                    src={photo.imageSrc}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Gallery view
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-white/10 bg-[#1a1a1a]">
            <h2 className="text-lg font-medium text-white">Photos</h2>
            <p className="text-sm text-white/50">{photos.length} photos</p>
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => handlePhotoClick(photo)}
                  className="aspect-square rounded-lg overflow-hidden bg-white/5 hover:bg-white/10 transition-colors group relative"
                >
                  {photo.imageSrc ? (
                    <img 
                      src={photo.imageSrc}
                      alt={photo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-8 h-8 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white truncate block">
                      {photo.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
