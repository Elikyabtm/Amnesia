// Carnet d'adresses de Bernard. Cohérent avec l'histoire : Marie (née
// Laurent, mariage le 15/04/1993), parents Henri (1935-1982) et Françoise
// Martin (registre des naissances), frère Pierre, la Sénatrice (réunion du
// 21), Dr Martin (RDV du 13/02), Maurin (SCI Les Mouettes), Garnier (Le
// Phare) et Vidal (ancien préfet, photo de Monaco du 15 août 2022).

export type ContactGroup = "Famille" | "Mairie & politique" | "Santé" | "Affaires" | "Presse" | "Masqués";

export interface Contact {
  id: string;
  name: string;
  role: string;
  group: ContactGroup;
  phone?: string;
  email?: string;
  address?: string;
  birthday?: string;
  notes: string;
  /** Contact masqué : visible seulement une fois connecté, compte comme un secret */
  hidden?: boolean;
}

export const CONTACTS: Contact[] = [
  {
    id: "marie",
    name: "Marie Dupuis",
    role: "Épouse (née Laurent)",
    group: "Famille",
    phone: "06 12 41 59 93",
    email: "marie.dupuis@laposte.net",
    address: "4 rue des Goélands, Bourg-sur-Mer",
    notes:
      "Anniversaire de mariage le 15 avril (32 ans cette année !). Ne pas confondre : la veille, c'est le mien. Réservation au Phare faite.\nElle s'inquiète pour mon cœur : RDV cardiologue à ne pas rater.",
  },
  {
    id: "pierre",
    name: "Pierre Dupuis",
    role: "Frère",
    group: "Famille",
    phone: "06 77 02 18 64",
    email: "pierre.dupuis@orange.fr",
    notes: "Le petit frère. Il a retrouvé notre vieux carnet de codes secrets de la cabane... À rappeler.",
  },
  {
    id: "henri",
    name: "Henri Dupuis",
    role: "Papa (1935 - 1982)",
    group: "Famille",
    notes: "Ne pas supprimer.\n« N'oublie jamais d'où tu viens. BSM pour toujours. »",
  },
  {
    id: "francoise",
    name: "Françoise Dupuis",
    role: "Maman (née Martin)",
    group: "Famille",
    phone: "02 98 18 32 07",
    address: "Résidence Les Embruns, Bourg-sur-Mer",
    notes: "Appeler le dimanche après la messe.",
  },
  {
    id: "senatrice",
    name: "La Sénatrice",
    role: "Sénat — projet de loi maritime",
    group: "Mairie & politique",
    email: "cabinet.senatrice@senat.fr",
    notes: "Réunion le 21 février. Ne pas oublier l'écharpe tricolore cette fois !",
  },
  {
    id: "it",
    name: "Service informatique",
    role: "Mairie de Bourg-sur-Mer — poste 214",
    group: "Mairie & politique",
    phone: "02 98 18 32 14",
    email: "informatique@bourg-sur-mer.fr",
    notes: "M'ont aidé à changer de mot de passe le 3 février. Ils trouvaient l'ancien « bien trop simple ».",
  },
  {
    id: "musee",
    name: "Musée Maritime",
    role: "Direction",
    group: "Mairie & politique",
    email: "direction@musee-maritime-bourg.fr",
    notes: "Inauguration de l'exposition « Mémoires de la Mer » le 3 mars, 18h. Discours prévu.",
  },
  {
    id: "martin",
    name: "Dr Martin",
    role: "Cardiologue",
    group: "Santé",
    phone: "02 98 44 10 20",
    address: "Cabinet, 15 rue de la Santé, Bourg-sur-Mer",
    notes: "Contrôle annuel le 13 février à 14h. Apporter les dernières analyses.",
  },
  {
    id: "maurin",
    name: "Philippe Maurin",
    role: "Gérant — SCI Les Mouettes",
    group: "Affaires",
    phone: "06 09 15 08 22",
    email: "pm@sci-lesmouettes.fr",
    notes: "Projet « Les Jardins de la Mer ». Uniquement sur le portable personnel, jamais depuis la mairie.",
  },
  {
    id: "garnier",
    name: "Antoine Garnier",
    role: "Journaliste — Le Phare",
    group: "Presse",
    email: "a.garnier@le-phare-info.fr",
    notes: "Pose trop de questions sur les Jardins de la Mer. À surveiller.",
  },
  {
    id: "vidal",
    name: "J.-M. V.",
    role: "Ancien préfet",
    group: "Masqués",
    phone: "06 15 08 20 22",
    notes:
      "Jean-Marc Vidal. Ne jamais l'appeler depuis le bureau.\nMonaco, 15 août : l'enveloppe a été remise sur le yacht de Maurin. Ne JAMAIS en parler par écrit.",
    hidden: true,
  },
];

/** Note qui donne un indice (anniversaire la veille du mariage) */
export const CONTACT_CLUE = {
  contactId: "marie",
  text: "Bernard est né la veille de son anniversaire de mariage (15 avril), soit le 14 avril",
  highlight: "la veille, c'est le mien",
};
