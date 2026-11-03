// Fin à choix (phase 5, scénario « Le coffre 1832-1967 »).
// Après le mot de passe admin, si le dossier confidentiel a été ouvert, le
// joueur décide quoi faire des preuves. Textes cohérents avec le dossier
// confidentiel, les emails secrets et les secrets ajoutés en phase 3.

export type FinalChoice = "justice" | "mayor" | "player";

export const CHOICE_DECISION_SECONDS = 60;

export const CHOICE_INTRO = {
  date: "Jeudi 20 février 2025, au soir.",
  lines: [
    "Vous savez maintenant qui vous êtes : Bernard Dupuis, maire de Bourg-sur-Mer.",
    "Antoine Garnier publie tout dans 5 jours. Maurin attend votre réponse.",
  ],
};

/** Ce que le joueur sait, selon les secrets trouvés (rappel avant le choix) */
export const KNOWLEDGE: { secretId: string; text: string }[] = [
  { secretId: "secret1", text: "Le contrat des Jardins de la Mer : 85 000 € de « facilitation » versés en Suisse." },
  { secretId: "secret3", text: "Le compte Helvetia à Genève : 847 230 € accumulés depuis 2019." },
  { secretId: "secret4", text: "La photo de Monaco : vous, Maurin, Vidal... et une mallette de billets." },
  { secretId: "secret2", text: "Vos menaces écrites contre le journaliste Antoine Garnier." },
  { secretId: "secretmail1", text: "Garnier publie tout le 25 février si vous ne démissionnez pas." },
  { secretId: "secretmail2", text: "Maurin propose une « solution définitive » pour Garnier, à 50 000 €." },
  { secretId: "secret5", text: "Votre testament : le coffre 1832-1967 et une clé USB contre Maurin et Vidal." },
  { secretId: "contact-vidal", text: "Vidal, l'ancien préfet, caché dans vos contacts." },
  { secretId: "terminal-history", text: "Les preuves que vous avez effacées le 17 février au soir." },
  { secretId: "hidden-maurin", text: "Maurin : « on règle ça à l'ancienne, comme en 82 »." },
];

export interface ChoiceOption {
  id: FinalChoice;
  label: string;
  description: string;
  /** Secret nécessaire pour que ce choix soit possible */
  requiresSecret?: string;
  lockedHint?: string;
}

export const CHOICES: ChoiceOption[] = [
  {
    id: "justice",
    label: "Tout remettre au procureur",
    description: "Ouvrir le coffre, prendre la clé USB et le dossier, et vous dénoncer en même temps que Maurin et Vidal.",
  },
  {
    id: "mayor",
    label: "Détruire les preuves",
    description: "Effacer le dossier, jeter la clé USB au port, et inaugurer le square demain comme si de rien n'était.",
  },
  {
    id: "player",
    label: "Faire chanter Maurin et Vidal",
    description: "« Si je tombe, ils tombent avec moi. » Utiliser la clé USB du coffre comme assurance-vie.",
    requiresSecret: "secret5",
    lockedHint: "Il vous faudrait un moyen de pression... Un document du dossier confidentiel vous a échappé.",
  },
];

export interface EndingText {
  title: string;
  subtitle: string;
  /** Sous-titre si le joueur n'a pas choisi à temps */
  timeoutSubtitle?: string;
  opening: string[];
  /** Paragraphes ajoutés selon les secrets découverts */
  conditional: { secretIds: string[]; text: string }[];
  closing: string;
}

export const ENDINGS: Record<FinalChoice, EndingText> = {
  justice: {
    title: "Fin : La Justice",
    subtitle: "Vous avez choisi de tout dire.",
    opening: [
      "Le 21 février, au lieu d'inaugurer le square Léon Blum, Bernard Dupuis se présente au palais de justice avec un carton d'archives et la clé USB sortie du coffre 1832-1967.",
      "Il raconte tout : les Jardins de la Mer, le compte suisse, Monaco. Il se dénonce en même temps que Philippe Maurin et Jean-Marc Vidal.",
    ],
    conditional: [
      { secretIds: ["secretmail2"], text: "Grâce au message de Maurin, les enquêteurs déjouent la « solution définitive » : Antoine Garnier est placé sous protection." },
      { secretIds: ["hidden-maurin"], text: "L'enregistrement « comme en 82 » fait rouvrir l'enquête sur la mort d'Henri Dupuis. Quarante-trois ans plus tard, la vérité sur l'accident éclate." },
      { secretIds: ["secret3"], text: "Le compte Helvetia est saisi : 847 230 € reviennent à la commune." },
      { secretIds: ["contact-vidal", "secret4"], text: "Jean-Marc Vidal, l'ancien préfet, est mis en examen pour corruption." },
    ],
    closing: "Le procès dure huit mois : prison avec sursis, inéligibilité. Le 15 avril, Marie l'attend quand même au Phare, à la table de la terrasse.",
  },
  mayor: {
    title: "Fin : Le Maire",
    subtitle: "Vous avez choisi le silence.",
    timeoutSubtitle: "Vous n'avez rien décidé. Maurin, si.",
    opening: [
      "Le dossier confidentiel part en fumée, la clé USB au fond du port. Le 21 février, Bernard coupe le ruban du square Léon Blum sous les applaudissements, l'écharpe tricolore bien en place.",
      "Le 24 février, Antoine Garnier ne répond plus au téléphone. L'article du 25 ne paraîtra jamais.",
    ],
    conditional: [
      { secretIds: ["hidden-maurin"], text: "« À l'ancienne, comme en 82. » Vous savez exactement ce que cela veut dire." },
      { secretIds: ["terminal-history"], text: "Effacer des preuves, vous l'aviez déjà fait le 17 février. C'est devenu une habitude." },
      { secretIds: ["secret3"], text: "Sur le compte Helvetia, un nouveau virement apparaît : 50 000 €, en sortie." },
    ],
    closing: "Un soir, un SMS s'affiche : « Problème réglé. Rappelle-moi sur l'autre numéro. — P. » Bernard est réélu l'année suivante. Il ne dort plus très bien.",
  },
  player: {
    title: "Fin : Le Joueur",
    subtitle: "Vous avez choisi le chantage.",
    opening: [
      "Bernard récupère la clé USB dans le coffre 1832-1967 et donne rendez-vous à Maurin et Vidal sur le port, à la nuit tombée.",
      "« Si je tombe, vous tombez avec moi. » Le message est reçu : la « solution définitive » est annulée.",
    ],
    conditional: [
      { secretIds: ["secretmail1"], text: "Garnier, lui, reçoit des documents falsifiés qui ruinent son enquête. L'article du 25 février est enterré." },
      { secretIds: ["contact-vidal"], text: "Vidal vous appelle désormais chaque semaine, poliment. Trop poliment." },
      { secretIds: ["secret3"], text: "Le compte Helvetia continue de grossir." },
    ],
    closing: "Bernard garde son écharpe, son bureau avec vue sur le port et tous ses secrets. Il n'est plus la proie de Maurin : il est devenu son égal.",
  },
};
