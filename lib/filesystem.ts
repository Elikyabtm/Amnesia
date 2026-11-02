// Système de fichiers virtuel du PC de Bernard, partagé par l'Explorateur et
// le Terminal. L'arborescence dépend de la progression (corbeille restaurée
// ou vidée, dossiers créés sur le bureau).

import { audioMemos, corbeille, documents, fileMetadata, notes, photos, secretDocuments, type FileItem } from "./game-data";
import { downloads } from "./data/downloads";
import type { DesktopFolder } from "./game-context";

export const HOME_PATH = "C:\\Users\\BDupuis";

export interface VNode {
  id: string;
  name: string;
  kind: "folder" | "file";
  /** Fichier du jeu (pour les nœuds "file") */
  file?: FileItem;
  children?: VNode[];
  /** Identifiant de l'élément verrouillé par code PIN (dossier confidentiel) */
  lockId?: string;
}

/** Emplacement d'origine des fichiers de la corbeille, une fois restaurés */
export const TRASH_ORIGIN: Record<string, "documents" | "notes"> = {
  trash1: "documents",
  trash2: "notes",
  trash3: "documents",
};

export interface FileSystemState {
  desktopFolders: DesktopFolder[];
  trashRestoredIds: string[];
  /** Documents créés par le joueur dans le Bloc-notes */
  userFiles?: FileItem[];
}

const fileNode = (file: FileItem): VNode => ({ id: file.id, name: file.name, kind: "file", file });

export function buildFileSystem(state: FileSystemState): VNode {
  const restored = corbeille.filter((f) => state.trashRestoredIds.includes(f.id));
  const restoredIn = (where: "documents" | "notes") => restored.filter((f) => TRASH_ORIGIN[f.id] === where).map(fileNode);

  return {
    id: "home",
    name: "BDupuis",
    kind: "folder",
    children: [
      {
        id: "desktop",
        name: "Bureau",
        kind: "folder",
        children: state.desktopFolders.map((f) => ({ id: f.id, name: f.name, kind: "folder" as const, children: [] })),
      },
      {
        id: "documents",
        name: "Documents",
        kind: "folder",
        children: [
          { id: "notes", name: "Notes", kind: "folder", children: [...notes.map(fileNode), ...restoredIn("notes")] },
          { id: "audio", name: "Mémos vocaux", kind: "folder", children: audioMemos.map(fileNode) },
          { id: "confidential", name: "Dossier Confidentiel", kind: "folder", lockId: "confidential", children: secretDocuments.map(fileNode) },
          ...documents.map(fileNode),
          ...restoredIn("documents"),
          ...(state.userFiles ?? []).map(fileNode),
        ],
      },
      { id: "images", name: "Images", kind: "folder", children: photos.map(fileNode) },
      { id: "downloads", name: "Téléchargements", kind: "folder", children: downloads.map(fileNode) },
    ],
  };
}

/** Chemin (liste de nœuds depuis la racine) jusqu'au nœud `id`, ou null. */
export function findPath(root: VNode, id: string): VNode[] | null {
  if (root.id === id) return [root];
  for (const child of root.children ?? []) {
    const sub = findPath(child, id);
    if (sub) return [root, ...sub];
  }
  return null;
}

export function pathToString(path: VNode[]): string {
  return [HOME_PATH, ...path.slice(1).map((n) => n.name)].join("\\");
}

const EXTENSION_TYPES: Record<string, string> = {
  txt: "Document texte",
  pdf: "Document PDF",
  jpg: "Image JPEG",
  wav: "Fichier audio WAV",
  mp3: "Fichier audio MP3",
  xlsx: "Feuille de calcul Excel",
};

export function fileTypeLabel(node: VNode): string {
  if (node.kind === "folder") return "Dossier de fichiers";
  const ext = node.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TYPES[ext] ?? "Fichier";
}

/** Taille approximative (ou celle des métadonnées du jeu si elles existent) */
export function fileSize(node: VNode): string {
  if (node.kind === "folder") return "";
  const meta = node.file ? fileMetadata[node.file.id] : undefined;
  if (meta && meta.name === node.name) return meta.size;
  const bytes = node.file?.type === "image" ? 180_000 + (node.name.length * 7919) % 900_000 : (node.file?.content?.length ?? 0) * 1.1;
  return bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} Mo` : `${Math.max(1, Math.round(bytes / 100) / 10)} Ko`;
}

/** Métadonnées détaillées du jeu pour un fichier (auteur, dates...), si elles existent */
export function fileDetails(node: VNode) {
  const meta = node.file ? fileMetadata[node.file.id] : undefined;
  return meta && meta.name === node.name ? meta : null;
}
