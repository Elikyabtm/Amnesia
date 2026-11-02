// Registre central des applications : libellés, icônes, couleurs, épinglage.
// Utilisé par la barre des tâches, le menu Démarrer, la recherche, le bureau
// et le sélecteur de fenêtres (Alt+Tab).

import {
  FolderOpen,
  Mail,
  Image,
  FileText,
  Calendar,
  Trash2,
  Lock,
  Globe,
  BookOpen,
  Mic,
  type LucideIcon,
} from "lucide-react";
import type { AppType } from "@/lib/game-context";

export interface AppInfo {
  id: AppType;
  /** Nom de l'application (menu Démarrer, recherche, barre des tâches) */
  label: string;
  /** Libellé sous l'icône du bureau, s'il diffère */
  desktopLabel?: string;
  icon: LucideIcon;
  color: string;
  /** Mots-clés supplémentaires pour la recherche */
  keywords?: string[];
}

export const APPS: Record<AppType, AppInfo> = {
  explorer: { id: "explorer", label: "Explorateur de fichiers", desktopLabel: "Documents", icon: FolderOpen, color: "#f4c542", keywords: ["documents", "fichiers", "dossiers"] },
  mail: { id: "mail", label: "Courrier", icon: Mail, color: "#0078d4", keywords: ["email", "mail", "messagerie"] },
  photos: { id: "photos", label: "Photos", icon: Image, color: "#00a86b", keywords: ["images", "galerie"] },
  browser: { id: "browser", label: "Navigateur", icon: Globe, color: "#00bcf2", keywords: ["internet", "web", "historique"] },
  audio: { id: "audio", label: "Messages vocaux", desktopLabel: "Messages", icon: Mic, color: "#9333ea", keywords: ["répondeur", "mémo", "audio"] },
  notepad: { id: "notepad", label: "Bloc-notes", icon: FileText, color: "#6b7280", keywords: ["texte", "notes"] },
  calendar: { id: "calendar", label: "Calendrier", icon: Calendar, color: "#dc2626", keywords: ["agenda", "date"] },
  clues: { id: "clues", label: "Carnet d'indices", desktopLabel: "Indices", icon: BookOpen, color: "#f97316", keywords: ["indices", "enquête"] },
  trash: { id: "trash", label: "Corbeille", icon: Trash2, color: "#6b7280", keywords: ["supprimés"] },
  password: { id: "password", label: "Déverrouiller", icon: Lock, color: "#22c55e", keywords: ["mot de passe", "connexion", "compte"] },
};

/** Applications épinglées dans la barre des tâches, dans l'ordre */
export const PINNED_APPS: AppType[] = ["explorer", "mail", "browser", "photos", "notepad", "calendar", "trash"];

/** Icônes du bureau, dans l'ordre par défaut */
export const DESKTOP_APPS: AppType[] = ["explorer", "mail", "photos", "browser", "audio", "notepad", "calendar", "clues", "trash", "password"];
