"use client";

import { useEffect, useRef, useState } from "react";
import { Cake, Eye, EyeOff, Lock, Mail, MapPin, Phone, Search, StickyNote, Users } from "lucide-react";
import { useGame, type WindowState } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { useTextHighlight } from "@/lib/use-text-highlight";
import { CONTACTS, CONTACT_CLUE, type Contact, type ContactGroup } from "@/lib/data/contacts";

const GROUP_ORDER: ContactGroup[] = ["Famille", "Mairie & politique", "Santé", "Affaires", "Presse", "Masqués"];

const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

interface ContactsAppProps {
  window: WindowState;
}

export function ContactsApp({ window: win }: ContactsAppProps) {
  const { accountLevel, addClue, addSuspicion, discoverSecret, openWindow, secretsDiscovered } = useGame();
  const { playSound } = useSound();
  const [selectedId, setSelectedId] = useState<string>(() => win.target?.id ?? CONTACTS[0].id);
  const [query, setQuery] = useState("");
  // Une fois révélés, les contacts masqués restent visibles
  const [showHidden, setShowHidden] = useState(() => secretsDiscovered.includes("contact-vidal"));
  const [toast, setToast] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const selected = CONTACTS.find((c) => c.id === selectedId) ?? CONTACTS[0];
  useTextHighlight(detailRef, selected.id === win.target?.id ? win.target?.highlight : undefined, win.id, [selected.id]);

  const visible = CONTACTS.filter((c) => (showHidden || !c.hidden) && (!query.trim() || normalize(`${c.name} ${c.role} ${c.notes}`).includes(normalize(query))));

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const select = (contact: Contact) => {
    playSound("click");
    setSelectedId(contact.id);
  };

  // Indice / secret : déclenchés dès qu'une fiche est affichée (y compris à l'ouverture)
  useEffect(() => {
    const contact = CONTACTS.find((c) => c.id === selectedId);
    if (!contact) return;
    if (contact.id === CONTACT_CLUE.contactId) {
      addClue({
        category: "date",
        text: CONTACT_CLUE.text,
        source: `Contacts : ${contact.name}`,
        ref: { kind: "app", id: `contacts:${contact.id}` },
        highlight: CONTACT_CLUE.highlight,
      });
    }
    if (contact.hidden && showHidden) {
      addSuspicion({ type: "sensitive_file", amount: 15, message: `Contact masqué consulté : ${contact.name}` });
      discoverSecret("contact-vidal");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const toggleHidden = () => {
    if (accountLevel === "locked") {
      playSound("error");
      setToast("Connectez-vous pour afficher les contacts masqués");
      return;
    }
    playSound("click");
    setShowHidden((s) => !s);
  };

  const initials = (name: string) =>
    name
      .split(/[\s.-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");

  return (
    <div className="relative flex h-full bg-[#1c1c1c] text-white">
      <div className="w-72 border-r border-white/10 flex flex-col bg-[#202020]">
        <div className="p-3 border-b border-white/10 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#2b2b2b] rounded focus-within:ring-1 focus-within:ring-[#4ea8ff]">
            <Search className="w-4 h-4 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un contact"
              className="flex-1 bg-transparent text-sm outline-none placeholder-white/40"
              aria-label="Rechercher un contact"
            />
          </div>
          <button onClick={toggleHidden} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-white/60 hover:bg-white/5">
            {accountLevel === "locked" ? <Lock className="w-3.5 h-3.5" /> : showHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showHidden ? "Masquer les contacts masqués" : "Afficher les contacts masqués"}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {GROUP_ORDER.map((group) => {
            const list = visible.filter((c) => c.group === group);
            if (!list.length) return null;
            return (
              <div key={group} className="mb-2">
                <p className="px-2 py-1 text-xs text-white/40">{group}</p>
                {list.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => select(c)}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded text-left transition-colors ${
                      selectedId === c.id ? "bg-[#0078d4]/25" : "hover:bg-white/5"
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${c.hidden ? "bg-red-900/60" : "bg-[#3a3a3a]"}`}>
                      {initials(c.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm truncate">{c.name}</span>
                      <span className="block text-xs text-white/40 truncate">{c.role}</span>
                    </span>
                  </button>
                ))}
              </div>
            );
          })}
          {visible.length === 0 && <p className="text-center text-sm text-white/40 py-6">Aucun contact</p>}
        </div>
        <div className="px-3 py-2 border-t border-white/10 text-xs text-white/40 flex items-center gap-2">
          <Users className="w-3.5 h-3.5" /> {visible.length} contact{visible.length > 1 ? "s" : ""}
        </div>
      </div>

      <div ref={detailRef} className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center gap-5 mb-6">
          <span className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold ${selected.hidden ? "bg-red-900/60" : "bg-[#0078d4]"}`}>
            {initials(selected.name)}
          </span>
          <div>
            <h2 className="text-2xl font-semibold">{selected.name}</h2>
            <p className="text-white/60">{selected.role}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {selected.email && (
            <button
              onClick={() => {
                playSound("open");
                openWindow("mail", undefined, undefined, { id: `compose:${selected.email}` });
              }}
              className="flex items-center gap-2 px-4 py-1.5 rounded bg-[#0078d4] hover:bg-[#1084d8] text-sm"
            >
              <Mail className="w-4 h-4" /> Envoyer un email
            </button>
          )}
          {selected.phone && (
            <button
              onClick={() => {
                playSound("click");
                setToast("Aucun téléphone n'est associé à cet ordinateur");
              }}
              className="flex items-center gap-2 px-4 py-1.5 rounded bg-white/10 hover:bg-white/15 text-sm"
            >
              <Phone className="w-4 h-4" /> Appeler
            </button>
          )}
        </div>

        <dl className="space-y-3 max-w-lg">
          {selected.phone && <Field icon={Phone} label="Téléphone" value={selected.phone} />}
          {selected.email && <Field icon={Mail} label="Email" value={selected.email} />}
          {selected.address && <Field icon={MapPin} label="Adresse" value={selected.address} />}
          {selected.birthday && <Field icon={Cake} label="Anniversaire" value={selected.birthday} />}
        </dl>

        <section className="mt-6 max-w-lg rounded-lg bg-[#fef9c3]/5 border border-yellow-200/10 p-4">
          <h3 className="flex items-center gap-2 text-sm text-yellow-100/80 mb-2">
            <StickyNote className="w-4 h-4" /> Notes
          </h3>
          <p className="text-sm text-white/80 whitespace-pre-line leading-relaxed">{selected.notes}</p>
        </section>
      </div>

      {toast && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded bg-[#2b2b2b] border border-white/10 shadow-xl text-sm animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}

function Field({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 mt-0.5 text-white/40" />
      <div>
        <dt className="text-xs text-white/40">{label}</dt>
        <dd className="text-sm text-white/85">{value}</dd>
      </div>
    </div>
  );
}
