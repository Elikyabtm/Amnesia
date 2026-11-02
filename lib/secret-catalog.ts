// Catalogue de tous les secrets du jeu (comptés pour les fins).
// À METTRE À JOUR quand on ajoute un secret.

import { secretDocuments, secretMails } from "./game-data";
import { TERMINAL_SECRETS } from "./data/terminal";

export interface SecretInfo {
  id: string;
  name: string;
  /** Où le trouver (pour la relecture) */
  where: string;
}

export const SECRETS: SecretInfo[] = [
  ...secretDocuments.map((d) => ({ id: d.id, name: d.name, where: "Explorateur > Documents > Dossier Confidentiel (PIN)" })),
  ...secretMails.map((m) => ({ id: m.id, name: m.name, where: "Courrier, après connexion invité" })),
  { id: "contact-vidal", name: "Contact masqué : J.-M. V. (ancien préfet)", where: "Contacts > Afficher les contacts masqués (après connexion)" },
  { ...TERMINAL_SECRETS.history, where: "Terminal : commande cachée « history »" },
  { ...TERMINAL_SECRETS.hiddenFile, where: "Terminal : « dir /a » dans Documents, puis « type sauvegarde_maurin.txt »" },
];

export const SECRET_TOTAL = SECRETS.length;

export function secretName(id: string) {
  return SECRETS.find((s) => s.id === id)?.name ?? id;
}
