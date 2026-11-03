"use client";

import { useEffect, useRef, useState } from "react";
import {
  Battery,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Bell,
  BellOff,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Volume2,
  VolumeX,
  Wifi,
  WifiHigh,
  WifiLow,
  WifiZero,
  Info,
} from "lucide-react";
import { useGame, type Notification } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { useGameClock, gameNow } from "@/lib/game-clock";
import { calendarEvents } from "@/lib/game-data";
import { MONTH_NAMES, monthGrid, parseEventDate } from "@/lib/calendar-utils";
import { WIFI_NETWORKS, type WifiNetwork } from "@/lib/data/networks";

type Panel = "hidden" | "wifi" | "volume" | "battery" | "clock" | null;

const SignalIcon = ({ signal, className }: { signal: WifiNetwork["signal"]; className?: string }) => {
  const Icon = signal >= 4 ? Wifi : signal === 3 ? WifiHigh : signal === 2 ? WifiLow : WifiZero;
  return <Icon className={className} />;
};

const notificationIcon = (icon: Notification["icon"]) => {
  switch (icon) {
    case "mail": return <Mail className="w-4 h-4 text-[#4ea8ff]" />;
    case "calendar": return <CalendarIcon className="w-4 h-4 text-red-400" />;
    case "security": return <Shield className="w-4 h-4 text-amber-400" />;
    case "antivirus": return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    default: return <Info className="w-4 h-4 text-white/60" />;
  }
};

export function SystemTray() {
  const time = useGameClock() ?? gameNow();
  const [panel, setPanel] = useState<Panel>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const {
    notificationHistory,
    unseenNotificationCount,
    markNotificationsSeen,
    clearNotificationHistory,
    batteryLevel,
    batteryCharging,
    openWindow,
    networkOnline,
    setNetworkOnline,
  } = useGame();
  const { playSound, volume, setVolume, isMuted, toggleMute } = useSound();

  // Wi-Fi
  // Réseau connecté : suit l'état du jeu (coupure Wi-Fi, déconnexion manuelle)
  const defaultSsid = WIFI_NETWORKS.find((n) => n.connected)?.ssid ?? null;
  const connected = networkOnline ? defaultSsid : null;
  const setConnected = (ssid: string | null) => setNetworkOnline(ssid !== null);
  const [wifiMessage, setWifiMessage] = useState<{ ssid: string; text: string } | null>(null);

  // Mini-calendrier
  const [calMonth, setCalMonth] = useState(() => ({ year: time.getFullYear(), month: time.getMonth() }));

  useEffect(() => {
    if (!panel) return;
    const onDown = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) setPanel(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [panel]);

  const toggle = (p: Exclude<Panel, null>) => {
    playSound("click");
    setWifiMessage(null);
    if (p === "clock") {
      setCalMonth({ year: time.getFullYear(), month: time.getMonth() });
      markNotificationsSeen();
    }
    setPanel(panel === p ? null : p);
  };

  const BatteryIcon =
    batteryLevel <= 10 ? BatteryWarning : batteryLevel <= 25 ? BatteryLow : batteryLevel <= 60 ? BatteryMedium : batteryLevel < 95 ? Battery : BatteryFull;
  const batteryMinutes = Math.round((batteryLevel / 100) * 260);

  const today = time;
  const eventDays = new Set(
    calendarEvents
      .map((e) => parseEventDate(e.date))
      .filter((d): d is NonNullable<typeof d> => !!d && d.year === calMonth.year && d.month === calMonth.month)
      .map((d) => d.day)
  );

  const popover = "absolute bottom-full mb-2 bg-[#202020]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl animate-fade-in";

  return (
    <div ref={trayRef} className="absolute right-2 flex items-center gap-0.5 text-white/70">
      {/* Icônes cachées */}
      <div className="relative">
        <button onClick={() => toggle("hidden")} className={`p-1.5 rounded transition-colors ${panel === "hidden" ? "bg-white/15" : "hover:bg-white/10"}`} aria-label="Afficher les icônes cachées">
          <ChevronUp className="w-4 h-4" />
        </button>
        {panel === "hidden" && (
          <div className={`${popover} right-0 w-60 p-2`}>
            <div className="flex items-center gap-3 px-2 py-2 rounded hover:bg-white/5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div className="text-xs">
                <p className="text-white">SecureShield Pro</p>
                <p className="text-white/50">Protection en temps réel active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 py-2 rounded hover:bg-white/5">
              <Lock className="w-5 h-5 text-[#4ea8ff]" />
              <div className="text-xs">
                <p className="text-white">VPN Mairie</p>
                <p className="text-white/50">Déconnecté · géré par le service IT</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wi-Fi */}
      <div className="relative">
        <button onClick={() => toggle("wifi")} className={`p-1.5 rounded transition-colors ${panel === "wifi" ? "bg-white/15" : "hover:bg-white/10"}`} aria-label="Réseaux Wi-Fi">
          {connected ? <Wifi className="w-4 h-4" /> : <WifiZero className="w-4 h-4 text-white/40" />}
        </button>
        {panel === "wifi" && (
          <div className={`${popover} right-0 w-80 p-3`}>
            <p className="text-white text-sm font-medium mb-2">Réseaux Wi-Fi</p>
            <div className="space-y-1">
              {WIFI_NETWORKS.map((n) => {
                const isConnected = connected === n.ssid;
                return (
                  <div key={n.ssid}>
                    <button
                      onClick={() => {
                        playSound("click");
                        setWifiMessage({ ssid: n.ssid, text: n.connectMessage });
                      }}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded text-left transition-colors ${isConnected ? "bg-[#0078d4]/25" : "hover:bg-white/10"}`}
                    >
                      <SignalIcon signal={n.signal} className="w-4 h-4 text-white/80" />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-white truncate">{n.ssid}</span>
                        <span className="block text-xs text-white/50">
                          {isConnected ? "Connecté, sécurisé" : n.secured ? "Sécurisé" : "Ouvert"}
                        </span>
                      </span>
                      {n.secured && <Lock className="w-3.5 h-3.5 text-white/40" />}
                    </button>
                    {wifiMessage?.ssid === n.ssid && (
                      <div className="mx-2 mb-1 px-3 py-2 rounded bg-white/5 text-xs text-white/70">
                        {wifiMessage.text}
                        {isConnected && (
                          <button
                            onClick={() => {
                              playSound("click");
                              setConnected(null);
                              setWifiMessage(null);
                            }}
                            className="block mt-2 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white"
                          >
                            Se déconnecter
                          </button>
                        )}
                        {!isConnected && n.ssid === "Mairie-BSM" && (
                          <button
                            onClick={() => {
                              playSound("click");
                              setConnected("Mairie-BSM");
                              setWifiMessage(null);
                            }}
                            className="block mt-2 px-2 py-1 rounded bg-[#0078d4] hover:bg-[#1084d8] text-white"
                          >
                            Se reconnecter (clé enregistrée)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Volume */}
      <div className="relative">
        <button onClick={() => toggle("volume")} className={`p-1.5 rounded transition-colors ${panel === "volume" ? "bg-white/15" : "hover:bg-white/10"}`} aria-label="Volume">
          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        {panel === "volume" && (
          <div className={`${popover} right-0 w-56 p-4`}>
            <p className="text-white text-xs mb-3">Volume du jeu</p>
            <div className="flex items-center gap-3">
              <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors" aria-label={isMuted ? "Rétablir le son" : "Couper le son"}>
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                onMouseUp={() => playSound("click")}
                aria-label="Volume"
                className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
              <span className="text-white/60 text-xs w-9 text-right tabular-nums">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Batterie */}
      <div className="relative">
        <button onClick={() => toggle("battery")} className={`flex items-center gap-1 p-1.5 rounded transition-colors ${panel === "battery" ? "bg-white/15" : "hover:bg-white/10"}`} aria-label="Batterie">
          <BatteryIcon className={`w-4 h-4 ${batteryLevel <= 20 ? "text-red-400" : ""}`} />
          <span className="text-[11px] tabular-nums">{batteryLevel}%</span>
        </button>
        {panel === "battery" && (
          <div className={`${popover} right-0 w-60 p-4`}>
            <div className="flex items-center gap-3">
              <BatteryIcon className={`w-8 h-8 ${batteryLevel <= 20 ? "text-red-400" : "text-white"}`} />
              <div>
                <p className="text-white text-lg font-semibold tabular-nums">{batteryLevel} %</p>
                <p className="text-white/50 text-xs">
                  {batteryCharging
                    ? "Branché · en charge"
                    : `Sur batterie · environ ${Math.floor(batteryMinutes / 60)} h ${String(batteryMinutes % 60).padStart(2, "0")} restantes`}
                </p>
              </div>
            </div>
            <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full ${batteryLevel <= 20 ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${batteryLevel}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Horloge : centre de notifications + mini-calendrier */}
      <div className="relative">
        <button
          onClick={() => toggle("clock")}
          className={`relative flex flex-col items-end px-2 py-0.5 rounded transition-colors text-xs ${panel === "clock" ? "bg-white/15" : "hover:bg-white/10"}`}
          aria-label="Notifications et calendrier"
        >
          <span>{time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
          <span className="text-white/50">{time.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
          {unseenNotificationCount > 0 && panel !== "clock" && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#0078d4] text-[10px] leading-4 text-white text-center">
              {unseenNotificationCount}
            </span>
          )}
        </button>

        {panel === "clock" && (
          <div className={`${popover} right-0 w-80 overflow-hidden`}>
            {/* Notifications */}
            <div className="p-3 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-sm font-medium flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Notifications
                </p>
                {notificationHistory.length > 0 && (
                  <button onClick={clearNotificationHistory} className="text-xs text-white/50 hover:text-white">
                    Tout effacer
                  </button>
                )}
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1.5">
                {notificationHistory.length === 0 ? (
                  <p className="flex flex-col items-center gap-2 py-6 text-white/40 text-xs">
                    <BellOff className="w-6 h-6" />
                    Aucune notification
                  </p>
                ) : (
                  notificationHistory.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (n.icon === "mail") openWindow("mail");
                        else if (n.icon === "calendar") openWindow("calendar");
                        else return;
                        playSound("open");
                        setPanel(null);
                      }}
                      className="w-full flex gap-3 p-2 rounded bg-white/5 hover:bg-white/10 text-left transition-colors"
                    >
                      <span className="mt-0.5">{notificationIcon(n.icon)}</span>
                      <span className="flex-1 min-w-0">
                        <span className="flex justify-between gap-2">
                          <span className="text-xs text-white font-medium truncate">{n.title}</span>
                          <span className="text-[10px] text-white/40 flex-shrink-0">
                            {n.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </span>
                        <span className="block text-xs text-white/60">{n.message}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Mini-calendrier */}
            <div className="p-3">
              <p className="text-white/80 text-sm capitalize mb-2">
                {today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">{MONTH_NAMES[calMonth.month]} {calMonth.year}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCalMonth(({ year, month }) => (month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }))}
                    className="p-1 rounded hover:bg-white/10"
                    aria-label="Mois précédent"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCalMonth(({ year, month }) => (month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }))}
                    className="p-1 rounded hover:bg-white/10"
                    aria-label="Mois suivant"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
                {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                  <span key={i} className="py-1 text-white/40">{d}</span>
                ))}
                {monthGrid(calMonth.year, calMonth.month).map((day, i) => {
                  const isToday =
                    day === today.getDate() && calMonth.month === today.getMonth() && calMonth.year === today.getFullYear();
                  return (
                    <span
                      key={i}
                      className={`relative py-1.5 rounded ${
                        isToday ? "bg-[#0078d4] text-white font-semibold" : day ? "text-white/80" : ""
                      }`}
                    >
                      {day ?? ""}
                      {day && eventDays.has(day) && (
                        <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isToday ? "bg-white" : "bg-amber-400"}`} />
                      )}
                    </span>
                  );
                })}
              </div>
              <button
                onClick={() => {
                  playSound("open");
                  openWindow("calendar");
                  setPanel(null);
                }}
                className="mt-3 w-full text-xs text-[#4ea8ff] hover:underline"
              >
                Ouvrir le Calendrier
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
