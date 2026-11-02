// Questions de sécurité du service informatique (événement "Activité
// inhabituelle détectée"). Chaque question est liée aux indices qui
// permettent d'y répondre : on ne pose que des questions dont le joueur a
// déjà trouvé un indice. Aucune ne demande directement le mot de passe.

export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string;
  wrong: [string, string, string];
  /** Indices (textes du catalogue) qui permettent d'y répondre */
  clues: string[];
}

export const SECURITY_QUESTIONS: SecurityQuestion[] = [
  {
    id: "birthdate",
    question: "Quelle est votre date de naissance ?",
    answer: "14 avril 1967",
    wrong: ["15 avril 1967", "14 avril 1976", "4 octobre 1967"],
    clues: ["Date de naissance : 14 avril 1967", "Bernard Dupuis est né le 14 avril 1967"],
  },
  {
    id: "birthyear",
    question: "En quelle année êtes-vous né ?",
    answer: "1967",
    wrong: ["1976", "1957", "1969"],
    clues: ["Une référence à l'année 1967 dans un message vocal", "Bernard aura 58 ans - né en 1967", "L'anniversaire de Bernard est le 14 avril, il aura 58 ans (né en 1967)"],
  },
  {
    id: "age",
    question: "Quel âge aurez-vous à votre prochain anniversaire ?",
    answer: "58 ans",
    wrong: ["57 ans", "59 ans", "62 ans"],
    clues: ["Bernard aura 58 ans", "Bernard aura 58 ans - né en 1967", "L'anniversaire de Bernard est le 14 avril, il aura 58 ans (né en 1967)"],
  },
  {
    id: "birthday-month",
    question: "Quel jour fêtez-vous votre anniversaire ?",
    answer: "Le 14 avril",
    wrong: ["Le 15 avril", "Le 21 février", "Le 3 mars"],
    clues: ["Bernard est né la veille de son anniversaire de mariage (15 avril), soit le 14 avril", "Date importante : mi-avril (anniversaire/mariage)", "Une date importante en avril (anniversaire ou mariage)"],
  },
  {
    id: "founding",
    question: "En quelle année votre ville a-t-elle été fondée ?",
    answer: "1832",
    wrong: ["1856", "1902", "1823"],
    clues: ["Bourg-sur-Mer fondée en 1832", "Bourg-sur-Mer a été fondée en 1832", "La Calculatrice associe 1832 à « BSM » : l'année de fondation et les initiales de la ville"],
  },
  {
    id: "initials",
    question: "Que signifient les initiales « BSM » ?",
    answer: "Bourg-sur-Mer",
    wrong: ["Banque Suisse Maurin", "Bureau du Service Municipal", "Bernard Simon Martin"],
    clues: [
      "BSM = initiales de Bourg-sur-Mer",
      "Vous vivez à Bourg-sur-Mer (BSM)",
      "Les records du Démineur sont signés « BSM », les initiales de Bourg-sur-Mer",
      "La Calculatrice associe 1832 à « BSM » : l'année de fondation et les initiales de la ville",
    ],
  },
  {
    id: "job",
    question: "Quelle fonction occupez-vous ?",
    answer: "Maire de Bourg-sur-Mer",
    wrong: ["Premier adjoint", "Préfet", "Directeur du Musée Maritime"],
    clues: ["Vous êtes le Maire de Bourg-sur-Mer", "Vous êtes Bernard Dupuis, Maire de Bourg-sur-Mer"],
  },
  {
    id: "name",
    question: "Quel est votre nom complet ?",
    answer: "Bernard Dupuis",
    wrong: ["Bernard Durand", "Pierre Dupuis", "Henri Dupuis"],
    clues: ["Votre nom est Bernard Dupuis", "Vous êtes Bernard Dupuis, Maire de Bourg-sur-Mer"],
  },
  {
    id: "wife",
    question: "Comment s'appelle votre épouse ?",
    answer: "Marie",
    wrong: ["Françoise", "Josiane", "Sophie"],
    clues: ["Vous êtes marié à Marie", "Date de mariage : 15 avril 1993"],
  },
  {
    id: "wedding",
    question: "En quelle année vous êtes-vous marié ?",
    answer: "1993",
    wrong: ["1991", "1983", "2003"],
    clues: ["Date de mariage : 15 avril 1993", "Marié depuis longtemps (mariage en 1993)", "Mariage en 1993, soit 32 ans en 2025", "32 ans de mariage en 2025 (marié en 1993)"],
  },
  {
    id: "old-password",
    question: "Pourquoi le service informatique vous a-t-il fait changer de mot de passe ?",
    answer: "L'ancien était trop simple",
    wrong: ["Il avait expiré", "Votre compte avait été piraté", "Vous l'aviez oublié"],
    clues: ["L'ancien mot de passe était 'Bourg1832' - trop simple", "L'ancien mot de passe était trop simple"],
  },
  {
    id: "it-help",
    question: "Qui vous a aidé à changer de mot de passe le 3 février ?",
    answer: "Le service informatique",
    wrong: ["La préfecture", "Le Comité des fêtes", "Votre frère Pierre"],
    clues: [
      "Le nouveau mot de passe compte 17 caractères, dont 2 symboles",
      "Format MDP : initiales + année + symbole + date + ponctuation",
      "Le mot de passe combine la fondation de la ville et la date de naissance",
      "Format du mot de passe : [fondation ville] + [date naissance]",
    ],
  },
  {
    id: "music",
    question: "Quel festival soutenez-vous chaque été sur le port ?",
    answer: "Le Festival Jazz BSM",
    wrong: ["La Fête du Phare", "Les Nuits du Rock", "Le Festival des Marins"],
    clues: [
      "Bernard aime « toujours finir sur un point d'exclamation ! », même ses mots de passe",
      "Pense-bête dans Paint : sur le clavier, le dièse (#) se tape avec AltGr + 3",
      "Le jour du changement de mot de passe, Bernard a cherché comment taper un dièse (#)",
    ],
  },
];

/** Questions auxquelles le joueur peut répondre avec les indices trouvés */
export function availableSecurityQuestions(foundClues: string[]) {
  return SECURITY_QUESTIONS.filter((q) => q.clues.some((c) => foundClues.includes(c)));
}
