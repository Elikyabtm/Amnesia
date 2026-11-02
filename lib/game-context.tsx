"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { SUSPICION_THRESHOLDS, mails, secretMails, type FileItem } from "./game-data";
import { gameNow, birthdayCountdownText } from "./game-clock";
import { verifyPassword, verifyPin, type PasswordVerdict, type PasswordPart } from "./verify-client";

export type AppType = "explorer" | "mail" | "photos" | "notepad" | "calendar" | "trash" | "password" | "browser" | "clues" | "audio";

export interface WindowState {
  id: string;
  app: AppType;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  prevPosition?: { x: number; y: number };
  prevSize?: { width: number; height: number };
  content?: FileItem | string;
}

export interface ClueItem {
  id: string;
  category: "identity" | "date" | "place" | "password";
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
  tryPassword: (password: string) => Promise<PasswordVerdict>;
  revealedPassword: { password: string; parts: PasswordPart[] } | null;
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
  tryUnlockItem: (itemId: string, pin: string) => Promise<boolean>;
  isItemLocked: (itemId: string) => boolean;
  addSuspicion: (event: SuspicionEvent) => void;
  discoverSecret: (secretId: string) => void;
  readMailIds: string[];
  markMailRead: (mailId: string) => void;
  startTime: number | null;
  endTime: number | null;
  lockoutRemaining: number;
}

let notifSeq = 0;
const notifId = () => `notif-${Date.now()}-${++notifSeq}`;

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gamePhase, setGamePhase] = useState<"title" | "intro" | "booting" | "exploring" | "won">("title");
  const [loginError, setLoginError] = useState(false);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(100);
  const [windowCounter, setWindowCounter] = useState(0);
  const [clues, setClues] = useState<ClueItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const clueCounterRef = useRef(0);
  const [readMailIds, setReadMailIds] = useState<string[]>([]);
  const [revealedPassword, setRevealedPassword] = useState<{ password: string; parts: PasswordPart[] } | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [lockedItems, setLockedItems] = useState<LockedItem[]>([
    {
      id: "confidential",
      name: "Dossier Confidentiel",
      hint: "L'année où j'ai été élu maire",
      unlocked: false,
    },
  ]);
  const [accountLevel, setAccountLevel] = useState<AccountLevel>("locked");
  const [suspicionLevel, setSuspicionLevel] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [secretsDiscovered, setSecretsDiscovered] = useState<string[]>([]);
  const lastActionTimeRef = useRef<number>(0);
  const suspicionRef = useRef(0);

  const LOCKOUT_SECONDS = 10;

  // Keep a ref in sync so callbacks always see the latest suspicion level
  useEffect(() => {
    suspicionRef.current = suspicionLevel;
  }, [suspicionLevel]);

  // Lockout countdown: one timer, cleaned up properly
  useEffect(() => {
    if (!isLockedOut) return;
    setLockoutRemaining(LOCKOUT_SECONDS);
    const interval = setInterval(() => {
      setLockoutRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          setIsLockedOut(false);
          setSuspicionLevel(SUSPICION_THRESHOLDS.DANGER - 10);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isLockedOut]);

  // Suspicion slowly decays when the player is calm
  useEffect(() => {
    if (gamePhase !== "exploring" || isLockedOut) return;
    const interval = setInterval(() => {
      if (Date.now() - lastActionTimeRef.current > 15000) {
        setSuspicionLevel((s) => Math.max(0, s - 2));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [gamePhase, isLockedOut]);

  const raiseSuspicion = useCallback((amount: number) => {
    const current = suspicionRef.current;
    const newLevel = Math.min(100, current + amount);
    suspicionRef.current = newLevel;
    setSuspicionLevel(newLevel);

    if (current < SUSPICION_THRESHOLDS.WARNING && newLevel >= SUSPICION_THRESHOLDS.WARNING && newLevel < SUSPICION_THRESHOLDS.LOCKOUT) {
      setNotifications((n) => [{
        id: notifId(),
        title: "Alerte Sécurité",
        message: "Activité suspecte détectée. Ralentissez vos recherches.",
        icon: "security",
        timestamp: gameNow(),
      }, ...n]);
    }
    if (newLevel >= SUSPICION_THRESHOLDS.LOCKOUT) {
      setIsLockedOut(true);
    }
  }, []);

  const startGame = useCallback(() => {
    setGamePhase("intro");
  }, []);

  const enterDesktop = useCallback(() => {
    setGamePhase("booting");
  }, []);

  const finishBooting = useCallback(() => {
    setGamePhase("exploring");
    setStartTime(Date.now());
    // Add initial notifications after a delay
    setTimeout(() => {
      setNotifications([
        {
          id: "notif-1",
          title: "Nouveaux messages",
          message: `Vous avez ${mails.length} emails non lus`,
          icon: "mail",
          timestamp: gameNow(),
        },
        {
          id: "notif-2", 
          title: "Rappel",
          message: birthdayCountdownText(),
          icon: "calendar",
          timestamp: gameNow(),
        },
      ]);
    }, 2000);
  }, []);

  const tryPassword = useCallback(async (rawPassword: string): Promise<PasswordVerdict> => {
    setPasswordAttempts((a) => a + 1);
    lastActionTimeRef.current = Date.now();

    let verdict: PasswordVerdict;
    try {
      verdict = await verifyPassword(rawPassword);
    } catch {
      // Network/server error: don't penalise the player
      return { result: "wrong" };
    }

    if (verdict.result === "admin") {
      setAccountLevel("admin");
      if (verdict.password && verdict.parts) {
        setRevealedPassword({ password: verdict.password, parts: verdict.parts });
      }
      setEndTime(Date.now());
      setGamePhase("won");
      return verdict;
    }

    if (verdict.result === "guest") {
      if (accountLevel !== "locked") return verdict;
      setAccountLevel("guest");
      setNotifications((current) => [
        {
          id: notifId(),
          title: "Courrier synchronisé",
          message: `${secretMails.length} nouveaux messages importants dans votre boîte de réception.`,
          icon: "mail",
          timestamp: gameNow(),
        },
        {
          id: notifId(),
          title: "Compte Invité",
          message: "Accès limité. Certains fichiers restent verrouillés.",
          icon: "security",
          timestamp: gameNow(),
        },
        ...current,
      ]);
      return verdict;
    }

    raiseSuspicion(10);
    setLoginError(true);
    setTimeout(() => setLoginError(false), 500);
    return verdict;
  }, [accountLevel, raiseSuspicion]);

  const addClue = useCallback((clue: Omit<ClueItem, "id" | "discoveredAt">) => {
    setClues((current) => {
      if (current.some((c) => c.text === clue.text)) return current;
      clueCounterRef.current += 1;
      return [
        ...current,
        { ...clue, id: `clue-${clueCounterRef.current}`, discoveredAt: gameNow() },
      ];
    });
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotif: Notification = {
      ...notification,
      id: notifId(),
      timestamp: gameNow(),
    };
    setNotifications((current) => [newNotif, ...current]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((current) => current.filter((n) => n.id !== id));
  }, []);

  const tryUnlockItem = useCallback(async (itemId: string, pin: string): Promise<boolean> => {
    if (!lockedItems.some((i) => i.id === itemId)) return false;

    let ok = false;
    try {
      ok = await verifyPin(itemId, pin);
    } catch {
      return false;
    }

    if (ok) {
      setLockedItems((current) =>
        current.map((i) => (i.id === itemId ? { ...i, unlocked: true } : i))
      );
      return true;
    }
    raiseSuspicion(8);
    return false;
  }, [lockedItems, raiseSuspicion]);

  const isItemLocked = useCallback((itemId: string): boolean => {
    const item = lockedItems.find((i) => i.id === itemId);
    return item ? !item.unlocked : false;
  }, [lockedItems]);

  const addSuspicion = useCallback((event: SuspicionEvent) => {
    const now = Date.now();
    // Rapid actions (less than 2 seconds apart) increase suspicion more
    const multiplier = now - lastActionTimeRef.current < 2000 ? 1.5 : 1;
    lastActionTimeRef.current = now;
    raiseSuspicion(Math.round(event.amount * multiplier));
  }, [raiseSuspicion]);

  const markMailRead = useCallback((mailId: string) => {
    setReadMailIds((current) => (current.includes(mailId) ? current : [...current, mailId]));
  }, []);

  const discoverSecret = useCallback((secretId: string) => {
    setSecretsDiscovered((current) => {
      if (current.includes(secretId)) return current;
      return [...current, secretId];
    });
  }, []);

  const openWindow = useCallback((app: AppType, title?: string, content?: FileItem | string) => {
    const id = `window-${windowCounter}`;
    setWindowCounter((c) => c + 1);

    const defaultTitles: Record<AppType, string> = {
      explorer: "Explorateur de fichiers",
      mail: "Courrier",
      photos: "Photos",
      notepad: "Bloc-notes",
      calendar: "Calendrier",
      trash: "Corbeille",
      password: "Déverrouiller",
      browser: "Navigateur",
      clues: "Carnet d'indices",
      audio: "Lecteur audio",
    };

    const offset = (windows.length % 5) * 30;
    
    const newWindow: WindowState = {
      id,
      app,
      title: title || defaultTitles[app],
      isMinimized: false,
      isMaximized: false,
      zIndex: maxZIndex + 1,
      position: { x: 100 + offset, y: 50 + offset },
      size: { width: 800, height: 550 },
      content,
    };

    setMaxZIndex((z) => z + 1);
    setWindows((w) => [...w, newWindow]);
    setActiveWindowId(id);
  }, [windows.length, maxZIndex, windowCounter]);

  const closeWindow = useCallback((id: string) => {
    setWindows((w) => w.filter((win) => win.id !== id));
    setActiveWindowId((current) => (current === id ? null : current));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((w) =>
      w.map((win) => (win.id === id ? { ...win, isMinimized: true } : win))
    );
    setActiveWindowId((current) => (current === id ? null : current));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows((w) =>
      w.map((win) => {
        if (win.id !== id) return win;
        if (win.isMaximized) {
          // Restore to previous size
          return {
            ...win,
            isMaximized: false,
            position: win.prevPosition || { x: 100, y: 50 },
            size: win.prevSize || { width: 800, height: 550 },
          };
        } else {
          // Maximize
          return {
            ...win,
            isMaximized: true,
            prevPosition: win.position,
            prevSize: win.size,
            position: { x: 0, y: 0 },
            size: { width: window.innerWidth, height: window.innerHeight - 48 },
          };
        }
      })
    );
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows((w) =>
      w.map((win) =>
        win.id === id ? { ...win, isMinimized: false, zIndex: maxZIndex + 1 } : win
      )
    );
    setMaxZIndex((z) => z + 1);
    setActiveWindowId(id);
  }, [maxZIndex]);

  const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
    setWindows((w) =>
      w.map((win) => (win.id === id ? { ...win, size, isMaximized: false } : win))
    );
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows((w) =>
      w.map((win) => (win.id === id ? { ...win, zIndex: maxZIndex + 1 } : win))
    );
    setMaxZIndex((z) => z + 1);
    setActiveWindowId(id);
  }, [maxZIndex]);

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows((w) =>
      w.map((win) => (win.id === id ? { ...win, position } : win))
    );
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
        revealedPassword,
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
        readMailIds,
        markMailRead,
        startTime,
        endTime,
        lockoutRemaining,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
