"use client";

import { useState } from "react";
import { Globe, ArrowLeft, ArrowRight, RotateCw, Home, Star, Clock, Search, X, ChevronRight, MapPin, Phone, Mail, Calendar, Users, Building } from "lucide-react";
import { browserHistory, type BrowserPage } from "@/lib/game-data";
import { useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

export function BrowserApp() {
  const [currentPage, setCurrentPage] = useState<BrowserPage | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showHistory, setShowHistory] = useState(true);
  const [history, setHistory] = useState<BrowserPage[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { addClue } = useGame();
  const { playSound } = useSound();

  const navigateTo = (page: BrowserPage) => {
    playSound("click");
    setCurrentPage(page);
    setUrlInput(page.url);
    setShowHistory(false);
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(page);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    detectClues(page);
  };

  const detectClues = (page: BrowserPage) => {
    if (page.content.includes("1832") && page.content.includes("Fondee")) {
      addClue({
        category: "place",
        text: "Bourg-sur-Mer a ete fondee en 1832",
        source: page.title,
      });
    }
    if (page.content.includes("14 avril 1967") || page.content.includes("14/04/1967")) {
      addClue({
        category: "date",
        text: "Bernard Dupuis est ne le 14 avril 1967",
        source: page.title,
      });
    }
    if (page.content.includes("Bernard Dupuis") && page.content.includes("Maire")) {
      addClue({
        category: "identity",
        text: "Vous etes Bernard Dupuis, Maire de Bourg-sur-Mer",
        source: page.title,
      });
    }
  };

  const goBack = () => {
    if (historyIndex > 0) {
      playSound("click");
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentPage(history[newIndex]);
      setUrlInput(history[newIndex].url);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      playSound("click");
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentPage(history[newIndex]);
      setUrlInput(history[newIndex].url);
    }
  };

  const goHome = () => {
    playSound("click");
    setCurrentPage(null);
    setShowHistory(true);
    setUrlInput("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = browserHistory.find(
      (p) => p.url.includes(urlInput) || p.title.toLowerCase().includes(urlInput.toLowerCase())
    );
    if (found) {
      navigateTo(found);
    }
  };

  // Render different page styles based on page ID
  const renderPageContent = (page: BrowserPage) => {
    switch (page.id) {
      case "web1":
        return <MairieSiteHistoire page={page} />;
      case "web2":
        return <MairieSiteEquipe page={page} />;
      case "web3":
        return <MuseeSite page={page} />;
      case "web4":
        return <PagesJaunesSite page={page} />;
      default:
        return <DefaultPageContent page={page} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1f1f1f]">
      {/* Browser toolbar */}
      <div className="flex items-center gap-2 p-2 bg-[#2d2d2d] border-b border-white/10">
        <button
          onClick={goBack}
          disabled={historyIndex <= 0}
          className="p-2 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/70"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goForward}
          disabled={historyIndex >= history.length - 1}
          className="p-2 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/70"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button 
          onClick={() => currentPage && navigateTo(currentPage)}
          className="p-2 rounded hover:bg-white/10 text-white/70"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button onClick={goHome} className="p-2 rounded hover:bg-white/10 text-white/70">
          <Home className="w-4 h-4" />
        </button>

        {/* URL bar */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-[#1f1f1f] rounded-full border border-white/10 focus-within:border-[#0078d4]">
            {currentPage ? (
              <Globe className="w-4 h-4 text-green-500" />
            ) : (
              <Search className="w-4 h-4 text-white/40" />
            )}
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Rechercher ou entrer une URL"
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40"
            />
            {urlInput && (
              <button type="button" onClick={() => setUrlInput("")} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        <button className="p-2 rounded hover:bg-white/10 text-white/70">
          <Star className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {showHistory || !currentPage ? (
          <BrowserHomePage onNavigate={navigateTo} />
        ) : (
          renderPageContent(currentPage)
        )}
      </div>
    </div>
  );
}

// Browser home page
function BrowserHomePage({ onNavigate }: { onNavigate: (page: BrowserPage) => void }) {
  return (
    <div className="min-h-full bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-8">
      <div className="max-w-3xl mx-auto">
        {/* Search box */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0078d4] to-[#00bcf2] mb-6 shadow-lg shadow-blue-500/20">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-light text-white mb-2">Navigateur</h1>
          <p className="text-white/50">Explorez l'historique de navigation</p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {browserHistory.map((page) => (
            <button
              key={page.id}
              onClick={() => onNavigate(page)}
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0078d4] to-[#00bcf2] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-white/70 text-center truncate w-full">
                {page.url.split("/")[0].replace("www.", "")}
              </span>
            </button>
          ))}
        </div>

        {/* History list */}
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-white/10">
            <Clock className="w-4 h-4 text-white/50" />
            <span className="text-sm text-white/70 font-medium">Historique recent</span>
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

// Mairie site - Histoire page
function MairieSiteHistoire({ page }: { page: BrowserPage }) {
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
                Fondee en <strong className="text-[#003366]">1832</strong>, Bourg-sur-Mer est une commune cotiere du littoral francais 
                reconnue pour son riche patrimoine maritime et son histoire unique.
              </p>

              <h3 className="text-lg font-semibold text-[#003366] mt-6 mb-3">Dates Cles</h3>
              <div className="space-y-3">
                {[
                  { year: "1832", event: "Fondation officielle de la commune" },
                  { year: "1856", event: "Construction du premier phare" },
                  { year: "1902", event: "Inauguration du port de peche" },
                  { year: "1967", event: "Ouverture du Musee Maritime" },
                  { year: "2015", event: "Election de Bernard Dupuis comme maire" },
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
                  <span>Littoral francais</span>
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
function MairieSiteEquipe({ page }: { page: BrowserPage }) {
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
        <h2 className="text-2xl font-bold text-[#003366] mb-6">L'Equipe Municipale</h2>
        
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
                Ne le <strong>14 avril 1967</strong> a Bourg-sur-Mer<br />
                Elu maire en 2015, reelu en 2020
              </p>
              <blockquote className="italic text-white/70 border-l-2 border-[#f4c542] pl-4 text-sm">
                "Je suis ne dans cette ville, j'y ai grandi, et j'ai l'honneur de la servir aujourd'hui."
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
                { year: "1989", text: "Diplome de Sciences Politiques" },
                { year: "1993", text: "Conseiller municipal" },
                { year: "2008", text: "Premier adjoint" },
                { year: "2015", text: "Elu maire" },
              ].map((item) => (
                <div key={item.year} className="flex gap-3">
                  <span className="font-medium text-[#003366]">{item.year}</span>
                  <span className="text-gray-600">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#f5f5f5] rounded-lg p-6">
            <h4 className="font-semibold text-[#003366] mb-4">Priorites du Mandat</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#003366]" />
                Preservation du patrimoine maritime
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#003366]" />
                Developpement du tourisme culturel
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
          <h1 className="text-4xl font-light mb-2">Musee Maritime</h1>
          <p className="text-white/60">de Bourg-sur-Mer</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Current exhibition */}
        <div className="bg-gradient-to-r from-[#0a3d62] to-[#0d4d76] rounded-xl p-8 text-white mb-8">
          <span className="text-xs uppercase tracking-wider text-white/60">Exposition actuelle</span>
          <h2 className="text-2xl font-light mt-2 mb-4">"Memoires de la Mer - 1832-2025"</h2>
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
                <span>Etudiants</span>
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
            <strong>Inauguration officielle :</strong> Le 3 mars 2025 a 18h en presence de M. le Maire Bernard Dupuis
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
            <h3 className="font-semibold text-gray-800 mb-4">Coordonnees</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#003366] mt-0.5" />
                <div>
                  <p className="text-gray-800">Mairie de Bourg-sur-Mer</p>
                  <p className="text-gray-600 text-sm">12 Place de la Republique</p>
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

            <h3 className="font-semibold text-gray-800 mb-4">Informations complementaires</h3>
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
