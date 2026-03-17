"use client";

import { useState, useRef, useCallback } from "react";
import { 
  Folder, 
  FileText, 
  Image, 
  Music, 
  ChevronRight,
  ChevronDown,
  Home,
  HardDrive,
  ArrowLeft,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { fileSystem, type FileItem } from "@/lib/game-data";
import { useGame, type WindowState } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

interface FileExplorerProps {
  window: WindowState;
}

export function FileExplorer({ window: win }: FileExplorerProps) {
  const [currentFolder, setCurrentFolder] = useState<FileItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { openWindow, addClue } = useGame();
  const { playSound } = useSound();
  const lastClickRef = useRef<{ id: string; time: number } | null>(null);

  const currentItems = currentFolder?.children || fileSystem;
  const path = currentFolder ? `Ce PC > Documents > ${currentFolder.name}` : "Ce PC > Documents";

  const detectClues = useCallback((item: FileItem) => {
    const content = item.content || "";
    
    if (content.includes("14 avril 1967") || content.includes("jour de ma naissance")) {
      addClue({
        category: "date",
        text: "Date de naissance : 14 avril 1967",
        source: item.name,
      });
    }
    if (content.includes("1832") && (content.includes("Bourg") || content.includes("fondation"))) {
      addClue({
        category: "place",
        text: "Bourg-sur-Mer fondee en 1832",
        source: item.name,
      });
    }
    if (content.includes("Maire") || content.includes("maire")) {
      addClue({
        category: "identity",
        text: "Vous etes le Maire de Bourg-sur-Mer",
        source: item.name,
      });
    }
    if (content.includes("fondation ville") && content.includes("date naissance")) {
      addClue({
        category: "password",
        text: "Format du mot de passe : [fondation ville] + [date naissance]",
        source: item.name,
      });
    }
    if (content.includes("Bourg1832")) {
      addClue({
        category: "password",
        text: "L'ancien mot de passe etait 'Bourg1832' - trop simple",
        source: item.name,
      });
    }
    if (content.includes("Bernard Dupuis")) {
      addClue({
        category: "identity",
        text: "Votre nom est Bernard Dupuis",
        source: item.name,
      });
    }
  }, [addClue]);

  const getIcon = (item: FileItem) => {
    switch (item.type) {
      case "folder":
        return <Folder className="w-5 h-5 text-yellow-400" />;
      case "image":
        return <Image className="w-5 h-5 text-green-400" />;
      case "audio":
        return <Music className="w-5 h-5 text-purple-400" />;
      default:
        return <FileText className="w-5 h-5 text-blue-400" />;
    }
  };

  const handleItemClick = useCallback((item: FileItem) => {
    playSound("click");
    setSelectedItem(item.id);
    
    const now = Date.now();
    const lastClick = lastClickRef.current;
    
    // Double-click detection
    if (lastClick && lastClick.id === item.id && now - lastClick.time < 300) {
      playSound("open");
      
      if (item.type === "folder") {
        setCurrentFolder(item);
        setSelectedItem(null);
      } else if (item.type === "image") {
        openWindow("photos", item.name, item);
        detectClues(item);
      } else if (item.type === "audio") {
        openWindow("audio");
      } else {
        openWindow("notepad", item.name, item);
        detectClues(item);
      }
      lastClickRef.current = null;
    } else {
      lastClickRef.current = { id: item.id, time: now };
    }
  }, [openWindow, playSound]);

  const goBack = () => {
    playSound("click");
    setCurrentFolder(null);
    setSelectedItem(null);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-48 bg-[#1f1f1f] border-r border-white/10 p-2 flex flex-col gap-1">
        <div className="text-xs text-white/50 px-2 py-1 font-medium">Accès rapide</div>
        
        <button 
          onClick={goBack}
          className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
            !currentFolder ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
          }`}
        >
          <Home className="w-4 h-4" />
          Documents
        </button>

        {fileSystem.map((folder) => (
          <button
            key={folder.id}
            onClick={() => {
              playSound("click");
              setCurrentFolder(folder);
              setSelectedItem(null);
            }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
              currentFolder?.id === folder.id 
                ? "bg-white/10 text-white" 
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            {currentFolder?.id === folder.id ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            {folder.name}
          </button>
        ))}

        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 px-2 py-1.5 text-white/50 text-sm">
            <HardDrive className="w-4 h-4" />
            Ce PC
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-2 border-b border-white/10 bg-[#252525]">
          <button 
            onClick={goBack}
            disabled={!currentFolder}
            className="p-1.5 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white/70" />
          </button>
          <button className="p-1.5 hover:bg-white/10 rounded opacity-30 cursor-not-allowed">
            <ArrowRight className="w-4 h-4 text-white/70" />
          </button>
          <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
            <RefreshCw className="w-4 h-4 text-white/70" />
          </button>
          
          {/* Path */}
          <div className="flex-1 flex items-center gap-1 px-3 py-1.5 bg-[#1f1f1f] rounded text-sm text-white/70">
            {path}
          </div>
        </div>

        {/* File grid */}
        <div className="flex-1 p-4 overflow-auto">
          {currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/40">
              <Folder className="w-16 h-16 mb-4 opacity-50" />
              <p>Ce dossier est vide</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {currentItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                    selectedItem === item.id
                      ? "bg-[#0078d4]/30 ring-1 ring-[#0078d4]"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    {item.type === "folder" ? (
                      <Folder className="w-10 h-10 text-yellow-400" />
                    ) : item.type === "image" ? (
                      <div className="w-10 h-10 rounded overflow-hidden bg-white/10">
                        {item.imageSrc && (
                          <img 
                            src={item.imageSrc} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      getIcon(item)
                    )}
                  </div>
                  <span className="text-xs text-white/80 text-center line-clamp-2">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="px-4 py-2 border-t border-white/10 bg-[#1f1f1f] text-xs text-white/50">
          {currentItems.length} élément{currentItems.length > 1 ? "s" : ""}
          {selectedItem && " • 1 sélectionné"}
        </div>
      </div>
    </div>
  );
}
