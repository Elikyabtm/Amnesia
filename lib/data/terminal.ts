// Contenus cachés du Terminal (invisibles dans l'Explorateur).
// Cohérents avec l'histoire : menace de Garnier du 15/02 ("publication le
// 25"), message de Maurin du 16/02, testament ("Maurin a couvert l'affaire"
// de la mort de Henri en 1982), compte Helvetia.

import type { FileItem } from "../game-data";

/** Historique de commandes de Bernard (commande cachée "history" / "doskey /history") */
export const COMMAND_HISTORY = [
  "cd Documents",
  "dir",
  "type virement_helvetia.txt",
  "copy Jardins_de_la_Mer_v2.xlsx E:\\",
  "del virement_helvetia.txt",
  "del Jardins_de_la_Mer_v2.xlsx",
  "cipher /w:C:\\Users\\BDupuis\\Documents",
  "ping vidal-perso.fr",
  "cls",
];

/** Date de cet historique, affichée en tête */
export const COMMAND_HISTORY_DATE = "17/02/2025 23:41";

/** Fichiers cachés, visibles seulement avec "dir /a" */
export const HIDDEN_FILES: { folderId: string; file: FileItem }[] = [
  {
    folderId: "documents",
    file: {
      id: "hidden-maurin",
      name: "sauvegarde_maurin.txt",
      type: "file",
      content: `[Transcription — message vocal reçu le 16/02/2025, 22:58 — copie de sécurité]

P. Maurin : "Bernard, c'est Philippe. Garnier a le dossier de 82.
Je ne sais pas comment, mais il l'a. Si ça sort, ton père, l'accident,
tout ce qu'on a couvert à l'époque... on tombe tous les deux.

On ne va pas le laisser faire. On règle ça à l'ancienne, comme en 82.
Rappelle-moi sur l'autre numéro. Pas depuis la mairie."

---
Note : garder une copie. Si Philippe me lâche, c'est ma seule protection.`,
    },
  },
];

export const TERMINAL_SECRETS = {
  history: { id: "terminal-history", name: "Historique du Terminal : preuves effacées le 17/02" },
  hiddenFile: { id: "hidden-maurin", name: "Fichier caché : sauvegarde_maurin.txt (« comme en 82 »)" },
};
