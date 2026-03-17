"use client";

import { useState } from "react";
import { FileText, Save, Printer, Search, Undo, Redo, Copy, Scissors, ClipboardPaste } from "lucide-react";
import { type WindowState } from "@/lib/game-context";
import { type FileItem, notes } from "@/lib/game-data";
import { useSound } from "@/hooks/use-sound";

interface NotepadAppProps {
  window: WindowState;
}

export function NotepadApp({ window: win }: NotepadAppProps) {
  const fileContent = win.content as FileItem | string | undefined;
  const initialContent = typeof fileContent === "string" 
    ? fileContent 
    : fileContent?.content || "";
  
  const [content, setContent] = useState(initialContent);
  const [isNewFile, setIsNewFile] = useState(!fileContent);
  const { playSound } = useSound();

  // If opened without content, show a default notepad
  const isViewMode = !!fileContent;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Menu bar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-white/10 bg-[#252525] text-xs">
        <button className="px-3 py-1 text-white/70 hover:bg-white/10 rounded transition-colors">
          Fichier
        </button>
        <button className="px-3 py-1 text-white/70 hover:bg-white/10 rounded transition-colors">
          Edition
        </button>
        <button className="px-3 py-1 text-white/70 hover:bg-white/10 rounded transition-colors">
          Format
        </button>
        <button className="px-3 py-1 text-white/70 hover:bg-white/10 rounded transition-colors">
          Affichage
        </button>
        <button className="px-3 py-1 text-white/70 hover:bg-white/10 rounded transition-colors">
          Aide
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-white/10 bg-[#1f1f1f]">
        <button 
          onClick={() => playSound("click")}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title="Nouveau"
        >
          <FileText className="w-4 h-4 text-white/70" />
        </button>
        <button 
          onClick={() => playSound("click")}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title="Enregistrer"
        >
          <Save className="w-4 h-4 text-white/70" />
        </button>
        <button 
          onClick={() => playSound("click")}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title="Imprimer"
        >
          <Printer className="w-4 h-4 text-white/70" />
        </button>
        
        <div className="w-px h-4 bg-white/10 mx-1" />
        
        <button 
          onClick={() => playSound("click")}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title="Annuler"
        >
          <Undo className="w-4 h-4 text-white/70" />
        </button>
        <button 
          onClick={() => playSound("click")}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title="Rétablir"
        >
          <Redo className="w-4 h-4 text-white/70" />
        </button>
        
        <div className="w-px h-4 bg-white/10 mx-1" />
        
        <button 
          onClick={() => playSound("click")}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title="Couper"
        >
          <Scissors className="w-4 h-4 text-white/70" />
        </button>
        <button 
          onClick={() => playSound("click")}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title="Copier"
        >
          <Copy className="w-4 h-4 text-white/70" />
        </button>
        <button 
          onClick={() => playSound("click")}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title="Coller"
        >
          <ClipboardPaste className="w-4 h-4 text-white/70" />
        </button>
        
        <div className="w-px h-4 bg-white/10 mx-1" />
        
        <button 
          onClick={() => playSound("click")}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title="Rechercher"
        >
          <Search className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto">
        {isViewMode ? (
          <pre className="p-4 text-sm text-white/90 whitespace-pre-wrap font-mono leading-relaxed min-h-full">
            {content}
          </pre>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-4 bg-transparent text-sm text-white/90 resize-none outline-none font-mono leading-relaxed"
            placeholder="Tapez votre texte ici..."
            spellCheck={false}
          />
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-white/10 bg-[#1f1f1f] text-xs text-white/50">
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>100%</span>
        </div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>Windows (CRLF)</span>
        </div>
      </div>
    </div>
  );
}
