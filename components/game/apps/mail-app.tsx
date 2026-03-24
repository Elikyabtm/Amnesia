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
  ChevronDown,
  StarOff,
  Reply,
  Forward,
  Archive
} from "lucide-react";
import { mails, allMails, secretMails, sentMails, favoriteMails, deletedMails, type FileItem } from "@/lib/game-data";
import { type WindowState, useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

interface MailAppProps {
  window: WindowState;
}

type MailFolder = "inbox" | "sent" | "favorites" | "trash";

export function MailApp({ window: win }: MailAppProps) {
  const [selectedMail, setSelectedMail] = useState<FileItem | null>(null);
  const [currentFolder, setCurrentFolder] = useState<MailFolder>("inbox");
  const [localFavorites, setLocalFavorites] = useState<string[]>(favoriteMails.map(m => m.id));
  const { playSound } = useSound();
  const { addClue, accountLevel, addSuspicion, discoverSecret } = useGame();
  
  // Show secret mails only in admin mode
  const inboxMails = accountLevel === "admin" ? allMails : mails;
  const lastClickRef = useRef<{ id: string; time: number } | null>(null);

  // Get mails for current folder
  const getCurrentMails = useCallback((): FileItem[] => {
    switch (currentFolder) {
      case "inbox":
        return inboxMails;
      case "sent":
        return sentMails;
      case "favorites":
        return [...favoriteMails, ...inboxMails.filter(m => localFavorites.includes(m.id) && !favoriteMails.some(f => f.id === m.id))];
      case "trash":
        return deletedMails;
      default:
        return inboxMails;
    }
  }, [currentFolder, inboxMails, localFavorites]);

  const currentMails = getCurrentMails();

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
    if (content.includes("32 ans ensemble") || content.includes("30 ans déjà")) {
      addClue({
        category: "date",
        text: "Marié depuis longtemps (mariage en 1993)",
        source: `Email: ${mail.name}`,
      });
    }
    if (content.includes("15 avril 1993")) {
      addClue({
        category: "date",
        text: "Date de mariage : 15 avril 1993",
        source: `Email: ${mail.name}`,
      });
    }
    if (content.includes("Marie") && (content.includes("épouse") || content.includes("chérie"))) {
      addClue({
        category: "identity",
        text: "Vous êtes marié à Marie",
        source: `Email: ${mail.name}`,
      });
    }
    if (content.includes("Bourg-sur-Mer") || content.includes("BSM")) {
      addClue({
        category: "place",
        text: "Vous vivez à Bourg-sur-Mer (BSM)",
        source: `Email: ${mail.name}`,
      });
    }
    if (content.includes("fondée en 1832") || content.includes("1832")) {
      addClue({
        category: "place",
        text: "Bourg-sur-Mer fondée en 1832",
        source: `Email: ${mail.name}`,
      });
    }
    if (content.includes("initiales + année + symbole") || content.includes("initiales + année importante")) {
      addClue({
        category: "password",
        text: "Format MDP : initiales + année + symbole + date + ponctuation",
        source: `Email: ${mail.name}`,
      });
    }

    // Check if this is a secret mail
    const isSecretMail = secretMails.some(sm => sm.id === mail.id);
    if (isSecretMail) {
      addSuspicion({
        type: "sensitive_file",
        amount: 20,
        message: `Email sensible consulté: ${mail.name}`,
      });
      discoverSecret(mail.name);
    }
  }, [addClue, addSuspicion, discoverSecret]);

  const handleMailClick = useCallback((mail: FileItem) => {
    playSound("click");
    setSelectedMail(mail);
    detectClues(mail);
  }, [playSound, detectClues]);

  const handleFolderClick = useCallback((folder: MailFolder) => {
    playSound("click");
    setCurrentFolder(folder);
    setSelectedMail(null);
  }, [playSound]);

  const toggleFavorite = useCallback((mailId: string) => {
    playSound("click");
    setLocalFavorites(prev => 
      prev.includes(mailId) 
        ? prev.filter(id => id !== mailId)
        : [...prev, mailId]
    );
  }, [playSound]);

  const isFavorite = (mailId: string) => {
    return localFavorites.includes(mailId) || favoriteMails.some(m => m.id === mailId);
  };

  const getFolderName = () => {
    switch (currentFolder) {
      case "inbox": return "Boîte de réception";
      case "sent": return "Messages envoyés";
      case "favorites": return "Favoris";
      case "trash": return "Corbeille";
    }
  };

  const getMailDate = (mail: FileItem) => {
    const content = mail.content || "";
    const dateMatch = content.match(/Date\s*:\s*([^\n]+)/);
    return dateMatch ? dateMatch[1].trim() : "";
  };

  const getMailSender = (mail: FileItem) => {
    const content = mail.content || "";
    if (currentFolder === "sent") {
      const toMatch = content.match(/À\s*:\s*([^\n]+)/);
      return toMatch ? `À: ${toMatch[1].trim()}` : "";
    }
    const fromMatch = content.match(/De\s*:\s*([^\n<]+)/);
    return fromMatch ? fromMatch[1].trim() : mail.name.split(" - ")[0];
  };

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
          <button 
            onClick={() => handleFolderClick("inbox")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              currentFolder === "inbox" ? "text-white bg-white/10" : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span className="flex-1 text-left text-sm">Boîte de réception</span>
            <span className="text-xs bg-[#0078d4] px-1.5 py-0.5 rounded">{inboxMails.length}</span>
          </button>
          <button 
            onClick={() => handleFolderClick("favorites")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              currentFolder === "favorites" ? "text-white bg-white/10" : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Star className="w-4 h-4" />
            <span className="flex-1 text-left text-sm">Favoris</span>
            <span className="text-xs text-white/50">{favoriteMails.length + localFavorites.filter(id => !favoriteMails.some(m => m.id === id)).length}</span>
          </button>
          <button 
            onClick={() => handleFolderClick("sent")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              currentFolder === "sent" ? "text-white bg-white/10" : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="flex-1 text-left text-sm">Envoyés</span>
            <span className="text-xs text-white/50">{sentMails.length}</span>
          </button>
          <button 
            onClick={() => handleFolderClick("trash")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              currentFolder === "trash" ? "text-white bg-white/10" : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span className="flex-1 text-left text-sm">Corbeille</span>
            <span className="text-xs text-white/50">{deletedMails.length}</span>
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
        {/* Header */}
        <div className="p-3 border-b border-white/10">
          <h3 className="text-sm font-medium text-white">{getFolderName()}</h3>
          <p className="text-xs text-white/50">{currentMails.length} message{currentMails.length > 1 ? 's' : ''}</p>
        </div>

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
          {currentMails.length === 0 ? (
            <div className="p-4 text-center text-white/40 text-sm">
              Aucun message dans ce dossier
            </div>
          ) : (
            currentMails.map((mail) => (
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
                        {getMailSender(mail)}
                      </span>
                      {isFavorite(mail.id) && (
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-white/60 truncate">
                      {mail.name.includes(" - ") ? mail.name.split(" - ")[1] : mail.name}
                    </div>
                    <div className="text-xs text-white/40 truncate mt-0.5">
                      {getMailDate(mail)}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Mail content */}
      <div className="flex-1 flex flex-col bg-[#191919]">
        {selectedMail ? (
          <>
            {/* Mail header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-white">
                  {selectedMail.name.includes(" - ") ? selectedMail.name.split(" - ")[1] : selectedMail.name}
                </h2>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => toggleFavorite(selectedMail.id)}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    title={isFavorite(selectedMail.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    {isFavorite(selectedMail.id) ? (
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ) : (
                      <StarOff className="w-5 h-5 text-white/70" />
                    )}
                  </button>
                  <button className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Répondre">
                    <Reply className="w-5 h-5 text-white/70" />
                  </button>
                  <button className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Transférer">
                    <Forward className="w-5 h-5 text-white/70" />
                  </button>
                  <button className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Archiver">
                    <Archive className="w-5 h-5 text-white/70" />
                  </button>
                  <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-white/70" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#404040] flex items-center justify-center text-white/70 font-medium">
                  {selectedMail.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm text-white">{getMailSender(selectedMail)}</div>
                  <div className="text-xs text-white/50">
                    {currentFolder === "sent" ? "Envoyé" : "À: b.dupuis@mairie.fr"} • {getMailDate(selectedMail)}
                  </div>
                </div>
              </div>
            </div>
            {/* Mail body */}
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
            <p className="text-sm mt-1">Cliquez sur un email pour le lire</p>
          </div>
        )}
      </div>
    </div>
  );
}
