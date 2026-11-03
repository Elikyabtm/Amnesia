"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { SUSPICION_THRESHOLDS, secretMails, favoriteMails, type FileItem } from "./game-data";
import { allInboxMails } from "./data/messages";
import { gameNow, birthdayCountdownText } from "./game-clock";
import { isCatalogClue, UNREACHABLE_CLUES } from "./clue-catalog";
import { DEFAULT_WALLPAPER } from "./data/wallpapers";
import { DEFAULT_BOOKMARKS } from "./data/browser";
import { DEFAULT_BEST_SCORES, type MinesweeperLevel, type MinesweeperScore } from "./data/minesweeper";
import { INITIAL_EVENTS_STATE, type EventsState } from "./events/types";
import type { FinalChoice } from "./data/final-choice";
import { loadSave, writeSave, clearSave, type SaveData } from "./save-game";
import { verifyPassword, verifyPin, type PasswordVerdict, type PasswordPart } from "./verify-client";

export type AppType = "explorer" | "mail" | "photos" | "notepad" | "calendar" | "trash" | "password" | "browser" | "clues" | "audio" | "settings" | "contacts" | "terminal" | "calculator" | "music" | "paint" | "minesweeper";

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
  /** Fenêtre aimantée sur une moitié de l'écran */
  snapped?: "left" | "right";
  /** Élément à afficher à l'ouverture (email, page, mémo...) et passage à surligner */
  target?: WindowTarget;
}

export type MailFolderId = "inbox" | "archive" | "sent" | "trash";

export interface DesktopFolder {
  id: string;
  name: string;
  createdAt: string;
}

export type GamePhase =
  | "title"
  | "intro"
  | "booting"
  | "exploring"
  | "won"
  | "sleep"
  | "restarting"
  | "shuttingdown";

export type SnapZone = "left" | "right" | "max";

export interface WindowTarget {
  id: string;
  highlight?: string | string[];
}

/** D'où vient un indice : permet de rouvrir le document source depuis le carnet. */
export interface ClueRef {
  /** "app" : section d'une application, id au format "<application>:<section>" */
  kind: "file" | "mail" | "voice" | "page" | "event" | "app";
  id: string;
}

export interface ClueItem {
  id: string;
  category: "identity" | "date" | "place" | "password";
  text: string;
  source: string;
  discoveredAt: Date;
  ref?: ClueRef;
  /** Passage du document source à surligner (plusieurs formulations possibles, essayées dans l'ordre) */
  highlight?: string | string[];
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
  gamePhase: GamePhase;
  /** Une partie est en cours (éteinte) et peut être reprise depuis l'écran titre */
  canContinue: boolean;
  continueGame: () => void;
  /** Veille : retour à l'écran de verrouillage, fenêtres conservées */
  sleep: () => void;
  wake: () => void;
  restartComputer: () => void;
  shutdownComputer: () => void;
  /** Appelé par les écrans de transition (arrêt / redémarrage) */
  finishPowerTransition: () => void;
  loginError: boolean;
  windows: WindowState[];
  activeWindowId: string | null;
  maxZIndex: number;
  clues: ClueItem[];
  notifications: Notification[];
  /** Historique de toutes les notifications reçues (centre de notifications) */
  notificationHistory: Notification[];
  unseenNotificationCount: number;
  markNotificationsSeen: () => void;
  clearNotificationHistory: () => void;
  // Bureau : fond d'écran, positions des icônes, dossiers créés par le joueur
  wallpaper: string;
  setWallpaper: (id: string) => void;
  iconPositions: Record<string, { x: number; y: number }>;
  setIconPositions: (positions: Record<string, { x: number; y: number }>) => void;
  desktopFolders: DesktopFolder[];
  createDesktopFolder: () => string;
  renameDesktopFolder: (id: string, name: string) => void;
  deleteDesktopFolder: (id: string) => void;
  /** Documents texte créés par le joueur dans le Bloc-notes (dossier Documents) */
  userFiles: FileItem[];
  saveUserFile: (file: { id?: string; name: string; content: string; imageSrc?: string }) => FileItem;
  /** Meilleurs scores du Démineur (records de Bernard remplacés si battus) */
  minesweeperScores: Record<MinesweeperLevel, MinesweeperScore>;
  recordMinesweeperScore: (level: MinesweeperLevel, score: MinesweeperScore) => void;
  /** Favoris du navigateur (identifiants de pages) */
  browserBookmarks: string[];
  toggleBrowserBookmark: (pageId: string) => void;
  /** Corbeille : fichiers restaurés à leur emplacement d'origine, corbeille vidée */
  trashRestoredIds: string[];
  trashEmptied: boolean;
  restoreTrashItem: (id: string) => void;
  emptyTrash: () => void;
  /** Niveau de batterie en % (piloté par le gestionnaire d'événements) */
  batteryLevel: number;
  setBatteryLevel: (level: number) => void;
  /** Chargeur branché (après l'événement batterie) */
  batteryCharging: boolean;
  setBatteryCharging: (charging: boolean) => void;
  /** Connexion réseau (coupée pendant l'événement Wi-Fi) */
  networkOnline: boolean;
  setNetworkOnline: (online: boolean) => void;
  /** État des événements système et des mini-jeux */
  eventsState: EventsState;
  setEventsState: React.Dispatch<React.SetStateAction<EventsState>>;
  /** Choix moral final (après le mot de passe admin, si le dossier confidentiel a été ouvert) */
  finalChoice: { choice: FinalChoice; timedOut: boolean } | null;
  setFinalChoice: (choice: { choice: FinalChoice; timedOut: boolean }) => void;
  /** Temps de jeu écoulé en ms (hors ordinateur éteint) */
  getElapsedMs: () => number;
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
  openWindow: (app: AppType, title?: string, content?: FileItem | string, target?: WindowTarget) => void;
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
  markMailUnread: (mailId: string) => void;
  /** Courrier : déplacements faits par le joueur, favoris, messages écrits */
  mailFolderOverrides: Record<string, MailFolderId>;
  moveMail: (mailId: string, folder: MailFolderId) => void;
  starredMailIds: string[];
  toggleMailStar: (mailId: string) => void;
  composedMails: FileItem[];
  sendMail: (mail: { to: string; subject: string; body: string }) => void;
  listenedVoiceIds: string[];
  markVoiceListened: (voiceId: string) => void;
  startTime: number | null;
  endTime: number | null;
  isRestored: boolean;
  /** Le joueur a découvert qu'il est Bernard Dupuis (ou s'est connecté en admin) */
  identityKnown: boolean;
  /** Restaure (si réduite) et met au premier plan une fenêtre */
  activateWindow: (id: string) => void;
  /** Aimante une fenêtre sur une moitié de l'écran, ou l'agrandit ("max") */
  snapWindow: (id: string, zone: SnapZone) => void;
  /** Rend sa taille d'origine à une fenêtre aimantée/agrandie, à la position donnée */
  detachWindow: (id: string, position: { x: number; y: number }) => void;
  resetGame: () => void;
  lockoutRemaining: number;
}

const TASKBAR_HEIGHT = 48;
const WINDOW_CASCADE_STEP = 28;
const WINDOW_CASCADE_SLOTS = 6;

/**
 * Taille et position d'une nouvelle fenêtre : centrée, ~70 % de la largeur et
 * ~75 % de la hauteur de l'écran, avec un léger décalage en cascade pour
 * chaque fenêtre déjà ouverte.
 */
/** Applications compactes : taille fixe plutôt que 70 % x 75 % de l'écran */
const PREFERRED_WINDOW_SIZES: Partial<Record<AppType, { width: number; height: number }>> = {
  calculator: { width: 340, height: 540 },
  minesweeper: { width: 420, height: 560 },
};

function computeNewWindowRect(openCount: number, app?: AppType) {
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1280;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;
  const availableH = viewportH - TASKBAR_HEIGHT;
  const preferred = app ? PREFERRED_WINDOW_SIZES[app] : undefined;

  const width = Math.min(viewportW, preferred?.width ?? Math.max(480, Math.round(viewportW * 0.7)));
  const height = Math.min(availableH, preferred?.height ?? Math.max(360, Math.round(viewportH * 0.75)));

  const offset = (openCount % WINDOW_CASCADE_SLOTS) * WINDOW_CASCADE_STEP;
  const x = Math.round((viewportW - width) / 2) + offset;
  const y = Math.round((availableH - height) / 2) + offset;

  return {
    size: { width, height },
    position: {
      x: Math.max(0, Math.min(x, viewportW - width)),
      y: Math.max(0, Math.min(y, availableH - height)),
    },
  };
}

// Indices qui révèlent l'identité du joueur
const IDENTITY_CLUES = ["Votre nom est Bernard Dupuis", "Vous êtes Bernard Dupuis, Maire de Bourg-sur-Mer"];

/** Position et taille d'une fenêtre aimantée (moitié gauche/droite) ou agrandie */
function snapRect(zone: SnapZone) {
  const w = typeof window !== "undefined" ? window.innerWidth : 1280;
  const h = (typeof window !== "undefined" ? window.innerHeight : 800) - TASKBAR_HEIGHT;
  if (zone === "max") return { position: { x: 0, y: 0 }, size: { width: w, height: h } };
  const half = Math.floor(w / 2);
  return {
    position: { x: zone === "left" ? 0 : w - half, y: 0 },
    size: { width: half, height: h },
  };
}

let notifSeq = 0;
const notifId = () => `notif-${Date.now()}-${++notifSeq}`;

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gamePhase, setGamePhase] = useState<GamePhase>("title");
  // Moment où le chronomètre a été mis en pause (ordinateur éteint)
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [loginError, setLoginError] = useState(false);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(100);
  const [windowCounter, setWindowCounter] = useState(0);
  const [clues, setClues] = useState<ClueItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<Notification[]>([]);
  const [seenNotificationIds, setSeenNotificationIds] = useState<string[]>([]);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [batteryCharging, setBatteryCharging] = useState(false);
  const [networkOnline, setNetworkOnline] = useState(true);
  const [eventsState, setEventsState] = useState<EventsState>(INITIAL_EVENTS_STATE);
  const [finalChoice, setFinalChoice] = useState<{ choice: FinalChoice; timedOut: boolean } | null>(null);

  // ---------- Bureau ----------
  const [wallpaper, setWallpaper] = useState(DEFAULT_WALLPAPER);
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [desktopFolders, setDesktopFolders] = useState<DesktopFolder[]>([]);
  const [userFiles, setUserFiles] = useState<FileItem[]>([]);
  const saveUserFile = useCallback((file: { id?: string; name: string; content: string; imageSrc?: string }) => {
    const ext = file.imageSrc ? ".png" : ".txt";
    const name = /\.[a-z0-9]+$/i.test(file.name.trim()) ? file.name.trim() : `${file.name.trim() || "Sans titre"}${ext}`;
    const saved: FileItem = file.imageSrc
      ? { id: file.id ?? `user-${Date.now()}`, name, type: "image", content: "Dessin créé dans Paint.", imageSrc: file.imageSrc }
      : { id: file.id ?? `user-${Date.now()}`, name, type: "file", content: file.content };
    setUserFiles((files) => (files.some((f) => f.id === saved.id) ? files.map((f) => (f.id === saved.id ? saved : f)) : [...files, saved]));
    return saved;
  }, []);
  const [minesweeperScores, setMinesweeperScores] = useState(DEFAULT_BEST_SCORES);
  const recordMinesweeperScore = useCallback((level: MinesweeperLevel, score: MinesweeperScore) => {
    setMinesweeperScores((s) => (score.seconds < s[level].seconds ? { ...s, [level]: score } : s));
  }, []);
  const [browserBookmarks, setBrowserBookmarks] = useState<string[]>(DEFAULT_BOOKMARKS);
  const toggleBrowserBookmark = useCallback((pageId: string) => {
    setBrowserBookmarks((b) => (b.includes(pageId) ? b.filter((id) => id !== pageId) : [...b, pageId]));
  }, []);
  const [trashRestoredIds, setTrashRestoredIds] = useState<string[]>([]);
  const [trashEmptied, setTrashEmptied] = useState(false);
  const restoreTrashItem = useCallback((id: string) => {
    setTrashRestoredIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
  }, []);
  const emptyTrash = useCallback(() => setTrashEmptied(true), []);

  const createDesktopFolder = useCallback(() => {
    const id = `folder-${Date.now()}`;
    setDesktopFolders((folders) => {
      // "Nouveau dossier", "Nouveau dossier (2)"... comme sous Windows
      const names = new Set(folders.map((f) => f.name));
      let name = "Nouveau dossier";
      for (let n = 2; names.has(name); n++) name = `Nouveau dossier (${n})`;
      return [...folders, { id, name, createdAt: gameNow().toISOString() }];
    });
    return id;
  }, []);
  const renameDesktopFolder = useCallback((id: string, name: string) => {
    const clean = name.trim().replace(/[\\/:*?"<>|]/g, "");
    if (!clean) return;
    setDesktopFolders((folders) => folders.map((f) => (f.id === id ? { ...f, name: clean } : f)));
  }, []);
  const deleteDesktopFolder = useCallback((id: string) => {
    setDesktopFolders((folders) => folders.filter((f) => f.id !== id));
    setIconPositions((pos) => {
      const next = { ...pos };
      delete next[id];
      return next;
    });
  }, []);

  // Toute notification affichée rejoint l'historique (une seule fois)
  useEffect(() => {
    setNotificationHistory((history) => {
      const known = new Set(history.map((n) => n.id));
      const fresh = notifications.filter((n) => !known.has(n.id));
      return fresh.length ? [...fresh, ...history].slice(0, 50) : history;
    });
  }, [notifications]);

  const unseenNotificationCount = notificationHistory.filter((n) => !seenNotificationIds.includes(n.id)).length;
  const markNotificationsSeen = useCallback(() => {
    setSeenNotificationIds(notificationHistory.map((n) => n.id));
  }, [notificationHistory]);
  const clearNotificationHistory = useCallback(() => {
    setNotificationHistory([]);
    setSeenNotificationIds([]);
  }, []);
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const clueCounterRef = useRef(0);
  const [readMailIds, setReadMailIds] = useState<string[]>([]);
  const [listenedVoiceIds, setListenedVoiceIds] = useState<string[]>([]);
  const [mailFolderOverrides, setMailFolderOverrides] = useState<Record<string, MailFolderId>>({});
  const [starredMailIds, setStarredMailIds] = useState<string[]>(() => favoriteMails.map((m) => m.id));
  const [composedMails, setComposedMails] = useState<FileItem[]>([]);
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

  // ---------- Sauvegarde / reprise ----------
  const [isRestored, setIsRestored] = useState(false);

  // Reprise automatique au chargement (côté client uniquement)
  useEffect(() => {
    const save = loadSave();
    if (save) {
      const now = Date.now();
      setAccountLevel(save.accountLevel);
      setPasswordAttempts(save.passwordAttempts);
      setSuspicionLevel(
        save.suspicionLevel >= SUSPICION_THRESHOLDS.LOCKOUT
          ? SUSPICION_THRESHOLDS.DANGER - 10
          : save.suspicionLevel
      );
      setClues(save.clues.map((c) => ({ ...c, discoveredAt: new Date(c.discoveredAt) })));
      clueCounterRef.current = save.clues.length;
      setLockedItems((items) =>
        items.map((i) => ({ ...i, unlocked: save.unlockedItemIds.includes(i.id) }))
      );
      setSecretsDiscovered(save.secretsDiscovered);
      setReadMailIds(save.readMailIds);
      setListenedVoiceIds(save.listenedVoiceIds ?? []);
      setNotificationHistory((save.notificationHistory ?? []).map((n) => ({ ...n, timestamp: new Date(n.timestamp) })));
      setSeenNotificationIds(save.seenNotificationIds ?? []);
      if (save.browserBookmarks) setBrowserBookmarks(save.browserBookmarks);
      if (save.userFiles) setUserFiles(save.userFiles);
      if (save.minesweeperScores) setMinesweeperScores(save.minesweeperScores);
      if (save.finalChoice) setFinalChoice(save.finalChoice);
      if (save.events) {
        setEventsState(save.events);
        setBatteryCharging(save.events.batteryResolved);
      }
      if (save.trash) {
        setTrashRestoredIds(save.trash.restored);
        setTrashEmptied(save.trash.emptied);
      }
      if (save.mail) {
        setMailFolderOverrides(save.mail.folderOverrides);
        setStarredMailIds(save.mail.starred);
        setComposedMails(save.mail.composed);
      }
      if (save.desktop) {
        setWallpaper(save.desktop.wallpaper);
        setIconPositions(save.desktop.iconPositions);
        setDesktopFolders(save.desktop.folders);
      }
      setRevealedPassword(save.revealedPassword);
      setStartTime(now - save.elapsedMs);
      setEndTime(save.gamePhase === "won" ? now : null);
      if (save.poweredOff && save.gamePhase === "exploring") {
        // Ordinateur éteint : on revient à l'écran titre avec "Continuer"
        setPausedAt(now);
        setGamePhase("title");
      } else {
        setGamePhase(save.gamePhase);
      }
      if (save.gamePhase === "exploring" && !save.poweredOff) {
        setNotifications([
          {
            id: notifId(),
            title: "Session restaurée",
            message: `Reprise de votre enquête : ${save.clues.length} indice${save.clues.length > 1 ? "s" : ""} retrouvé${save.clues.length > 1 ? "s" : ""}.`,
            icon: "system",
            timestamp: gameNow(),
          },
        ]);
      }
    }
    setIsRestored(true);
  }, []);

  const buildSave = useCallback((): SaveData | null => {
    if (startTime === null) return null;
    // Toute phase de jeu (bureau, veille, éteint...) se sauvegarde comme "en cours"
    const poweredOff = gamePhase === "title" || gamePhase === "shuttingdown";
    return {
      version: 1,
      savedAt: new Date().toISOString(),
      gamePhase: gamePhase === "won" ? "won" : "exploring",
      poweredOff,
      accountLevel,
      elapsedMs: (endTime ?? pausedAt ?? Date.now()) - startTime,
      passwordAttempts,
      suspicionLevel,
      clues: clues.map((c) => ({ ...c, discoveredAt: c.discoveredAt.toISOString() })),
      unlockedItemIds: lockedItems.filter((i) => i.unlocked).map((i) => i.id),
      secretsDiscovered,
      readMailIds,
      listenedVoiceIds,
      revealedPassword,
      notificationHistory: notificationHistory.map((n) => ({ ...n, timestamp: n.timestamp.toISOString() })),
      seenNotificationIds,
      desktop: { wallpaper, iconPositions, folders: desktopFolders },
      mail: { folderOverrides: mailFolderOverrides, starred: starredMailIds, composed: composedMails },
      trash: { restored: trashRestoredIds, emptied: trashEmptied },
      browserBookmarks,
      userFiles,
      minesweeperScores,
      events: eventsState,
      finalChoice,
    };
  }, [gamePhase, startTime, endTime, pausedAt, accountLevel, passwordAttempts, suspicionLevel, clues, lockedItems, secretsDiscovered, readMailIds, listenedVoiceIds, revealedPassword, notificationHistory, seenNotificationIds, wallpaper, iconPositions, desktopFolders, mailFolderOverrides, starredMailIds, composedMails, trashRestoredIds, trashEmptied, browserBookmarks, userFiles, minesweeperScores, eventsState, finalChoice]);

  // Sauvegarde à chaque changement, toutes les 5 s (chronomètre) et en quittant la page
  const buildSaveRef = useRef(buildSave);
  const resettingRef = useRef(false);
  useEffect(() => {
    buildSaveRef.current = buildSave;
    if (!isRestored || resettingRef.current) return;
    const data = buildSave();
    if (data) writeSave(data);
  }, [buildSave, isRestored]);

  useEffect(() => {
    if (!isRestored) return;
    const persist = () => {
      if (resettingRef.current) return;
      const data = buildSaveRef.current();
      if (data) writeSave(data);
    };
    const interval = setInterval(persist, 5000);
    window.addEventListener("pagehide", persist);
    return () => {
      clearInterval(interval);
      window.removeEventListener("pagehide", persist);
    };
  }, [isRestored]);

  const resetGame = useCallback(() => {
    resettingRef.current = true;
    clearSave();
    window.location.reload();
  }, []);

  const startGame = useCallback(() => {
    setGamePhase("intro");
  }, []);

  const enterDesktop = useCallback(() => {
    setGamePhase("booting");
  }, []);

  const finishBooting = useCallback(() => {
    setGamePhase("exploring");
    if (startTime !== null) {
      // Redémarrage ou reprise : la partie continue, le chronomètre reprend
      if (pausedAt !== null) {
        const pause = Date.now() - pausedAt;
        setStartTime((t) => (t === null ? t : t + pause));
        setPausedAt(null);
      }
      return;
    }
    setStartTime(Date.now());
    // Add initial notifications after a delay
    setTimeout(() => {
      setNotifications([
        {
          id: "notif-1",
          title: "Nouveaux messages",
          message: `Vous avez ${allInboxMails.length} emails non lus`,
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
  }, [startTime, pausedAt]);

  // ---------- Alimentation ----------
  const sleep = useCallback(() => setGamePhase("sleep"), []);
  const wake = useCallback(() => setGamePhase("exploring"), []);

  const restartComputer = useCallback(() => {
    setWindows([]);
    setActiveWindowId(null);
    setPausedAt(Date.now());
    setGamePhase("restarting");
  }, []);

  const shutdownComputer = useCallback(() => {
    setWindows([]);
    setActiveWindowId(null);
    setPausedAt(Date.now());
    setGamePhase("shuttingdown");
  }, []);

  const finishPowerTransition = useCallback(() => {
    setGamePhase((phase) => (phase === "restarting" ? "booting" : phase === "shuttingdown" ? "title" : phase));
  }, []);

  const getElapsedMs = useCallback(
    () => (startTime === null ? 0 : (endTime ?? pausedAt ?? Date.now()) - startTime),
    [startTime, endTime, pausedAt]
  );

  const canContinue = gamePhase === "title" && startTime !== null && endTime === null;
  const continueGame = useCallback(() => setGamePhase("booting"), []);

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
    if (process.env.NODE_ENV !== "production" && !isCatalogClue(clue.text) && !UNREACHABLE_CLUES.includes(clue.text)) {
      console.warn(`[Amnesia] Indice absent de lib/clue-catalog.ts : "${clue.text}"`);
    }
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

  const markMailUnread = useCallback((mailId: string) => {
    setReadMailIds((current) => current.filter((id) => id !== mailId));
  }, []);

  const moveMail = useCallback((mailId: string, folder: MailFolderId) => {
    setMailFolderOverrides((current) => ({ ...current, [mailId]: folder }));
  }, []);

  const toggleMailStar = useCallback((mailId: string) => {
    setStarredMailIds((current) => (current.includes(mailId) ? current.filter((id) => id !== mailId) : [...current, mailId]));
  }, []);

  const sendMail = useCallback((mail: { to: string; subject: string; body: string }) => {
    const date = gameNow().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const subject = mail.subject.trim() || "(sans objet)";
    const id = `composed-${Date.now()}`;
    setComposedMails((current) => [
      {
        id,
        name: subject,
        type: "mail",
        content: `À : ${mail.to.trim()}\nObjet : ${subject}\nDate : ${date}\n\n${mail.body}`,
      },
      ...current,
    ]);
    setReadMailIds((current) => [...current, id]);
    setNotifications((current) => [
      { id: notifId(), title: "Message envoyé", message: `À : ${mail.to.trim()} — ${subject}`, icon: "mail", timestamp: gameNow() },
      ...current,
    ]);
  }, []);

  const markVoiceListened = useCallback((voiceId: string) => {
    setListenedVoiceIds((current) => (current.includes(voiceId) ? current : [...current, voiceId]));
  }, []);

  const discoverSecret = useCallback((secretId: string) => {
    setSecretsDiscovered((current) => {
      if (current.includes(secretId)) return current;
      return [...current, secretId];
    });
  }, []);

  const openWindow = useCallback((app: AppType, title?: string, content?: FileItem | string, target?: WindowTarget) => {
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
      audio: "Messages vocaux",
      settings: "Paramètres",
      contacts: "Contacts",
      terminal: "Invite de commandes",
      calculator: "Calculatrice",
      music: "Musique",
      paint: "Paint",
      minesweeper: "Démineur",
    };

    const { position, size } = computeNewWindowRect(windows.length, app);

    const newWindow: WindowState = {
      id,
      app,
      title: title || defaultTitles[app],
      isMinimized: false,
      isMaximized: false,
      zIndex: maxZIndex + 1,
      position,
      size,
      content,
      target,
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
          // Retour à la taille d'avant
          return {
            ...win,
            isMaximized: false,
            snapped: undefined,
            position: win.prevPosition || computeNewWindowRect(0).position,
            size: win.prevSize || computeNewWindowRect(0).size,
          };
        }
        const rect = snapRect("max");
        return {
          ...win,
          isMaximized: true,
          snapped: undefined,
          // Une fenêtre aimantée garde la taille qu'elle avait avant l'aimantation
          prevPosition: win.snapped ? win.prevPosition : win.position,
          prevSize: win.snapped ? win.prevSize : win.size,
          ...rect,
        };
      })
    );
  }, []);

  const snapWindow = useCallback((id: string, zone: SnapZone) => {
    setWindows((w) =>
      w.map((win) => {
        if (win.id !== id) return win;
        const alreadyDocked = win.isMaximized || !!win.snapped;
        return {
          ...win,
          isMaximized: zone === "max",
          snapped: zone === "max" ? undefined : zone,
          prevPosition: alreadyDocked ? win.prevPosition : win.position,
          prevSize: alreadyDocked ? win.prevSize : win.size,
          ...snapRect(zone),
        };
      })
    );
  }, []);

  const detachWindow = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows((w) =>
      w.map((win) =>
        win.id === id
          ? {
              ...win,
              isMaximized: false,
              snapped: undefined,
              position,
              size: win.prevSize || computeNewWindowRect(0).size,
            }
          : win
      )
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
      w.map((win) => (win.id === id ? { ...win, size, isMaximized: false, snapped: undefined } : win))
    );
  }, []);

  const activateWindow = useCallback((id: string) => {
    setWindows((w) =>
      w.map((win) => (win.id === id ? { ...win, isMinimized: false, zIndex: maxZIndex + 1 } : win))
    );
    setMaxZIndex((z) => z + 1);
    setActiveWindowId(id);
  }, [maxZIndex]);

  const identityKnown = accountLevel === "admin" || clues.some((c) => IDENTITY_CLUES.includes(c.text));

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
        notificationHistory,
        unseenNotificationCount,
        markNotificationsSeen,
        clearNotificationHistory,
        batteryLevel,
        setBatteryLevel,
        batteryCharging,
        setBatteryCharging,
        networkOnline,
        setNetworkOnline,
        eventsState,
        setEventsState,
        finalChoice,
        setFinalChoice,
        getElapsedMs,
        userFiles,
        saveUserFile,
        minesweeperScores,
        recordMinesweeperScore,
        browserBookmarks,
        toggleBrowserBookmark,
        trashRestoredIds,
        trashEmptied,
        restoreTrashItem,
        emptyTrash,
        wallpaper,
        setWallpaper,
        iconPositions,
        setIconPositions,
        desktopFolders,
        createDesktopFolder,
        renameDesktopFolder,
        deleteDesktopFolder,
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
        markMailUnread,
        mailFolderOverrides,
        moveMail,
        starredMailIds,
        toggleMailStar,
        composedMails,
        sendMail,
        listenedVoiceIds,
        markVoiceListened,
        startTime,
        endTime,
        isRestored,
        canContinue,
        continueGame,
        sleep,
        wake,
        restartComputer,
        shutdownComputer,
        finishPowerTransition,
        identityKnown,
        activateWindow,
        snapWindow,
        detachWindow,
        resetGame,
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
