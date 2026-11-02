// Catalogue des indices que le joueur peut réellement trouver.
// Sert à afficher "indices trouvés / total" (écran de fin).
//
// À METTRE À JOUR quand on ajoute un détecteur d'indice : en développement,
// la console signale tout indice ajouté qui n'est pas dans ce catalogue.

export const CLUE_CATALOG: readonly string[] = [
  // Documents, photos, notes (Explorateur)
  "Date de naissance : 14 avril 1967",
  "Bourg-sur-Mer fondée en 1832",
  "Vous êtes le Maire de Bourg-sur-Mer",
  "L'ancien mot de passe était 'Bourg1832' - trop simple",
  "Votre nom est Bernard Dupuis",
  "BSM = initiales de Bourg-sur-Mer",
  // Téléchargements (mémo du service informatique)
  "Format du mot de passe : [fondation ville] + [date naissance]",
  // Corbeille
  "L'ancien mot de passe était trop simple",
  // Courrier
  "Une date importante en avril (anniversaire ou mariage)",
  "Marié depuis longtemps (mariage en 1993)",
  "Date de mariage : 15 avril 1993",
  "Vous êtes marié à Marie",
  "Vous vivez à Bourg-sur-Mer (BSM)",
  // Navigateur
  "Bourg-sur-Mer a été fondée en 1832",
  "Bernard Dupuis est né le 14 avril 1967",
  "Vous êtes Bernard Dupuis, Maire de Bourg-sur-Mer",
  "Le jour du changement de mot de passe, Bernard a cherché comment taper un dièse (#)",
  // Mémos vocaux
  "Bernard aura 58 ans - né en 1967",
  "Date importante : mi-avril (anniversaire/mariage)",
  "32 ans de mariage en 2025 (marié en 1993)",
  // Calendrier
  "L'anniversaire de Bernard est le 14 avril, il aura 58 ans (né en 1967)",
  "Mariage en 1993, soit 32 ans en 2025",
  // Contacts
  "Bernard est né la veille de son anniversaire de mariage (15 avril), soit le 14 avril",
  // Calculatrice
  "La Calculatrice associe 1832 à « BSM » : l'année de fondation et les initiales de la ville",
  // Paramètres
  "Le nouveau mot de passe compte 17 caractères, dont 2 symboles",
  // Dossier confidentiel
  "Le dossier confidentiel contient des secrets compromettants",
];

// Détecteurs présents dans le code mais qu'aucun contenu ne déclenche
// (le texte recherché n'existe dans aucun document). Exclus du total.
export const UNREACHABLE_CLUES: readonly string[] = [
  "Bernard aura 58 ans", // Courrier : aucun email ne contient "58 ans"
  "Format MDP : initiales + année + symbole + date + ponctuation", // Courrier
  "Une référence à l'année 1967 dans un message vocal", // Mémos vocaux
  "Le mot de passe combine la fondation de la ville et la date de naissance", // Mémos vocaux
];

export const CLUE_TOTAL = CLUE_CATALOG.length;

export function isCatalogClue(text: string) {
  return CLUE_CATALOG.includes(text);
}
