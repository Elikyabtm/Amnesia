"use client";

import { useState, useRef, useEffect } from "react";
import { useTextHighlight } from "@/lib/use-text-highlight";
import { Globe, ArrowLeft, ArrowRight, RotateCw, Home, Star, Clock, Search, X, ChevronRight, Plus, Bookmark, History, MapPin, Phone, Mail, Calendar, Users, Building, Newspaper, FileText, Shield, Facebook, ThumbsUp, MessageCircle, Hash, Music, BookOpen, AlertTriangle } from "lucide-react";
import { browserHistory, type BrowserPage } from "@/lib/game-data";
import { SEARCH_HISTORY, CLUE_SEARCH } from "@/lib/data/browser";
import { useGame, type WindowState } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

// Une entrée d'historique d'onglet : page d'accueil, site, recherche ou page interne
type BrowserEntry =
  | { kind: "home" }
  | { kind: "page"; pageId: string }
  | { kind: "search"; query: string }
  | { kind: "history" }
  | { kind: "favorites" };

interface BrowserTab {
  id: string;
  entries: BrowserEntry[];
  index: number;
}

let tabSeq = 0;
const newTab = (entry: BrowserEntry = { kind: "home" }): BrowserTab => ({ id: `tab-${++tabSeq}`, entries: [entry], index: 0 });

const normalizeQuery = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

function entryFromTarget(targetId: string | undefined): BrowserEntry {
  if (!targetId) return { kind: "home" };
  if (targetId === "about:history") return { kind: "history" };
  if (targetId === "about:favorites") return { kind: "favorites" };
  return browserHistory.some((p) => p.id === targetId) ? { kind: "page", pageId: targetId } : { kind: "home" };
}

function entryUrl(entry: BrowserEntry): string {
  switch (entry.kind) {
    case "home": return "";
    case "page": return browserHistory.find((p) => p.id === entry.pageId)?.url ?? "";
    case "search": return `www.cherchici.fr/?q=${encodeURIComponent(entry.query)}`;
    case "history": return "navigateur://historique";
    case "favorites": return "navigateur://favoris";
  }
}

function entryTitle(entry: BrowserEntry): string {
  switch (entry.kind) {
    case "home": return "Nouvel onglet";
    case "page": return browserHistory.find((p) => p.id === entry.pageId)?.title ?? "Page";
    case "search": return `${entry.query} - Cherch'Ici`;
    case "history": return "Historique";
    case "favorites": return "Favoris";
  }
}

/** Pages de l'historique qui correspondent à une recherche (titre, URL ou contenu) */
function searchPages(query: string): BrowserPage[] {
  const words = normalizeQuery(query).split(/\s+/).filter((w) => w.length > 2);
  if (!words.length) return [];
  return browserHistory
    .map((p) => {
      const hay = normalizeQuery(`${p.title} ${p.url} ${p.content}`);
      return { p, score: words.filter((w) => hay.includes(w)).length };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.p);
}

interface BrowserAppProps {
  window: WindowState;
}

export function BrowserApp({ window: win }: BrowserAppProps) {
  const { addClue, browserBookmarks, toggleBrowserBookmark } = useGame();
  const { playSound } = useSound();
  const [tabs, setTabs] = useState<BrowserTab[]>(() => [newTab(entryFromTarget(win.target?.id))]);
  const [activeTabId, setActiveTabId] = useState(() => tabs[0].id);
  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];
  const entry = activeTab.entries[activeTab.index];
  const currentPage = entry.kind === "page" ? browserHistory.find((p) => p.id === entry.pageId) ?? null : null;
  const [urlInput, setUrlInput] = useState(entryUrl(entry));
  const [editingUrl, setEditingUrl] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const targetEntry = entryFromTarget(win.target?.id);
  const isTargetShown =
    !!win.target &&
    ((targetEntry.kind === "page" && entry.kind === "page" && entry.pageId === targetEntry.pageId) ||
      (targetEntry.kind === "history" && entry.kind === "history"));
  useTextHighlight(contentRef, isTargetShown ? win.target?.highlight : undefined, win.id, [isTargetShown, activeTabId]);

  // L'URL affichée suit la page, sauf pendant la saisie
  useEffect(() => {
    if (!editingUrl) setUrlInput(entryUrl(entry));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId, activeTab.index, activeTab.entries.length]);

  // Indices : pages visitées et historique de recherche
  useEffect(() => {
    if (currentPage) detectClues(currentPage);
    if (entry.kind === "history") {
      addClue({
        category: "password",
        text: "Le jour du changement de mot de passe, Bernard a cherché comment taper un dièse (#)",
        source: "Historique du navigateur",
        ref: { kind: "page", id: "about:history" },
        highlight: CLUE_SEARCH,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry]);

  const updateTab = (tabId: string, fn: (t: BrowserTab) => BrowserTab) =>
    setTabs((list) => list.map((t) => (t.id === tabId ? fn(t) : t)));

  const go = (next: BrowserEntry) => {
    playSound("click");
    setEditingUrl(false);
    updateTab(activeTab.id, (t) => {
      const entries = [...t.entries.slice(0, t.index + 1), next];
      return { ...t, entries, index: entries.length - 1 };
    });
  };
  const navigateTo = (page: BrowserPage) => go({ kind: "page", pageId: page.id });

  const detectClues = (page: BrowserPage) => {
    if (page.content.includes("1832") && page.content.includes("Fondée")) {
      addClue({
        category: "place",
        text: "Bourg-sur-Mer a été fondée en 1832",
        source: page.title,
        ref: { kind: "page", id: page.id },
        highlight: "1832",
      });
    }
    if (page.content.includes("14 avril 1967") || page.content.includes("14/04/1967")) {
      addClue({
        category: "date",
        text: "Bernard Dupuis est né le 14 avril 1967",
        source: page.title,
        ref: { kind: "page", id: page.id },
        // La page affichée peut utiliser l'une ou l'autre écriture de la date
        highlight: ["14 avril 1967", "14/04/1967"],
      });
    }
    if (page.content.includes("Bernard Dupuis") && page.content.includes("Maire")) {
      addClue({
        category: "identity",
        text: "Vous êtes Bernard Dupuis, Maire de Bourg-sur-Mer",
        source: page.title,
        ref: { kind: "page", id: page.id },
        highlight: "Bernard Dupuis",
      });
    }
  };

  const goBack = () => {
    if (activeTab.index === 0) return;
    playSound("click");
    updateTab(activeTab.id, (t) => ({ ...t, index: t.index - 1 }));
  };

  const goForward = () => {
    if (activeTab.index >= activeTab.entries.length - 1) return;
    playSound("click");
    updateTab(activeTab.id, (t) => ({ ...t, index: t.index + 1 }));
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = urlInput.trim();
    if (!raw) return go({ kind: "home" });
    const q = normalizeQuery(raw);
    if (q.includes("historique") && q.startsWith("navigateur://")) return go({ kind: "history" });
    if (q.includes("favoris") && q.startsWith("navigateur://")) return go({ kind: "favorites" });
    const exact = browserHistory.find(
      (p) => normalizeQuery(p.url) === q.replace(/^https?:\/\//, "") || normalizeQuery(p.url).startsWith(q.replace(/^https?:\/\//, "")) && q.includes(".")
    );
    if (exact) return navigateTo(exact);
    go({ kind: "search", query: raw });
  };

  const addTab = () => {
    playSound("click");
    const tab = newTab();
    setTabs((list) => [...list, tab]);
    setActiveTabId(tab.id);
  };

  const closeTab = (tabId: string) => {
    playSound("click");
    setTabs((list) => {
      if (list.length === 1) return [newTab()];
      const i = list.findIndex((t) => t.id === tabId);
      const next = list.filter((t) => t.id !== tabId);
      if (tabId === activeTabId) setActiveTabId(next[Math.max(0, i - 1)].id);
      return next;
    });
  };

  const isBookmarked = currentPage ? browserBookmarks.includes(currentPage.id) : false;

  // Render different page styles based on page ID
  const renderPageContent = (page: BrowserPage) => {
    switch (page.id) {
      case "web1":
        return <MairieSiteHistoire page={page} onNavigate={navigateTo} />;
      case "web2":
        return <MairieSiteEquipe page={page} onNavigate={navigateTo} />;
      case "web3":
        return <MuseeSite page={page} />;
      case "web4":
        return <PagesJaunesSite page={page} />;
      case "web5":
        return <LePhareNews page={page} />;
      case "web6":
        return <ArchivesSite page={page} />;
      case "web7":
        return <SecuriteSite page={page} />;
      case "web8":
        return <FacebookSite page={page} />;
      default:
        return <DefaultPageContent page={page} />;
    }
  };

  const renderEntry = () => {
    switch (entry.kind) {
      case "home":
        return <BrowserHomePage onNavigate={navigateTo} onSearch={(q) => go({ kind: "search", query: q })} onOpen={go} bookmarks={browserBookmarks} />;
      case "page":
        return currentPage ? renderPageContent(currentPage) : null;
      case "search":
        return <SearchResultsPage query={entry.query} onNavigate={navigateTo} />;
      case "history":
        return <HistoryPage onNavigate={navigateTo} onSearch={(q) => go({ kind: "search", query: q })} />;
      case "favorites":
        return <FavoritesPage bookmarks={browserBookmarks} onNavigate={navigateTo} onRemove={toggleBrowserBookmark} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1f1f1f]">
      {/* Onglets */}
      <div className="flex items-end gap-1 px-2 pt-1.5 bg-[#252525] overflow-x-auto">
        {tabs.map((tab) => {
          const tabEntry = tab.entries[tab.index];
          const active = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onMouseDown={(e) => e.button === 1 && closeTab(tab.id)}
              className={`group flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-t-lg text-xs max-w-[200px] min-w-[120px] cursor-default ${
                active ? "bg-[#2d2d2d] text-white" : "text-white/60 hover:bg-white/5"
              }`}
              onClick={() => setActiveTabId(tab.id)}
              title={entryTitle(tabEntry)}
            >
              <Globe className="w-3.5 h-3.5 flex-shrink-0 text-white/50" />
              <span className="truncate flex-1">{entryTitle(tabEntry)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="p-0.5 rounded hover:bg-white/15 opacity-60 group-hover:opacity-100"
                aria-label="Fermer l'onglet"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
        <button onClick={addTab} className="mb-1 p-1.5 rounded hover:bg-white/10 text-white/60" title="Nouvel onglet" aria-label="Nouvel onglet">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Barre d'outils */}
      <div className="flex items-center gap-1 p-2 bg-[#2d2d2d] border-b border-white/10">
        <button onClick={goBack} disabled={activeTab.index === 0} className="p-2 rounded hover:bg-white/10 disabled:opacity-30 text-white/70" title="Précédent" aria-label="Précédent">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goForward}
          disabled={activeTab.index >= activeTab.entries.length - 1}
          className="p-2 rounded hover:bg-white/10 disabled:opacity-30 text-white/70"
          title="Suivant"
          aria-label="Suivant"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            playSound("click");
            setReloadKey((k) => k + 1);
          }}
          className="p-2 rounded hover:bg-white/10 text-white/70"
          title="Actualiser"
          aria-label="Actualiser"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button onClick={() => go({ kind: "home" })} className="p-2 rounded hover:bg-white/10 text-white/70" title="Accueil" aria-label="Accueil">
          <Home className="w-4 h-4" />
        </button>

        <form onSubmit={handleAddressSubmit} className="flex-1 flex items-center">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-[#1f1f1f] rounded-full border border-white/10 focus-within:border-[#0078d4]">
            {currentPage ? <Globe className="w-4 h-4 text-green-500" /> : <Search className="w-4 h-4 text-white/40" />}
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setEditingUrl(true);
                setUrlInput(e.target.value);
              }}
              onFocus={(e) => e.target.select()}
              onBlur={() => setEditingUrl(false)}
              placeholder="Rechercher ou entrer une URL"
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40"
              aria-label="Barre d'adresse"
            />
            {urlInput && (
              <button type="button" onClick={() => setUrlInput("")} className="text-white/40 hover:text-white" aria-label="Effacer">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        <button
          onClick={() => {
            if (!currentPage) return;
            playSound("click");
            toggleBrowserBookmark(currentPage.id);
          }}
          disabled={!currentPage}
          className="p-2 rounded hover:bg-white/10 text-white/70 disabled:opacity-30"
          title={isBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-label={isBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Star className={`w-4 h-4 ${isBookmarked ? "text-yellow-400 fill-yellow-400" : ""}`} />
        </button>
        <button onClick={() => go({ kind: "favorites" })} className="p-2 rounded hover:bg-white/10 text-white/70" title="Favoris" aria-label="Favoris">
          <Bookmark className="w-4 h-4" />
        </button>
        <button onClick={() => go({ kind: "history" })} className="p-2 rounded hover:bg-white/10 text-white/70" title="Historique" aria-label="Historique">
          <History className="w-4 h-4" />
        </button>
      </div>

      <div ref={contentRef} key={`${activeTabId}-${reloadKey}`} className="flex-1 overflow-auto">
        {renderEntry()}
      </div>
    </div>
  );
}

// Page d'accueil (nouvel onglet)
function BrowserHomePage({
  onNavigate,
  onSearch,
  onOpen,
  bookmarks,
}: {
  onNavigate: (page: BrowserPage) => void;
  onSearch: (query: string) => void;
  onOpen: (entry: BrowserEntry) => void;
  bookmarks: string[];
}) {
  const [q, setQ] = useState("");
  const favorites = browserHistory.filter((p) => bookmarks.includes(p.id));
  return (
    <div className="min-h-full bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 pt-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0078d4] to-[#00bcf2] mb-4 shadow-lg shadow-blue-500/20">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-light text-white mb-4">Cherch&apos;Ici</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) onSearch(q.trim());
            }}
            className="flex items-center gap-2 max-w-xl mx-auto px-4 py-2.5 rounded-full bg-white/10 border border-white/15 focus-within:border-[#4ea8ff]"
          >
            <Search className="w-4 h-4 text-white/50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher sur le web"
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40"
              aria-label="Rechercher sur le web"
            />
          </form>
        </div>

        {favorites.length > 0 && (
          <div className="mb-8">
            <p className="text-xs text-white/50 mb-3 flex items-center gap-2">
              <Star className="w-3.5 h-3.5" /> Favoris
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {favorites.map((page) => (
                <button
                  key={page.id}
                  onClick={() => onNavigate(page)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0078d4] to-[#00bcf2] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-white/70 text-center truncate w-full">{page.url.split("/")[0].replace("www.", "")}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <span className="flex items-center gap-2 text-sm text-white/70 font-medium">
              <Clock className="w-4 h-4 text-white/50" /> Historique récent
            </span>
            <button onClick={() => onOpen({ kind: "history" })} className="text-xs text-[#4ea8ff] hover:underline">
              Tout l&apos;historique
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {browserHistory.map((page) => (
              <button
                key={page.id}
                onClick={() => onNavigate(page)}
                className="w-full flex items-center gap-4 p-4 hover:bg-white/5 text-left transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#0078d4]/20 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-[#0078d4]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{page.title}</p>
                  <p className="text-xs text-white/40 truncate">{page.url}</p>
                </div>
                <span className="text-xs text-white/30">{page.visitedAt}</span>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Résultats de recherche (moteur fictif Cherch'Ici)
function SearchResultsPage({ query, onNavigate }: { query: string; onNavigate: (page: BrowserPage) => void }) {
  const fromHistory = SEARCH_HISTORY.find((s) => normalizeQuery(s.query) === normalizeQuery(query));
  const pages = [
    ...(fromHistory?.results ?? []).map((id) => browserHistory.find((p) => p.id === id)!).filter(Boolean),
    ...searchPages(query),
  ].filter((p, i, list) => list.findIndex((x) => x.id === p.id) === i);

  return (
    <div className="min-h-full bg-white p-6">
      <div className="max-w-2xl">
        <p className="text-sm text-gray-500 mb-4">
          Résultats pour <strong className="text-gray-800">« {query} »</strong> · {pages.length} résultat{pages.length > 1 ? "s" : ""}
        </p>
        {pages.length === 0 ? (
          <div className="py-8 text-gray-600">
            <p className="mb-2">Aucune page ne correspond à votre recherche.</p>
            <p className="text-sm text-gray-500">La connexion de la mairie filtre la plupart des sites. Essayez d&apos;autres mots-clés.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pages.map((page) => (
              <div key={page.id}>
                <p className="text-xs text-gray-500">{page.url}</p>
                <button onClick={() => onNavigate(page)} className="text-lg text-[#1a0dab] hover:underline text-left">
                  {page.title}
                </button>
                <p className="text-sm text-gray-600 line-clamp-2">{page.content.replace(/\s+/g, " ").slice(0, 180)}…</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Historique complet : recherches et sites visités
function HistoryPage({ onNavigate, onSearch }: { onNavigate: (page: BrowserPage) => void; onSearch: (query: string) => void }) {
  return (
    <div className="min-h-full bg-[#1a1a1a] p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl text-white font-light flex items-center gap-3">
          <History className="w-6 h-6" /> Historique
        </h1>
        <section className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <h2 className="px-4 py-3 text-sm text-white/70 border-b border-white/10 flex items-center gap-2">
            <Search className="w-4 h-4" /> Recherches récentes
          </h2>
          <ul className="divide-y divide-white/5">
            {SEARCH_HISTORY.map((s) => (
              <li key={s.query}>
                <button onClick={() => onSearch(s.query)} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 text-left">
                  <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
                  <span className="flex-1 text-sm text-white/85">{s.query}</span>
                  <span className="text-xs text-white/40 whitespace-nowrap">{s.date}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <h2 className="px-4 py-3 text-sm text-white/70 border-b border-white/10 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Sites visités
          </h2>
          <ul className="divide-y divide-white/5">
            {browserHistory.map((page) => (
              <li key={page.id}>
                <button onClick={() => onNavigate(page)} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 text-left">
                  <Globe className="w-4 h-4 text-[#4ea8ff] flex-shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-white/85 truncate">{page.title}</span>
                    <span className="block text-xs text-white/40 truncate">{page.url}</span>
                  </span>
                  <span className="text-xs text-white/40 whitespace-nowrap">{page.visitedAt}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

// Favoris
function FavoritesPage({
  bookmarks,
  onNavigate,
  onRemove,
}: {
  bookmarks: string[];
  onNavigate: (page: BrowserPage) => void;
  onRemove: (pageId: string) => void;
}) {
  const pages = browserHistory.filter((p) => bookmarks.includes(p.id));
  return (
    <div className="min-h-full bg-[#1a1a1a] p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl text-white font-light flex items-center gap-3 mb-6">
          <Bookmark className="w-6 h-6" /> Favoris
        </h1>
        {pages.length === 0 ? (
          <p className="text-white/50 text-sm">Aucun favori. Cliquez sur l&apos;étoile d&apos;une page pour l&apos;ajouter.</p>
        ) : (
          <ul className="bg-white/5 rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
            {pages.map((page) => (
              <li key={page.id} className="flex items-center gap-2 pr-2">
                <button onClick={() => onNavigate(page)} className="flex-1 flex items-center gap-4 px-4 py-3 hover:bg-white/5 text-left min-w-0">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm text-white/85 truncate">{page.title}</span>
                    <span className="block text-xs text-white/40 truncate">{page.url}</span>
                  </span>
                </button>
                <button onClick={() => onRemove(page.id)} className="p-1.5 rounded hover:bg-white/10 text-white/50" title="Retirer des favoris" aria-label={`Retirer ${page.title} des favoris`}>
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Mairie site - Histoire page
function MairieSiteHistoire({ page, onNavigate }: { page: BrowserPage; onNavigate: (page: BrowserPage) => void }) {
  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <div className="bg-[#003366] text-white">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Bourg-sur-Mer</h1>
              <p className="text-sm text-white/70">Site Officiel de la Commune</p>
            </div>
          </div>
        </div>
        <nav className="bg-[#002244]">
          <div className="max-w-5xl mx-auto px-6 flex gap-1">
            <a href="#" className="px-4 py-3 text-sm hover:bg-white/10">Accueil</a>
            <a href="#" className="px-4 py-3 text-sm bg-white/10 border-b-2 border-[#f4c542]">Histoire</a>
            <a href="#" className="px-4 py-3 text-sm hover:bg-white/10">Mairie</a>
            <a href="#" className="px-4 py-3 text-sm hover:bg-white/10">Services</a>
            <a href="#" className="px-4 py-3 text-sm hover:bg-white/10">Contact</a>
          </div>
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#003366] mb-6">Histoire de Bourg-sur-Mer</h2>
            
            <div className="prose prose-sm">
              <p className="text-gray-600 leading-relaxed mb-4">
                Fondée en <strong className="text-[#003366]">1832</strong>, Bourg-sur-Mer est une commune côtière du littoral français 
                reconnue pour son riche patrimoine maritime et son histoire unique.
              </p>

              <h3 className="text-lg font-semibold text-[#003366] mt-6 mb-3">Dates Clés</h3>
              <div className="space-y-3">
                {[
                  { year: "1832", event: "Fondation officielle de la commune" },
                  { year: "1856", event: "Construction du premier phare" },
                  { year: "1902", event: "Inauguration du port de pêche" },
                  { year: "1967", event: "Ouverture du Musée Maritime" },
                  { year: "2015", event: "Élection de Bernard Dupuis comme maire" },
                ].map((item) => (
                  <div key={item.year} className="flex gap-4 items-start">
                    <span className="px-3 py-1 bg-[#003366] text-white text-sm rounded font-medium">{item.year}</span>
                    <span className="text-gray-600">{item.event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-64">
            <div className="bg-[#f5f5f5] rounded-lg p-4">
              <h3 className="font-semibold text-[#003366] mb-3">Informations</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-[#003366]" />
                  <span>12 450 habitants</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-[#003366]" />
                  <span>Littoral français</span>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <Building className="w-4 h-4 text-[#003366] mt-0.5" />
                  <span>Maire : Bernard Dupuis (depuis 2015)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mairie site - Equipe page
function MairieSiteEquipe({ page, onNavigate }: { page: BrowserPage; onNavigate: (page: BrowserPage) => void }) {
  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <div className="bg-[#003366] text-white">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Bourg-sur-Mer</h1>
              <p className="text-sm text-white/70">Site Officiel de la Commune</p>
            </div>
          </div>
        </div>
        <nav className="bg-[#002244]">
          <div className="max-w-5xl mx-auto px-6 flex gap-1">
            <a href="#" className="px-4 py-3 text-sm hover:bg-white/10">Accueil</a>
            <a href="#" className="px-4 py-3 text-sm hover:bg-white/10">Histoire</a>
            <a href="#" className="px-4 py-3 text-sm bg-white/10 border-b-2 border-[#f4c542]">Mairie</a>
            <a href="#" className="px-4 py-3 text-sm hover:bg-white/10">Services</a>
            <a href="#" className="px-4 py-3 text-sm hover:bg-white/10">Contact</a>
          </div>
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-[#003366] mb-6">L'Équipe Municipale</h2>
        
        {/* Mayor card */}
        <div className="bg-gradient-to-r from-[#003366] to-[#004488] rounded-xl p-6 text-white mb-8">
          <div className="flex gap-6">
            <div className="w-32 h-32 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-16 h-16 text-white/80" />
            </div>
            <div className="flex-1">
              <span className="text-xs uppercase tracking-wider text-white/60">Maire</span>
              <h3 className="text-2xl font-bold mb-2">Bernard Dupuis</h3>
              <p className="text-white/80 text-sm mb-4">
                Né le <strong>14 avril 1967</strong> à Bourg-sur-Mer<br />
                Élu maire en 2015, réélu en 2020
              </p>
              <blockquote className="italic text-white/70 border-l-2 border-[#f4c542] pl-4 text-sm">
                "Je suis né dans cette ville, j'y ai grandi, et j'ai l'honneur de la servir aujourd'hui."
              </blockquote>
            </div>
          </div>
        </div>

        {/* Parcours */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#f5f5f5] rounded-lg p-6">
            <h4 className="font-semibold text-[#003366] mb-4">Parcours</h4>
            <div className="space-y-3 text-sm">
              {[
                { year: "1989", text: "Diplômé de Sciences Politiques" },
                { year: "1993", text: "Conseiller municipal" },
                { year: "2008", text: "Premier adjoint" },
                { year: "2015", text: "Élu maire" },
              ].map((item) => (
                <div key={item.year} className="flex gap-3">
                  <span className="font-medium text-[#003366]">{item.year}</span>
                  <span className="text-gray-600">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#f5f5f5] rounded-lg p-6">
            <h4 className="font-semibold text-[#003366] mb-4">Priorités du Mandat</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#003366]" />
                Préservation du patrimoine maritime
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#003366]" />
                Développement du tourisme culturel
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#003366]" />
                Soutien aux associations locales
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Musee site
function MuseeSite({ page }: { page: BrowserPage }) {
  return (
    <div className="min-h-full bg-[#1a1a1a]">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0a3d62] to-[#1a1a1a] text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-light mb-2">Musée Maritime</h1>
          <p className="text-white/60">de Bourg-sur-Mer</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Current exhibition */}
        <div className="bg-gradient-to-r from-[#0a3d62] to-[#0d4d76] rounded-xl p-8 text-white mb-8">
          <span className="text-xs uppercase tracking-wider text-white/60">Exposition actuelle</span>
          <h2 className="text-2xl font-light mt-2 mb-4">"Mémoires de la Mer - 1832-2025"</h2>
          <p className="text-white/80 mb-4">
            Cette exposition retrace l'histoire maritime de notre ville depuis sa fondation en <strong>1832</strong>.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-[#f4c542]" />
            <span>Du 3 mars au 30 juin 2025</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Hours */}
          <div className="bg-[#252525] rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Horaires</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/80">
                <span>Mardi - Dimanche</span>
                <span>10h - 18h</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Lundi</span>
                <span>Ferme</span>
              </div>
            </div>
          </div>

          {/* Prices */}
          <div className="bg-[#252525] rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Tarifs</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/80">
                <span>Adultes</span>
                <span>8 euros</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Étudiants</span>
                <span>5 euros</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Moins de 12 ans</span>
                <span>Gratuit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inauguration notice */}
        <div className="mt-6 bg-[#f4c542]/10 border border-[#f4c542]/30 rounded-xl p-4 text-center">
          <p className="text-[#f4c542] text-sm">
            <strong>Inauguration officielle :</strong> Le 3 mars 2025 à 18h en présence de M. le Maire Bernard Dupuis
          </p>
        </div>
      </div>
    </div>
  );
}

// Pages Jaunes site
function PagesJaunesSite({ page }: { page: BrowserPage }) {
  return (
    <div className="min-h-full bg-[#f5f5f5]">
      {/* Header */}
      <div className="bg-[#ffcc00] py-3">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-xl font-bold text-[#333]">PagesJaunes</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile header */}
          <div className="bg-gradient-to-r from-[#003366] to-[#004488] p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="w-10 h-10 text-white/80" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Bernard DUPUIS</h2>
                <p className="text-white/80">Maire</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Coordonnées</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#003366] mt-0.5" />
                <div>
                  <p className="text-gray-800">Mairie de Bourg-sur-Mer</p>
                  <p className="text-gray-600 text-sm">12 Place de la République</p>
                  <p className="text-gray-600 text-sm">33120 Bourg-sur-Mer</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#003366]" />
                <span className="text-gray-800">05 XX XX XX XX</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#003366]" />
                <span className="text-gray-800">maire@bourg-sur-mer.fr</span>
              </div>
            </div>

            <hr className="my-6" />

            <h3 className="font-semibold text-gray-800 mb-4">Informations complémentaires</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-[#f5f5f5] rounded-lg p-4">
                <span className="text-gray-500 block mb-1">Date de naissance</span>
                <span className="text-gray-800 font-medium">14/04/1967</span>
              </div>
              <div className="bg-[#f5f5f5] rounded-lg p-4">
                <span className="text-gray-500 block mb-1">Lieu de naissance</span>
                <span className="text-gray-800 font-medium">Bourg-sur-Mer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default page content
function DefaultPageContent({ page }: { page: BrowserPage }) {
  return (
    <div className="h-full bg-white">
      <div className="p-4 bg-[#f5f5f5] border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">{page.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{page.url}</p>
      </div>
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
            {page.content}
          </pre>
        </div>
      </div>
    </div>
  );
}

// Le Phare - Local news site
function LePhareNews({ page }: { page: BrowserPage }) {
  return (
    <div className="min-h-full bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-[#1a365d] text-white">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Newspaper className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-serif font-bold">Le Phare</h1>
              <p className="text-xs text-white/60">Journal local de Bourg-sur-Mer depuis 1892</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid gap-6">
          {/* Main article */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <span className="text-xs font-semibold text-[#1a365d] uppercase tracking-wider">À la une</span>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mt-2">Inauguration du Square Léon Blum</h2>
              <p className="text-gray-600 mt-3">
                Le maire Bernard Dupuis inaugurera demain le nouveau square. 
                <span className="italic">"Une fierté pour notre commune née il y a près de deux siècles"</span>, a-t-il déclaré.
              </p>
              <span className="text-xs text-gray-400 mt-4 block">20 février 2025</span>
            </div>
          </div>

          {/* Other articles */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Music className="w-4 h-4 text-[#1a365d]" />
                <span className="text-xs font-semibold text-[#1a365d] uppercase">Culture</span>
              </div>
              <h3 className="font-serif font-bold text-gray-900">Fête de la Musique : Programme Dévoilé</h3>
              <p className="text-sm text-gray-600 mt-2">
                Le <strong>dièse</strong> sera à l'honneur cette année avec un concert de jazz au port.
                Le maire, grand amateur de musique, a personnellement choisi le programme.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase">Nécrologie</span>
              </div>
              <h3 className="font-serif font-bold text-gray-900">Hommage à Henri Dupuis (1935-1982)</h3>
              <p className="text-sm text-gray-600 mt-2">
                Ancien conseiller municipal et père du maire actuel.
                <span className="italic">"Un homme d'honneur qui nous a quittés trop tôt"</span>, selon les anciens du conseil.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-600 uppercase">Carnet</span>
              </div>
              <h3 className="font-serif font-bold text-gray-900">Anniversaires de la Semaine</h3>
              <p className="text-sm text-gray-600 mt-2">
                Joyeux anniversaire à tous les natifs d'avril ! 
                Notre maire fêtera d'ailleurs le sien le mois prochain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Archives municipales
function ArchivesSite({ page }: { page: BrowserPage }) {
  return (
    <div className="min-h-full bg-[#faf8f5]">
      {/* Header */}
      <div className="bg-[#5c4033] text-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h1 className="text-xl font-semibold">Archives Municipales</h1>
              <p className="text-xs text-white/60">Bourg-sur-Mer - Registres historiques</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Naissances */}
          <div className="bg-white rounded-lg shadow-sm border border-[#d4c4b0] overflow-hidden">
            <div className="bg-[#e8e0d5] px-5 py-3 border-b border-[#d4c4b0]">
              <h2 className="font-serif font-semibold text-[#5c4033]">Registre des Naissances - Extrait</h2>
            </div>
            <div className="p-5">
              <div className="font-mono text-sm bg-[#faf8f5] p-4 rounded border border-[#e8e0d5]">
                <p className="text-[#5c4033] font-semibold mb-2">Année 1967 :</p>
                <div className="pl-4 border-l-2 border-[#d4c4b0]">
                  <p className="text-gray-700"><strong>14/04/1967</strong> : DUPUIS Bernard Henri Marie</p>
                  <p className="text-gray-600 text-xs mt-1">Parents : Henri DUPUIS et Françoise MARTIN</p>
                  <p className="text-gray-600 text-xs">Lieu : Maternité de Bourg-sur-Mer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mariages */}
          <div className="bg-white rounded-lg shadow-sm border border-[#d4c4b0] overflow-hidden">
            <div className="bg-[#e8e0d5] px-5 py-3 border-b border-[#d4c4b0]">
              <h2 className="font-serif font-semibold text-[#5c4033]">Registre des Mariages - Extrait</h2>
            </div>
            <div className="p-5">
              <div className="font-mono text-sm bg-[#faf8f5] p-4 rounded border border-[#e8e0d5]">
                <p className="text-[#5c4033] font-semibold mb-2">Année 1993 :</p>
                <div className="pl-4 border-l-2 border-[#d4c4b0]">
                  <p className="text-gray-700"><strong>15/04/1993</strong> : DUPUIS Bernard et LAURENT Marie</p>
                  <p className="text-gray-600 text-xs mt-1">Témoins : Pierre DUPUIS (frère), Claire LAURENT (sœur)</p>
                  <p className="text-gray-600 text-xs">Lieu : Mairie de Bourg-sur-Mer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Note archiviste */}
          <div className="bg-[#fffbeb] border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 italic">
              <strong>Note archiviste :</strong> La famille Dupuis est établie à BSM depuis la fondation.
              Les initiales <strong>BSM</strong> apparaissent sur les anciens actes officiels de la commune.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Site ANSSI Sécurité
function SecuriteSite({ page }: { page: BrowserPage }) {
  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <div className="bg-[#000091] text-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">ANSSI</h1>
              <p className="text-xs text-white/70">Agence Nationale de la Sécurité des Systèmes d'Information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-[#000091] mb-6">Créer un mot de passe robuste</h2>
        
        <div className="space-y-6">
          {/* Recommandations */}
          <div className="bg-[#f5f5fe] rounded-lg p-6 border-l-4 border-[#000091]">
            <h3 className="font-semibold text-[#000091] mb-4">Recommandations officielles :</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-700">
                <div className="w-6 h-6 rounded-full bg-[#000091] text-white flex items-center justify-center text-xs">1</div>
                Minimum 12 caractères
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <div className="w-6 h-6 rounded-full bg-[#000091] text-white flex items-center justify-center text-xs">2</div>
                Mélanger lettres majuscules et minuscules
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <div className="w-6 h-6 rounded-full bg-[#000091] text-white flex items-center justify-center text-xs">3</div>
                Inclure des chiffres
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <div className="w-6 h-6 rounded-full bg-[#000091] text-white flex items-center justify-center text-xs">4</div>
                Ajouter des caractères spéciaux (<strong>#</strong>, <strong>!</strong>, @, etc.)
              </li>
            </ul>
          </div>

          {/* Exemples */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Exemples de formats sécurisés :</h3>
            <div className="space-y-2 font-mono text-sm">
              <p className="text-gray-600">[Initiales][Année][Symbole][Date]!</p>
              <p className="text-gray-600">[Lieu][Chiffres]#[Anniversaire]</p>
            </div>
          </div>

          {/* Astuce */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Astuce :</h4>
            <p className="text-sm text-green-700">
              Combinez des éléments personnels mais non évidents.
              Par exemple : <strong>initiales d'un lieu + date historique + symbole + date personnelle</strong>
            </p>
          </div>

          {/* À éviter */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-red-800">À éviter :</h4>
            </div>
            <ul className="text-sm text-red-700 space-y-1 ml-7">
              <li>- Dates de naissance seules</li>
              <li>- Noms propres sans modification</li>
              <li>- Suites de chiffres simples</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Facebook profile
function FacebookSite({ page }: { page: BrowserPage }) {
  return (
    <div className="min-h-full bg-[#f0f2f5]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-3">
          <Facebook className="w-10 h-10 text-[#1877f2]" />
          <div className="flex-1 max-w-md">
            <div className="bg-[#f0f2f5] rounded-full px-4 py-2 text-gray-500 text-sm">
              Rechercher sur Facebook
            </div>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="max-w-4xl mx-auto">
        {/* Cover */}
        <div className="h-48 bg-gradient-to-r from-[#1877f2] to-[#42b883] rounded-b-lg" />
        
        {/* Profile info */}
        <div className="bg-white px-6 pb-4 border-b border-gray-200">
          <div className="flex items-end gap-4 -mt-8">
            <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Users className="w-16 h-16 text-gray-400" />
            </div>
            <div className="pb-4">
              <h1 className="text-2xl font-bold text-gray-900">Bernard Dupuis</h1>
              <p className="text-gray-500">Maire de Bourg-sur-Mer depuis 2015</p>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="p-4 space-y-4">
          {/* Post 1 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1877f2] to-[#42b883] flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Bernard Dupuis</p>
                  <p className="text-xs text-gray-500">3 février 2025</p>
                </div>
              </div>
              <p className="text-gray-800">
                Nouveau mot de passe sur l'ordinateur de la mairie ! Plus sécurisé cette fois. 
                Merci au service IT pour leurs conseils.<br/><br/>
                J'ai choisi un format qui me ressemble : <strong>ma ville</strong>, <strong>mes dates</strong>, 
                ma passion pour la <strong>musique</strong> !
              </p>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-gray-500 text-sm">
                <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> 45</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> 12 commentaires</span>
              </div>
            </div>
          </div>

          {/* Post 2 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1877f2] to-[#42b883] flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Bernard Dupuis</p>
                  <p className="text-xs text-gray-500">14 janvier 2025</p>
                </div>
              </div>
              <p className="text-gray-800">
                Préparation de l'inauguration du square Léon Blum. 
                <strong> BSM</strong> a bien changé depuis <strong>1832</strong> !
              </p>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-gray-500 text-sm">
                <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> 127</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> 34 commentaires</span>
              </div>
            </div>
          </div>

          {/* Post 3 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1877f2] to-[#42b883] flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Bernard Dupuis</p>
                  <p className="text-xs text-gray-500">1 janvier 2025</p>
                </div>
              </div>
              <p className="text-gray-800">
                Bonne année 2025 à tous les habitants de Bourg-sur-Mer !
              </p>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-gray-500 text-sm">
                <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> 342</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> 87 commentaires</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
