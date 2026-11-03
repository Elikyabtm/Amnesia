"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, Cpu, Download, Globe, Palette, RefreshCw, ShieldCheck, User, Wifi, XCircle, Info } from "lucide-react";
import { useGame, type WindowState } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { useTextHighlight } from "@/lib/use-text-highlight";
import { LOGIN_HISTORY, NETWORK_INFO, PASSWORD_POLICY_REPORT, SYSTEM_INFO, UPDATE_HISTORY } from "@/lib/data/settings";
import { WallpaperPicker } from "../wallpaper-picker";

type Section = "account" | "system" | "network" | "personalization" | "updates";

const SECTIONS: { id: Section; label: string; icon: typeof User }[] = [
  { id: "account", label: "Comptes", icon: User },
  { id: "system", label: "Système", icon: Cpu },
  { id: "network", label: "Réseau et Internet", icon: Wifi },
  { id: "personalization", label: "Personnalisation", icon: Palette },
  { id: "updates", label: "Mises à jour", icon: Download },
];

export const SETTINGS_CLUE = "Le nouveau mot de passe compte 17 caractères, dont 2 symboles";

interface SettingsAppProps {
  window: WindowState;
}

export function SettingsApp({ window: win }: SettingsAppProps) {
  const { accountLevel, identityKnown, batteryLevel, addClue } = useGame();
  const { playSound } = useSound();
  const initial = SECTIONS.some((s) => s.id === win.target?.id) ? (win.target!.id as Section) : "account";
  const [section, setSection] = useState<Section>(initial);
  const [checking, setChecking] = useState<"idle" | "checking" | "done">("idle");
  const contentRef = useRef<HTMLDivElement>(null);
  useTextHighlight(contentRef, section === win.target?.id ? win.target?.highlight : undefined, win.id, [section]);

  // Indice : les critères du mot de passe actuel sont visibles dans Comptes
  useEffect(() => {
    if (section !== "account") return;
    addClue({
      category: "password",
      text: SETTINGS_CLUE,
      source: "Paramètres > Comptes",
      ref: { kind: "app", id: "settings:account" },
      highlight: "17 caractères",
    });
  }, [section, addClue]);

  const accountLabel = accountLevel === "admin" ? "Administrateur" : accountLevel === "guest" ? "Invité (accès limité)" : "Session non vérifiée";

  return (
    <div className="flex h-full bg-[#1c1c1c] text-white">
      <nav className="w-56 border-r border-white/10 p-3 space-y-0.5 bg-[#202020]">
        <div className="flex items-center gap-3 px-2 py-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#0078d4] flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm truncate">{identityKnown ? "Bernard Dupuis" : "???"}</p>
            <p className="text-xs text-white/50 truncate">{accountLabel}</p>
          </div>
        </div>
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              playSound("click");
              setSection(id);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-left transition-colors ${
              section === id ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-semibold mb-5">{SECTIONS.find((s) => s.id === section)?.label}</h1>

        {section === "account" && (
          <div className="space-y-5 max-w-2xl">
            <Card title="Votre compte">
              <Row label="Utilisateur" value={identityKnown ? "Bernard Dupuis (BDupuis)" : "BDupuis"} />
              <Row label="Type de compte" value={accountLabel} />
              <Row label="Domaine" value="MAIRIE-BSM" />
            </Card>
            <Card title="Options de connexion" icon={ShieldCheck}>
              <Row label="Mot de passe modifié le" value={PASSWORD_POLICY_REPORT.changedOn} />
              <Row label="Longueur" value={`${PASSWORD_POLICY_REPORT.length} caractères`} />
              <Row label="Complexité" value={PASSWORD_POLICY_REPORT.details} />
            </Card>
            <Card title="Historique des connexions" icon={Clock}>
              <ul className="divide-y divide-white/5">
                {LOGIN_HISTORY.map((e) => (
                  <li key={e.date + e.event} className="flex items-center gap-3 py-2 text-sm">
                    {e.status === "ok" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : e.status === "fail" ? (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-[#4ea8ff] flex-shrink-0" />
                    )}
                    <span className="text-white/50 tabular-nums w-36 flex-shrink-0">{e.date}</span>
                    <span className="text-white/85">{e.event}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {section === "system" && (
          <div className="space-y-5 max-w-2xl">
            <Card title="Spécifications de l'appareil" icon={Cpu}>
              {SYSTEM_INFO.map((r) => (
                <Row key={r.label} label={r.label} value={r.value} />
              ))}
            </Card>
            <Card title="Alimentation">
              <Row label="Batterie" value={`${batteryLevel} % — sur batterie`} />
              <Row label="Mode d'alimentation" value="Équilibré" />
            </Card>
          </div>
        )}

        {section === "network" && (
          <div className="space-y-5 max-w-2xl">
            <Card title="État" icon={Globe}>
              <p className="text-sm text-emerald-400 mb-3">Vous êtes connecté à Internet</p>
              {NETWORK_INFO.map((r) => (
                <Row key={r.label} label={r.label} value={r.value} />
              ))}
            </Card>
          </div>
        )}

        {section === "personalization" && (
          <div className="max-w-3xl">
            <Card title="Arrière-plan" icon={Palette}>
              <WallpaperPicker />
            </Card>
          </div>
        )}

        {section === "updates" && (
          <div className="space-y-5 max-w-2xl">
            <Card title="AmnesiaOS Update" icon={RefreshCw}>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-white/80">
                  {checking === "checking"
                    ? "Recherche de mises à jour..."
                    : checking === "done"
                    ? "Votre appareil est à jour."
                    : "Dernière vérification : aujourd'hui, 08:42"}
                </p>
                <button
                  onClick={() => {
                    playSound("click");
                    setChecking("checking");
                    setTimeout(() => setChecking("done"), 1500);
                  }}
                  disabled={checking === "checking"}
                  className="px-4 py-1.5 rounded bg-[#0078d4] hover:bg-[#1084d8] text-sm disabled:opacity-60"
                >
                  Rechercher des mises à jour
                </button>
              </div>
            </Card>
            <Card title="Historique des mises à jour" icon={Clock}>
              <ul className="divide-y divide-white/5">
                {UPDATE_HISTORY.map((u) => (
                  <li key={u.id} className="py-2.5">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-white/90">{u.title}</span>
                      <span className="text-white/40 whitespace-nowrap">{u.date}</span>
                    </div>
                    <p className="text-xs text-white/50 mt-0.5">
                      {u.id} · {u.description}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon?: typeof User; children: React.ReactNode }) {
  return (
    <section className="rounded-lg bg-white/5 border border-white/10 p-4">
      <h2 className="flex items-center gap-2 text-sm font-medium text-white/90 mb-3">
        {Icon && <Icon className="w-4 h-4 text-white/60" />}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-white/50">{label}</span>
      <span className="text-white/85 text-right">{value}</span>
    </div>
  );
}
