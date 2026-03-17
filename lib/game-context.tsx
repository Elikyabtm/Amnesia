"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { GUEST_PASSWORD, ADMIN_PASSWORD, TRASH_PIN, CONFIDENTIAL_PIN, SUSPICION_THRESHOLDS, type FileItem } from "./game-data";

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
  const [clueCounter, setClueCounter] = useState(0);
  const [lockedItems, setLockedItems] = useState<LockedItem[]>([
    {
      id: "trash",
      name: "Corbeille",
      pin: TRASH_PIN,
      hint: "Année du mariage, mais à l'envers...",
      unlocked: false,
    },
    {
      id: "confidential",
      name: "Dossier Confidentiel",
      pin: CONFIDENTIAL_PIN,
      hint: "L'année où j'ai été élu maire",
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
    // Add initial notifications after a delay
    setTimeout(() => {
      setNotifications([
        {
          id: "notif-1",
          title: "Nouveaux messages",
          message: "Vous avez 4 emails non lus",
          icon: "mail",
          timestamp: new Date(),
        },
        {
          id: "notif-2", 
          title: "Rappel",
          message: "Anniversaire dans 2 mois",
          icon: "calendar",
          timestamp: new Date(),
        },
      ]);
    }, 2000);
  }, []);

  const tryPassword = useCallback((password: string): "wrong" | "guest" | "admin" => {
    setPasswordAttempts((a) => a + 1);
    
    // Check admin password first
    if (password === ADMIN_PASSWORD) {
      setAccountLevel("admin");
      setGamePhase("won");
      return "admin";
    }
    
    // Check guest password (only if not already guest or admin)
    if (password === GUEST_PASSWORD && accountLevel === "locked") {
      setAccountLevel("guest");
      // Unlock some basic files but not the secret ones
      setNotifications((current) => [{
        id: `notif-${Date.now()}`,
        title: "Compte Invite",
        message: "Acces limite. Certains fichiers restent verrouilles.",
        icon: "security",
        timestamp: new Date(),
      }, ...current]);
      return "guest";
    }
    
    // Wrong password - add suspicion
    setSuspicionLevel((s) => Math.min(100, s + 10));
    setLoginError(true);
    setTimeout(() => setLoginError(false), 500);
    
    // Check for lockout
    if (suspicionLevel + 10 >= SUSPICION_THRESHOLDS.LOCKOUT) {
      setIsLockedOut(true);
      setTimeout(() => {
        setIsLockedOut(false);
        setSuspicionLevel(SUSPICION_THRESHOLDS.DANGER);
      }, 10000); // 10 second lockout
    }
    
    return "wrong";
  }, [accountLevel, suspicionLevel]);

  const addClue = useCallback((clue: Omit<ClueItem, "id" | "discoveredAt">) => {
    setClues((current) => {
      // Don't add duplicate clues
      if (current.some((c) => c.text === clue.text)) return current;
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
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
    };
    setNotifications((current) => [newNotif, ...current]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((current) => current.filter((n) => n.id !== id));
  }, []);

  const tryUnlockItem = useCallback((itemId: string, pin: string): boolean => {
    const item = lockedItems.find((i) => i.id === itemId);
    if (!item) return false;
    
    if (pin === item.pin) {
      setLockedItems((current) =>
        current.map((i) => (i.id === itemId ? { ...i, unlocked: true } : i))
      );
      return true;
    }
    return false;
  }, [lockedItems]);

  const isItemLocked = useCallback((itemId: string): boolean => {
    const item = lockedItems.find((i) => i.id === itemId);
    return item ? !item.unlocked : false;
  }, [lockedItems]);

  const addSuspicion = useCallback((event: SuspicionEvent) => {
    const now = Date.now();
    const timeSinceLastAction = now - lastActionTime;
    
    // Rapid actions (less than 2 seconds) increase suspicion more
    const multiplier = timeSinceLastAction < 2000 ? 1.5 : 1;
    const amount = Math.round(event.amount * multiplier);
    
    setSuspicionLevel((s) => {
      const newLevel = Math.min(100, s + amount);
      
      // Trigger warnings at thresholds
      if (s < SUSPICION_THRESHOLDS.WARNING && newLevel >= SUSPICION_THRESHOLDS.WARNING) {
        setNotifications((current) => [{
          id: `notif-${Date.now()}`,
          title: "Alerte Securite",
          message: "Activite suspecte detectee. Ralentissez vos recherches.",
          icon: "security",
          timestamp: new Date(),
        }, ...current]);
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
  }, [lastActionTime]);

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
      password: "Deverrouiller",
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

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
