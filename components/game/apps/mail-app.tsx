"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  Archive,
  ArchiveRestore,
  MailOpen,
  X,
  Check,
} from "lucide-react";
import { useTextHighlight } from "@/lib/use-text-highlight";
import { baseMailFolder, findMail, pickPassage } from "@/lib/clue-sources";
import { mails, secretMails, sentMails, favoriteMails, deletedMails, type FileItem } from "@/lib/game-data";
import { type WindowState, type MailFolderId, useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

interface MailAppProps {
  window: WindowState;
}

type MailView = MailFolderId | "starred";
type ListFilter = "all" | "unread" | "starred";

interface Draft {
  to: string;
  subject: string;
  body: string;
  mode: "new" | "reply" | "forward";
}

const FOLDER_LABELS: Record<MailView, string> = {
  inbox: "Boîte de réception",
  starred: "Favoris",
  archive: "Archives",
  sent: "Envoyés",
  trash: "Corbeille",
};

const ALL_BASE_MAILS: FileItem[] = [...mails, ...secretMails, ...favoriteMails, ...sentMails, ...deletedMails];

const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function MailApp({ window: win }: MailAppProps) {
  const { playSound } = useSound();
  const {
    addClue,
    accountLevel,
    addSuspicion,
    discoverSecret,
    readMailIds,
    markMailRead,
    markMailUnread,
    identityKnown,
    mailFolderOverrides,
    moveMail,
    starredMailIds,
    toggleMailStar,
    composedMails,
    sendMail,
  } = useGame();

  // Les emails secrets n'arrivent qu'une fois connecté (invité ou admin)
  const visibleBase = accountLevel === "locked" ? ALL_BASE_MAILS.filter((m) => !secretMails.includes(m)) : ALL_BASE_MAILS;
  const allMails = [...composedMails, ...visibleBase];

  const folderOf = useCallback(
    (mailId: string): MailFolderId =>
      mailFolderOverrides[mailId] ?? (mailId.startsWith("composed-") ? "sent" : baseMailFolder(mailId) ?? "inbox"),
    [mailFolderOverrides]
  );

  // Ouvert depuis le carnet d'indices ou la recherche : on affiche directement l'email
  const [selectedId, setSelectedId] = useState<string | null>(() => (win.target && findMail(win.target.id) ? win.target.id : null));
  const [currentView, setCurrentView] = useState<MailView>(() => (win.target ? folderOf(win.target.id) : "inbox"));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ListFilter>("all");
  const [showFilter, setShowFilter] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(() =>
    win.target?.id.startsWith("compose:") ? { mode: "new", to: win.target.id.slice("compose:".length), subject: "", body: "" } : null
  );
  const [banner, setBanner] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const selectedMail = allMails.find((m) => m.id === selectedId) ?? null;

  useEffect(() => {
    if (win.target) markMailRead(win.target.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 2500);
    return () => clearTimeout(t);
  }, [banner]);

  useTextHighlight(
    bodyRef,
    selectedMail && selectedMail.id === win.target?.id ? win.target?.highlight : undefined,
    win.id,
    [selectedMail?.id]
  );

  const mailsIn = (view: MailView) =>
    view === "starred"
      ? allMails.filter((m) => starredMailIds.includes(m.id) && folderOf(m.id) !== "trash")
      : allMails.filter((m) => folderOf(m.id) === view);

  const isUnread = (mail: FileItem) => !readMailIds.includes(mail.id);
  const unreadCount = mailsIn("inbox").filter(isUnread).length;

  const currentMails = mailsIn(currentView).filter((m) => {
    if (filter === "unread" && !isUnread(m)) return false;
    if (filter === "starred" && !starredMailIds.includes(m.id)) return false;
    if (query.trim()) {
      const q = normalize(query.trim());
      return normalize(m.name).includes(q) || normalize(m.content ?? "").includes(q);
    }
    return true;
  });

  const detectClues = useCallback((mail: FileItem) => {
    const content = mail.content || "";
    
    if (content.includes("14 avril") || content.includes("15 avril")) {
      addClue({
        category: "date",
        text: "Une date importante en avril (anniversaire ou mariage)",
        source: `Email: ${mail.name}`,
        ref: { kind: "mail", id: mail.id },
        highlight: pickPassage(content, "14 avril", "15 avril"),
      });
    }
    if (content.includes("58 ans")) {
      addClue({
        category: "date", 
        text: "Bernard aura 58 ans",
        source: `Email: ${mail.name}`,
        ref: { kind: "mail", id: mail.id },
        highlight: "58 ans",
      });
    }
    if (content.includes("32 ans ensemble") || content.includes("30 ans déjà")) {
      addClue({
        category: "date",
        text: "Marié depuis longtemps (mariage en 1993)",
        source: `Email: ${mail.name}`,
        ref: { kind: "mail", id: mail.id },
        highlight: pickPassage(content, "32 ans ensemble", "30 ans déjà"),
      });
    }
    if (content.includes("15 avril 1993")) {
      addClue({
        category: "date",
        text: "Date de mariage : 15 avril 1993",
        source: `Email: ${mail.name}`,
        ref: { kind: "mail", id: mail.id },
        highlight: "15 avril 1993",
      });
    }
    if (content.includes("Marie") && (content.includes("épouse") || content.includes("chérie"))) {
      addClue({
        category: "identity",
        text: "Vous êtes marié à Marie",
        source: `Email: ${mail.name}`,
        ref: { kind: "mail", id: mail.id },
        highlight: pickPassage(content, "épouse", "chérie"),
      });
    }
    if (content.includes("Bourg-sur-Mer") || content.includes("BSM")) {
      addClue({
        category: "place",
        text: "Vous vivez à Bourg-sur-Mer (BSM)",
        source: `Email: ${mail.name}`,
        ref: { kind: "mail", id: mail.id },
        highlight: pickPassage(content, "Bourg-sur-Mer", "BSM"),
      });
    }
    if (content.includes("fondée en 1832") || content.includes("1832")) {
      addClue({
        category: "place",
        text: "Bourg-sur-Mer fondée en 1832",
        source: `Email: ${mail.name}`,
        ref: { kind: "mail", id: mail.id },
        highlight: pickPassage(content, "fondée en 1832", "1832"),
      });
    }
    if (content.includes("initiales + année + symbole") || content.includes("initiales + année importante")) {
      addClue({
        category: "password",
        text: "Format MDP : initiales + année + symbole + date + ponctuation",
        source: `Email: ${mail.name}`,
        ref: { kind: "mail", id: mail.id },
        highlight: pickPassage(content, "initiales + année + symbole", "initiales + année importante"),
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
      discoverSecret(mail.id);
    }
  }, [addClue, addSuspicion, discoverSecret]);

  const handleMailClick = useCallback(
    (mail: FileItem) => {
      playSound("click");
      setSelectedId(mail.id);
      setDraft(null);
      setShowMore(false);
      markMailRead(mail.id);
      detectClues(mail);
    },
    [playSound, detectClues, markMailRead]
  );

  const openView = (view: MailView) => {
    playSound("click");
    setCurrentView(view);
    setSelectedId(null);
    setDraft(null);
    setFilter("all");
  };

  const getMailDate = (mail: FileItem) => mail.content?.match(/Date\s*:\s*([^\n]+)/)?.[1].trim() ?? "";

  const getMailSender = (mail: FileItem) => {
    const content = mail.content || "";
    if (folderOf(mail.id) === "sent") {
      const toMatch = content.match(/À\s*:\s*([^\n]+)/);
      return toMatch ? `À : ${toMatch[1].trim()}` : "";
    }
    const fromMatch = content.match(/De\s*:\s*([^\n<]+)/);
    return fromMatch ? fromMatch[1].trim() : mail.name.split(" - ")[0];
  };

  const getSubject = (mail: FileItem) =>
    mail.content?.match(/Objet\s*:\s*([^\n]+)/)?.[1].trim() ?? (mail.name.includes(" - ") ? mail.name.split(" - ")[1] : mail.name);

  const getInitial = (mail: FileItem) =>
    (getMailSender(mail).replace(/^À\s*:\s*/, "").match(/\p{L}/u)?.[0] ?? "?").toUpperCase();

  // Corps du message sans l'en-tête De/À/Objet/Date, pour les citations
  const bodyOf = (mail: FileItem) => (mail.content ?? "").replace(/^(De|À|A|Objet|Date)\s*:.*\n/gm, "").trim();

  const startDraft = (mode: Draft["mode"]) => {
    playSound("click");
    setShowMore(false);
    if (mode === "new" || !selectedMail) {
      setDraft({ mode: "new", to: "", subject: "", body: "" });
      return;
    }
    const subject = getSubject(selectedMail);
    const quoted = bodyOf(selectedMail)
      .split("\n")
      .map((l) => `> ${l}`)
      .join("\n");
    const header = `\n\n--- Message de ${getMailSender(selectedMail)} du ${getMailDate(selectedMail)} ---\n`;
    if (mode === "reply") {
      const sender = getMailSender(selectedMail).replace(/^À\s*:\s*/, "");
      setDraft({ mode, to: sender, subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`, body: header + quoted });
    } else {
      setDraft({ mode, to: "", subject: `Tr: ${subject}`, body: header + quoted });
    }
  };

  const submitDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft || !draft.to.trim()) return;
    sendMail({ to: draft.to, subject: draft.subject, body: draft.body });
    playSound("success");
    setDraft(null);
    setBanner("Message envoyé");
  };

  const moveSelected = (folder: MailFolderId, message: string) => {
    if (!selectedMail) return;
    playSound("click");
    moveMail(selectedMail.id, folder);
    setSelectedId(null);
    setShowMore(false);
    setBanner(message);
  };

  // Restaurer : retour au dossier d'origine (la boîte de réception pour un email supprimé d'origine)
  const restoreTarget = (mailId: string): MailFolderId => {
    const base = mailId.startsWith("composed-") ? "sent" : baseMailFolder(mailId) ?? "inbox";
    return base === "trash" ? "inbox" : base;
  };

  const folderButton = (view: MailView, Icon: typeof Inbox, count?: number, highlight?: boolean) => (
    <button
      onClick={() => openView(view)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
        currentView === view ? "text-white bg-white/10" : "text-white/70 hover:bg-white/5"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="flex-1 text-left text-sm">{FOLDER_LABELS[view]}</span>
      {count !== undefined && count > 0 && (
        <span className={`text-xs ${highlight ? "bg-[#0078d4] text-white px-1.5 py-0.5 rounded" : "text-white/50"}`}>{count}</span>
      )}
    </button>
  );

  const selectedFolder = selectedMail ? folderOf(selectedMail.id) : null;

  return (
    <div className="relative flex h-full">
      {/* Sidebar */}
      <div className="w-52 bg-[#1f1f1f] border-r border-white/10 flex flex-col">
        <div className="p-3">
          <button
            onClick={() => startDraft("new")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0078d4] text-white rounded hover:bg-[#1084d8] transition-colors"
          >
            <Mail className="w-4 h-4" />
            Nouveau message
          </button>
        </div>

        <div className="flex-1 px-2 space-y-0.5">
          {folderButton("inbox", Inbox, unreadCount, true)}
          {folderButton("starred", Star, mailsIn("starred").length)}
          {folderButton("archive", Archive, mailsIn("archive").length)}
          {folderButton("sent", Send, mailsIn("sent").length)}
          {folderButton("trash", Trash2, mailsIn("trash").length)}
        </div>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <div className="w-8 h-8 rounded-full bg-[#0078d4] flex items-center justify-center text-white font-medium">
              {identityKnown ? "BD" : "?"}
            </div>
            <div className="flex-1 min-w-0">
              {/* Le nom n'apparaît qu'une fois l'identité découverte (pas de spoiler) */}
              <div className="text-white/80 truncate">{identityKnown ? "Bernard Dupuis" : "???"}</div>
              <div className="truncate">{identityKnown ? "b.dupuis@mairie.fr" : "Compte de la mairie"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mail list */}
      <div className="w-72 border-r border-white/10 flex flex-col bg-[#1a1a1a]">
        <div className="p-3 border-b border-white/10">
          <h3 className="text-sm font-medium text-white">{FOLDER_LABELS[currentView]}</h3>
          <p className="text-xs text-white/50">
            {currentMails.length} message{currentMails.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="p-2 border-b border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#252525] rounded focus-within:ring-1 focus-within:ring-[#4ea8ff]">
            <Search className="w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Rechercher dans ce dossier"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
              aria-label="Rechercher dans le courrier"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Effacer la recherche">
                <X className="w-3.5 h-3.5 text-white/50 hover:text-white" />
              </button>
            )}
          </div>
        </div>

        <div className="relative flex items-center gap-1 px-2 py-1 border-b border-white/10">
          <button
            onClick={() => {
              playSound("click");
              setRefreshing(true);
              setTimeout(() => {
                setRefreshing(false);
                setBanner("Aucun nouveau message");
              }, 700);
            }}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            title="Actualiser"
            aria-label="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 text-white/70 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-white/70 hover:bg-white/10 rounded transition-colors"
          >
            {filter === "all" ? "Tous" : filter === "unread" ? "Non lus" : "Favoris"} <ChevronDown className="w-3 h-3" />
          </button>
          {showFilter && (
            <div className="absolute left-10 top-full z-20 w-36 bg-[#2b2b2b] border border-white/10 rounded shadow-xl p-1">
              {(["all", "unread", "starred"] as ListFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setShowFilter(false);
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-white/80 hover:bg-white/10 rounded"
                >
                  {f === "all" ? "Tous" : f === "unread" ? "Non lus" : "Favoris"}
                  {filter === f && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {currentMails.length === 0 ? (
            <div className="p-4 text-center text-white/40 text-sm">
              {query ? `Aucun résultat pour « ${query} »` : "Aucun message dans ce dossier"}
            </div>
          ) : (
            currentMails.map((mail) => (
              <button
                key={mail.id}
                onClick={() => handleMailClick(mail)}
                className={`w-full text-left p-3 border-b border-white/5 transition-colors ${
                  selectedId === mail.id ? "bg-[#0078d4]/20" : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#404040] flex items-center justify-center text-white/70 text-xs font-medium flex-shrink-0">
                    {getInitial(mail)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate flex items-center gap-1.5 ${isUnread(mail) ? "text-white font-semibold" : "text-white/80"}`}>
                        {isUnread(mail) && <span className="w-2 h-2 rounded-full bg-[#0078d4] flex-shrink-0" />}
                        {getMailSender(mail)}
                      </span>
                      {starredMailIds.includes(mail.id) && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                    </div>
                    <div className="text-xs text-white/60 truncate">{getSubject(mail)}</div>
                    <div className="text-xs text-white/40 truncate mt-0.5">{getMailDate(mail)}</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Reading pane / editor */}
      <div className="flex-1 flex flex-col bg-[#191919] min-w-0">
        {draft ? (
          <form onSubmit={submitDraft} className="flex-1 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-white font-medium">
                {draft.mode === "reply" ? "Répondre" : draft.mode === "forward" ? "Transférer" : "Nouveau message"}
              </h2>
              <button type="button" onClick={() => setDraft(null)} className="p-1.5 rounded hover:bg-white/10" aria-label="Fermer le brouillon">
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
            <label className="flex items-center gap-3 px-4 py-2 border-b border-white/10 text-sm">
              <span className="w-12 text-white/50">À</span>
              <input
                autoFocus={draft.mode !== "reply"}
                value={draft.to}
                onChange={(e) => setDraft({ ...draft, to: e.target.value })}
                placeholder="destinataire@exemple.fr"
                className="flex-1 bg-transparent text-white outline-none placeholder-white/30"
                required
              />
            </label>
            <label className="flex items-center gap-3 px-4 py-2 border-b border-white/10 text-sm">
              <span className="w-12 text-white/50">Objet</span>
              <input
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                className="flex-1 bg-transparent text-white outline-none"
              />
            </label>
            <textarea
              autoFocus={draft.mode === "reply"}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              onFocus={(e) => draft.mode !== "new" && e.target.setSelectionRange(0, 0)}
              className="flex-1 p-4 bg-transparent text-sm text-white/90 outline-none resize-none leading-relaxed"
              placeholder="Écrivez votre message..."
              aria-label="Message"
            />
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-white/10">
              <button type="button" onClick={() => setDraft(null)} className="px-4 py-1.5 text-sm rounded bg-white/10 hover:bg-white/15 text-white">
                Annuler
              </button>
              <button
                type="submit"
                disabled={!draft.to.trim()}
                className="flex items-center gap-2 px-4 py-1.5 text-sm rounded bg-[#0078d4] hover:bg-[#1084d8] text-white disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> Envoyer
              </button>
            </div>
          </form>
        ) : selectedMail ? (
          <>
            <div className="p-4 border-b border-white/10">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-lg font-medium text-white min-w-0 break-words">{getSubject(selectedMail)}</h2>
                <div className="relative flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => {
                      playSound("click");
                      toggleMailStar(selectedMail.id);
                    }}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    title={starredMailIds.includes(selectedMail.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    {starredMailIds.includes(selectedMail.id) ? (
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ) : (
                      <StarOff className="w-5 h-5 text-white/70" />
                    )}
                  </button>
                  <button onClick={() => startDraft("reply")} className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Répondre">
                    <Reply className="w-5 h-5 text-white/70" />
                  </button>
                  <button onClick={() => startDraft("forward")} className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Transférer">
                    <Forward className="w-5 h-5 text-white/70" />
                  </button>
                  {selectedFolder === "trash" ? (
                    <button
                      onClick={() => moveSelected(restoreTarget(selectedMail.id), `Message restauré dans « ${FOLDER_LABELS[restoreTarget(selectedMail.id)]} »`)}
                      className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-white/10 rounded transition-colors text-sm text-white/80"
                      title="Restaurer"
                    >
                      <ArchiveRestore className="w-5 h-5" /> Restaurer
                    </button>
                  ) : (
                    <>
                      {selectedFolder === "inbox" && (
                        <button onClick={() => moveSelected("archive", "Message archivé")} className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Archiver">
                          <Archive className="w-5 h-5 text-white/70" />
                        </button>
                      )}
                      {selectedFolder === "archive" && (
                        <button onClick={() => moveSelected("inbox", "Message replacé dans la boîte de réception")} className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Désarchiver">
                          <ArchiveRestore className="w-5 h-5 text-white/70" />
                        </button>
                      )}
                      <button onClick={() => moveSelected("trash", "Message déplacé dans la corbeille")} className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Supprimer">
                        <Trash2 className="w-5 h-5 text-white/70" />
                      </button>
                    </>
                  )}
                  <button onClick={() => setShowMore(!showMore)} className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Plus d'actions">
                    <MoreHorizontal className="w-5 h-5 text-white/70" />
                  </button>
                  {showMore && (
                    <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-[#2b2b2b] border border-white/10 rounded shadow-xl p-1">
                      <button
                        onClick={() => {
                          playSound("click");
                          markMailUnread(selectedMail.id);
                          setSelectedId(null);
                          setShowMore(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-white/85 hover:bg-white/10 rounded"
                      >
                        <MailOpen className="w-4 h-4" /> Marquer comme non lu
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#404040] flex items-center justify-center text-white/70 font-medium">
                  {getInitial(selectedMail)}
                </div>
                <div>
                  <div className="text-sm text-white">{getMailSender(selectedMail)}</div>
                  <div className="text-xs text-white/50">
                    {selectedFolder === "sent" ? "Envoyé" : "À : b.dupuis@mairie.fr"} • {getMailDate(selectedMail)}
                  </div>
                </div>
              </div>
            </div>
            <div ref={bodyRef} className="flex-1 p-6 overflow-auto">
              <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">{selectedMail.content}</pre>
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

      {banner && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded bg-[#2b2b2b] border border-white/10 shadow-xl text-sm text-white flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" /> {banner}
        </div>
      )}
    </div>
  );
}
