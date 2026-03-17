"use client";

import { useState, useRef, useCallback } from "react";
import { 
  Mail, 
  Inbox, 
  Send, 
  Trash2, 
  Star,
  Search,
  RefreshCw,
  MoreHorizontal,
  ChevronDown
} from "lucide-react";
import { mails, type FileItem } from "@/lib/game-data";
import { type WindowState, useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

interface MailAppProps {
  window: WindowState;
}

export function MailApp({ window: win }: MailAppProps) {
  const [selectedMail, setSelectedMail] = useState<FileItem | null>(null);
  const { playSound } = useSound();
  const { addClue } = useGame();
  const lastClickRef = useRef<{ id: string; time: number } | null>(null);

  const detectClues = useCallback((mail: FileItem) => {
    const content = mail.content || "";
    
    if (content.includes("14 avril") || content.includes("15 avril")) {
      addClue({
        category: "date",
        text: "Une date importante en avril (anniversaire ou mariage)",
        source: `Email: ${mail.name}`,
      });
    }
    if (content.includes("58 ans")) {
      addClue({
        category: "date", 
        text: "Bernard aura 58 ans",
        source: `Email: ${mail.name}`,
      });
    }
    if (content.includes("32 ans ensemble")) {
      addClue({
        category: "date",
        text: "32 ans de mariage en 2025",
        source: `Email: ${mail.name}`,
      });
    }
    if (content.includes("Marie") && content.includes("epouse")) {
      addClue({
        category: "identity",
        text: "Vous etes marie a Marie",
        source: `Email: ${mail.name}`,
      });
    }
    if (content.includes("Bourg-sur-Mer")) {
      addClue({
        category: "place",
        text: "Vous vivez a Bourg-sur-Mer",
        source: `Email: ${mail.name}`,
      });
    }
  }, [addClue]);

  const handleMailClick = useCallback((mail: FileItem) => {
    playSound("click");
    
    const now = Date.now();
    const lastClick = lastClickRef.current;
    
    if (lastClick && lastClick.id === mail.id && now - lastClick.time < 300) {
      // Double-click - open mail
      setSelectedMail(mail);
      detectClues(mail);
      lastClickRef.current = null;
    } else {
      lastClickRef.current = { id: mail.id, time: now };
      // Single click also selects for easier mobile use
      setSelectedMail(mail);
      detectClues(mail);
    }
  }, [playSound, detectClues]);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-52 bg-[#1f1f1f] border-r border-white/10 flex flex-col">
        <div className="p-3">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0078d4] text-white rounded hover:bg-[#1084d8] transition-colors">
            <Mail className="w-4 h-4" />
            Nouveau message
          </button>
        </div>

        <div className="flex-1 px-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-white bg-white/10 rounded transition-colors">
            <Inbox className="w-4 h-4" />
            <span className="flex-1 text-left text-sm">Boîte de réception</span>
            <span className="text-xs bg-[#0078d4] px-1.5 py-0.5 rounded">{mails.length}</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-white/70 hover:bg-white/5 rounded transition-colors">
            <Star className="w-4 h-4" />
            <span className="flex-1 text-left text-sm">Favoris</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-white/70 hover:bg-white/5 rounded transition-colors">
            <Send className="w-4 h-4" />
            <span className="flex-1 text-left text-sm">Envoyés</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-white/70 hover:bg-white/5 rounded transition-colors">
            <Trash2 className="w-4 h-4" />
            <span className="flex-1 text-left text-sm">Corbeille</span>
          </button>
        </div>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <div className="w-8 h-8 rounded-full bg-[#0078d4] flex items-center justify-center text-white font-medium">
              BD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white/80 truncate">Bernard Dupuis</div>
              <div className="truncate">b.dupuis@mairie.fr</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mail list */}
      <div className="w-72 border-r border-white/10 flex flex-col bg-[#1a1a1a]">
        {/* Search */}
        <div className="p-2 border-b border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#252525] rounded">
            <Search className="w-4 h-4 text-white/40" />
            <input 
              type="text"
              placeholder="Rechercher"
              className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-2 py-1 border-b border-white/10">
          <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
            <RefreshCw className="w-4 h-4 text-white/70" />
          </button>
          <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-white/70 hover:bg-white/10 rounded transition-colors">
            Tous <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Mail list */}
        <div className="flex-1 overflow-auto">
          {mails.map((mail) => (
            <button
              key={mail.id}
              onClick={() => handleMailClick(mail)}
              className={`w-full text-left p-3 border-b border-white/5 transition-colors ${
                selectedMail?.id === mail.id
                  ? "bg-[#0078d4]/20"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#404040] flex items-center justify-center text-white/70 text-xs font-medium flex-shrink-0">
                  {mail.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-white truncate font-medium">
                      {mail.name.split(" - ")[0]}
                    </span>
                    <span className="text-xs text-white/40 flex-shrink-0">14:32</span>
                  </div>
                  <div className="text-xs text-white/60 truncate">
                    {mail.name.split(" - ")[1] || mail.name}
                  </div>
                  <div className="text-xs text-white/40 truncate mt-0.5">
                    {mail.content?.split("\n")[4]?.substring(0, 50)}...
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mail content */}
      <div className="flex-1 flex flex-col bg-[#191919]">
        {selectedMail ? (
          <>
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-white">
                  {selectedMail.name.split(" - ")[1] || selectedMail.name}
                </h2>
                <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-white/70" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#404040] flex items-center justify-center text-white/70 font-medium">
                  {selectedMail.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm text-white">{selectedMail.name.split(" - ")[0]}</div>
                  <div className="text-xs text-white/50">À: b.dupuis@mairie.fr</div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
                {selectedMail.content}
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/40">
            <Mail className="w-16 h-16 mb-4 opacity-50" />
            <p>Sélectionnez un message</p>
            <p className="text-sm mt-1">Double-cliquez pour ouvrir</p>
          </div>
        )}
      </div>
    </div>
  );
}
