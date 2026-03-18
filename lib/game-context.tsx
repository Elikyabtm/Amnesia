"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { SUSPICION_THRESHOLDS, type FileItem } from "./game-data";
import type { Scenario } from "./scenarios/types";

const DEFAULT_GUEST_PASSWORD = "Bourg1832";
const DEFAULT_ADMIN_PASSWORD = "BSM1832#14041967!";
const DEFAULT_TRASH_PIN = "3991";
const DEFAULT_CONFIDENTIAL_PIN = "2015";

export type AppType = "files" | "mail" | "photos" | "browser" | "notes" | "password" | "audio" | "clues" | "trash" | "calendar";

export interface WindowState {
  id: string;
  app: AppType;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content?: FileItem | string;
}

export interface ClueItem {
  id: string;
  category: "identity" | "date" | "place" | "password" | "secret";
  text: string;
  source: string;
  discoveredAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  icon: "mail" | "calendar" | "system" | "security" | "antivirus";
  timestamp: Date;
}

export interface LockedItem {
  id: string;
  name: string;
  pin: string;
  hint: string;
  unlocked: boolean;
}

export type AccountLevel = "locked" | "guest" | "admin";

export interface SuspicionEvent {
  type: "password_fail" | "rapid_search" | "sensitive_file" | "repeated_access";
  amount: number;
  message: string;
}

interface GameContextType {
  gamePhase: "title" | "intro" | "booting" | "exploring" | "won";
  loginError: boolean;
  windows: WindowState[];
  activeWindowId: string | null;
  maxZIndex: number;
  clues: ClueItem[];
  notifications: Notification[];
  passwordAttempts: number;
  lockedItems: LockedItem[];
  accountLevel: AccountLevel;
  suspicionLevel: number;
  isLockedOut: boolean;
  secretsDiscovered: string[];
  startGame: () => void;
  enterDesktop: () => void;
  finishBooting: () => void;
  tryPassword: (password: string) => "wrong" | "guest" | "admin";
  openWindow: (app: AppType, title?: string, content?: FileItem | string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  restoreWindow: (id: string) => void;
  addClue: (clue: Omit<ClueItem, "id" | "discoveredAt">) => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void;
  dismissNotification: (id: string) => void;
  tryUnlockItem: (itemId: string, pin: string) => boolean;
  isItemLocked: (itemId: string) => boolean;
  addSuspicion: (event: SuspicionEvent) => void;
  discoverSecret: (secretId: string) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

interface GameProviderProps {
  children: ReactNode;
  scenario?: Scenario;
}

export function GameProvider({ children, scenario }: GameProviderProps) {
  const guestPassword = scenario?.passwords?.guest || DEFAULT_GUEST_PASSWORD;
  const adminPassword = scenario?.passwords?.admin || DEFAULT_ADMIN_PASSWORD;

  const [gamePhase, setGamePhase] = useState<"title" | "intro" | "booting" | "exploring" | "won">("title");
  const [loginError, setLoginError] = useState(false);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(100);
  const [windowCounter, setWindowCounter] = useState(0);
  const [clues, setClues] = useState<ClueItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [clueCounter, setClueCounter] = useState(0);
  const [lockedItems, setLockedItems] = useState<LockedItem[]>([
    {
      id: "trash",
      name: "Corbeille",
      pin: scenario?.pins?.trash || DEFAULT_TRASH_PIN,
      hint: scenario?.pins?.trashHint || "Année du mariage, mais à l'envers...",
      unlocked: false,
    },
    {
      id: "confidential",
      name: "Dossier Confidentiel",
      pin: scenario?.pins?.confidential || DEFAULT_CONFIDENTIAL_PIN,
      hint: scenario?.pins?.confidentialHint || "L'année où j'ai été élu maire",
      unlocked: false,
    },
  ]);
  const [accountLevel, setAccountLevel] = useState<AccountLevel>("locked");
  const [suspicionLevel, setSuspicionLevel] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [secretsDiscovered, setSecretsDiscovered] = useState<string[]>([]);
  const [lastActionTime, setLastActionTime] = useState<number>(Date.now());

  const startGame = useCallback(() => {
    setGamePhase("intro");
  }, []);

  const enterDesktop = useCallback(() => {
    setGamePhase("booting");
  }, []);

  const finishBooting = useCallback(() => {
    setGamePhase("exploring");
    setTimeout(() => {
      setNotifications([
        {
          id: "welcome",
          title: "Bienvenue",
          message: "Explorez vos fichiers pour retrouver votre identité.",
          icon: "system",
          timestamp: new Date(),
        },
      ]);
    }, 2000);
  }, []);

  const tryPassword = useCallback(
    (password: string): "wrong" | "guest" | "admin" => {
      setPasswordAttempts((a) => a + 1);

      if (password === adminPassword) {
        setAccountLevel("admin");
        setGamePhase("won");
        return "admin";
      }

      if (password === guestPassword && accountLevel === "locked") {
        setAccountLevel("guest");
        setNotifications((current) => [
          {
            id: `notif-${Date.now()}`,
            title: "Compte Invité",
            message: "Accès limité. Certains fichiers restent verrouillés.",
            icon: "security",
            timestamp: new Date(),
          },
          ...current,
        ]);
        return "guest";
      }

      setSuspicionLevel((s) => Math.min(100, s + 10));
      setLoginError(true);
      setTimeout(() => setLoginError(false), 500);

      if (suspicionLevel + 10 >= SUSPICION_THRESHOLDS.LOCKOUT) {
        setIsLockedOut(true);
        setTimeout(() => {
          setIsLockedOut(false);
          setSuspicionLevel(SUSPICION_THRESHOLDS.DANGER);
        }, 10000);
      }

      return "wrong";
    },
    [accountLevel, suspicionLevel, guestPassword, adminPassword]
  );

  const openWindow = useCallback(
    (app: AppType, title?: string, content?: FileItem | string) => {
      const defaultTitles: Record<AppType, string> = {
        files: "Explorateur de fichiers",
        mail: "Messagerie",
        photos: "Photos",
        browser: "Navigateur",
        notes: "Notes",
        password: "Déverrouiller",
        audio: "Mémos vocaux",
        clues: "Carnet d'indices",
        trash: "Corbeille",
        calendar: "Calendrier",
      };

      const newWindow: WindowState = {
        id: `window-${windowCounter}`,
        app,
        title: title || defaultTitles[app],
        isMinimized: false,
        isMaximized: false,
        zIndex: maxZIndex + 1,
        position: { x: 100 + windowCounter * 30, y: 80 + windowCounter * 30 },
        size: { width: 800, height: 600 },
        content,
      };

      setWindows((current) => [...current, newWindow]);
      setActiveWindowId(newWindow.id);
      setMaxZIndex((z) => z + 1);
      setWindowCounter((c) => c + 1);
    },
    [windowCounter, maxZIndex]
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((current) => current.filter((w) => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((current) => current.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows((current) => current.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)));
  }, []);

  const focusWindow = useCallback(
    (id: string) => {
      setWindows((current) =>
        current.map((w) => (w.id === id ? { ...w, zIndex: maxZIndex + 1, isMinimized: false } : w))
      );
      setActiveWindowId(id);
      setMaxZIndex((z) => z + 1);
    },
    [maxZIndex]
  );

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows((current) => current.map((w) => (w.id === id ? { ...w, position } : w)));
  }, []);

  const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
    setWindows((current) => current.map((w) => (w.id === id ? { ...w, size } : w)));
  }, []);

  const restoreWindow = useCallback(
    (id: string) => {
      setWindows((current) =>
        current.map((w) => (w.id === id ? { ...w, isMinimized: false, zIndex: maxZIndex + 1 } : w))
      );
      setActiveWindowId(id);
      setMaxZIndex((z) => z + 1);
    },
    [maxZIndex]
  );

  const addClue = useCallback((clue: Omit<ClueItem, "id" | "discoveredAt">) => {
    setClues((current) => {
      const exists = current.some((c) => c.text === clue.text);
      if (exists) return current;

      const newClue: ClueItem = {
        ...clue,
        id: `clue-${clueCounter}`,
        discoveredAt: new Date(),
      };
      setClueCounter((c) => c + 1);
      return [...current, newClue];
    });
  }, [clueCounter]);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
    };
    setNotifications((current) => [newNotification, ...current]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((current) => current.filter((n) => n.id !== id));
  }, []);

  const tryUnlockItem = useCallback(
    (itemId: string, pin: string): boolean => {
      const item = lockedItems.find((i) => i.id === itemId);
      if (!item) return false;

      if (pin === item.pin) {
        setLockedItems((current) => current.map((i) => (i.id === itemId ? { ...i, unlocked: true } : i)));
        return true;
      }
      return false;
    },
    [lockedItems]
  );

  const isItemLocked = useCallback(
    (itemId: string): boolean => {
      const item = lockedItems.find((i) => i.id === itemId);
      return item ? !item.unlocked : false;
    },
    [lockedItems]
  );

  const addSuspicion = useCallback(
    (event: SuspicionEvent) => {
      const now = Date.now();
      const timeSinceLastAction = now - lastActionTime;
      const multiplier = timeSinceLastAction < 2000 ? 1.5 : 1;
      const amount = Math.round(event.amount * multiplier);

      setSuspicionLevel((s) => {
        const newLevel = Math.min(100, s + amount);

        if (s < SUSPICION_THRESHOLDS.WARNING && newLevel >= SUSPICION_THRESHOLDS.WARNING) {
          setNotifications((current) => [
            {
              id: `notif-${Date.now()}`,
              title: "Alerte Sécurité",
              message: "Activité suspecte détectée. Ralentissez vos recherches.",
              icon: "security",
              timestamp: new Date(),
            },
            ...current,
          ]);
        }

        if (newLevel >= SUSPICION_THRESHOLDS.LOCKOUT) {
          setIsLockedOut(true);
          setTimeout(() => {
            setIsLockedOut(false);
            setSuspicionLevel(SUSPICION_THRESHOLDS.DANGER);
          }, 10000);
        }

        return newLevel;
      });

      setLastActionTime(now);
    },
    [lastActionTime]
  );

  const discoverSecret = useCallback((secretId: string) => {
    setSecretsDiscovered((current) => {
      if (current.includes(secretId)) return current;
      return [...current, secretId];
    });
  }, []);

  return (
    <GameContext.Provider
      value={{
        gamePhase,
        loginError,
        windows,
        activeWindowId,
        maxZIndex,
        clues,
        notifications,
        passwordAttempts,
        lockedItems,
        accountLevel,
        suspicionLevel,
        isLockedOut,
        secretsDiscovered,
        startGame,
        enterDesktop,
        finishBooting,
        tryPassword,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        updateWindowPosition,
        updateWindowSize,
        restoreWindow,
        addClue,
        addNotification,
        dismissNotification,
        tryUnlockItem,
        isItemLocked,
        addSuspicion,
        discoverSecret,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
