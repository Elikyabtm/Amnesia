"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, AlertTriangle, X, Loader2, RefreshCw, Wifi, WifiOff, Battery, BatteryWarning } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

type EventType = "antivirus" | "freeze" | "update" | "wifi" | "battery";

interface RandomEvent {
  type: EventType;
  duration: number;
}

const EVENT_INTERVAL_MIN = 30000; // 30 seconds
const EVENT_INTERVAL_MAX = 60000; // 60 seconds

export function RandomEvents() {
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [freezeCountdown, setFreezeCountdown] = useState(0);
  const { gamePhase, addNotification, closeWindow, windows } = useGame();
  const { playSound } = useSound();

  const triggerEvent = useCallback(() => {
    const events: EventType[] = ["antivirus", "freeze", "update", "wifi", "battery"];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    const durations: Record<EventType, number> = {
      antivirus: 8000,
      freeze: 5000,
      update: 6000,
      wifi: 4000,
      battery: 5000,
    };

    setCurrentEvent({ type: randomEvent, duration: durations[randomEvent] });
    playSound("notification");

    // Handle specific event logic
    if (randomEvent === "antivirus") {
      setScanProgress(0);
      // Close a random window sometimes
      if (Math.random() > 0.6 && windows.length > 0) {
        const randomWindow = windows[Math.floor(Math.random() * windows.length)];
        setTimeout(() => {
          closeWindow(randomWindow.id);
          addNotification({
            title: "SecureShield Pro",
            message: `Application "${randomWindow.title}" fermée pour analyse de sécurité`,
            icon: "antivirus",
          });
        }, 3000);
      }
    } else if (randomEvent === "freeze") {
      setFreezeCountdown(5);
    }
  }, [windows, closeWindow, addNotification, playSound]);

  // Schedule random events
  useEffect(() => {
    if (gamePhase !== "exploring") return;

    const scheduleNextEvent = () => {
      const delay = EVENT_INTERVAL_MIN + Math.random() * (EVENT_INTERVAL_MAX - EVENT_INTERVAL_MIN);
      return setTimeout(() => {
        triggerEvent();
        scheduleNextEvent();
      }, delay);
    };

    // Start with a delay
    const initialTimeout = setTimeout(() => {
      triggerEvent();
    }, 15000);

    const recurringTimeout = scheduleNextEvent();

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(recurringTimeout);
    };
  }, [gamePhase, triggerEvent]);

  // Handle event duration
  useEffect(() => {
    if (!currentEvent) return;

    const timeout = setTimeout(() => {
      setCurrentEvent(null);
      setScanProgress(0);
      setFreezeCountdown(0);
    }, currentEvent.duration);

    return () => clearTimeout(timeout);
  }, [currentEvent]);

  // Animate scan progress
  useEffect(() => {
    if (currentEvent?.type !== "antivirus") return;

    const interval = setInterval(() => {
      setScanProgress((p) => Math.min(p + 2, 100));
    }, 150);

    return () => clearInterval(interval);
  }, [currentEvent?.type]);

  // Animate freeze countdown
  useEffect(() => {
    if (currentEvent?.type !== "freeze" || freezeCountdown <= 0) return;

    const interval = setInterval(() => {
      setFreezeCountdown((c) => c - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentEvent?.type, freezeCountdown]);

  const dismissEvent = () => {
    setCurrentEvent(null);
    setScanProgress(0);
    setFreezeCountdown(0);
  };

  if (!currentEvent) return null;

  // Freeze overlay
  if (currentEvent.type === "freeze") {
    return (
      <div className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-[#1a1a2e] border border-blue-500/30 rounded-lg p-8 max-w-md text-center animate-fade-in">
          <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Système en pause</h2>
          <p className="text-white/60 mb-4">
            Windows effectue des opérations de maintenance...
          </p>
          <div className="text-4xl font-bold text-blue-400 mb-2">
            {freezeCountdown}
          </div>
          <p className="text-xs text-white/40">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  // Antivirus popup
  if (currentEvent.type === "antivirus") {
    return (
      <div className="fixed bottom-20 right-4 z-[4000] animate-slide-in-up">
        <div className="bg-[#1a2332] border border-green-500/30 rounded-lg shadow-2xl w-80 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-white" />
              <span className="font-semibold text-white text-sm">SecureShield Pro</span>
            </div>
            <button
              onClick={dismissEvent}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
              <div>
                <p className="text-white text-sm font-medium">Analyse en cours...</p>
                <p className="text-white/50 text-xs">Vérification des fichiers système</p>
              </div>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-150"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/50">
              <span>C:\Users\BDupuis\...</span>
              <span>{scanProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Update notification
  if (currentEvent.type === "update") {
    return (
      <div className="fixed bottom-20 right-4 z-[4000] animate-slide-in-up">
        <div className="bg-[#2d2d2d]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl p-4 w-80">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Mise à jour disponible</p>
              <p className="text-white/60 text-xs mt-1">
                Windows souhaite redémarrer pour installer les mises à jour.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={dismissEvent}
                  className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  Plus tard
                </button>
                <button
                  onClick={dismissEvent}
                  className="px-3 py-1.5 bg-white/10 text-white/70 text-xs rounded hover:bg-white/20 transition-colors"
                >
                  Me rappeler
                </button>
              </div>
            </div>
            <button
              onClick={dismissEvent}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // WiFi issue
  if (currentEvent.type === "wifi") {
    return (
      <div className="fixed bottom-20 right-4 z-[4000] animate-slide-in-up">
        <div className="bg-[#2d2d2d]/95 backdrop-blur-md border border-amber-500/30 rounded-lg shadow-2xl p-4 w-80">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <WifiOff className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Connexion instable</p>
              <p className="text-white/60 text-xs mt-1">
                La connexion réseau est intermittente. Certaines fonctionnalités peuvent être limitées.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Wifi className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs text-amber-400">Reconnexion en cours...</span>
              </div>
            </div>
            <button
              onClick={dismissEvent}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Battery warning
  if (currentEvent.type === "battery") {
    return (
      <div className="fixed bottom-20 right-4 z-[4000] animate-slide-in-up">
        <div className="bg-[#2d2d2d]/95 backdrop-blur-md border border-red-500/30 rounded-lg shadow-2xl p-4 w-80">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <BatteryWarning className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Batterie faible</p>
              <p className="text-white/60 text-xs mt-1">
                Il reste 15% de batterie. Branchez votre ordinateur pour éviter une coupure.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[15%] bg-red-500" />
                </div>
                <span className="text-xs text-red-400">15%</span>
              </div>
            </div>
            <button
              onClick={dismissEvent}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
