// Game Data - Le Maire Bernard Dupuis
// Mot de passe à deviner : 183214Avril1967

export const CORRECT_PASSWORD = "183214Avril1967";

export interface FileItem {
  id: string;
  name: string;
  type: "folder" | "file" | "image" | "mail" | "audio";
  icon?: string;
  content?: string;
  children?: FileItem[];
  imageSrc?: string;
}

export const documents: FileItem[] = [
  {
    id: "doc1",
    name: "Discours_Officiel_21_02.txt",
    type: "file",
    content: `Mes chers concitoyens,

Aujourd'hui, nous célébrons l'inauguration du square Léon Blum, fruit d'un engagement commun et d'une volonté de bâtir une ville à notre image.

Souvenez-vous : l'unité, la culture, l'avenir. Voilà ce qui nous rassemble.

— Bernard Dupuis, Maire de Bourg-sur-Mer`
  },
  {
    id: "doc2",
    name: "Budget_Culture_2025.pdf",
    type: "file",
    content: `BUDGET CULTURE — Extrait

- Subvention Musée Maritime : 12 000€
- Rénovation du théâtre : 22 000€
- Inauguration statue Léon Blum : 14 500€

Signature : B. Dupuis`
  },
  {
    id: "doc3",
    name: "Discours_Anniversaire_Ville.txt",
    type: "file",
    content: `Extrait :

"Je suis né ici, comme mon père avant moi. Mon cœur bat pour cette ville depuis le 14 avril 1967, jour de ma naissance.

Cette ville est mon héritage et mon avenir."`
  }
];

export const photos: FileItem[] = [
  {
    id: "photo1",
    name: "photo_statue.jpg",
    type: "image",
    imageSrc: "/images/photo_statue.jpg",
    content: `Statue de Léon Blum sous la pluie.

Le maire tient un parapluie rouge. Derrière lui, un enfant lève une pancarte : "Bourg-sur-Mer, notre fierté depuis 1832."`
  },
  {
    id: "photo2",
    name: "photo_discours_anniversaire.jpg",
    type: "image",
    imageSrc: "/images/photo_anniversaire.jpg",
    content: `Bernard, costume bleu nuit, discours à la main.

Sur le pupitre : une étiquette "14 AVRIL – 58 ans".
Ballons bleus et blancs partout.`
  },
  {
    id: "photo3",
    name: "photo_musee_maritime.jpg",
    type: "image",
    imageSrc: "/images/photo_musee.jpg",
    content: `Visite officielle au Musée Maritime de Bourg-sur-Mer.

Exposition "Mémoires de la Mer - 1832-2025"`
  }
];

export const corbeille: FileItem[] = [
  {
    id: "trash1",
    name: "Discours_Rejeté.txt",
    type: "file",
    content: `Trop personnel. Trop de références aux dates.
Trop nostalgique.

Garder en tête pour un futur discours d'adieu ?`
  },
  {
    id: "trash2",
    name: "Notes_MDP_ancien.txt",
    type: "file",
    content: `ANCIEN MOT DE PASSE (ne plus utiliser) :

"Bourg1832"

Trop simple. Changé pour quelque chose de plus personnel.
Nouveau format : [fondation ville] + [date naissance]`
  }
];

export const mails: FileItem[] = [
  {
    id: "mail1",
    name: "Sénatrice - Projet loi maritime",
    type: "mail",
    content: `De : La Sénatrice
Objet : Projet loi maritime
Date : 18 février 2025

Bernard,

Je te joins les documents demandés. On se retrouve le 21 pour l'inauguration.

Toujours aussi ponctuel, hein ? Et pense à laisser ton écharpe tricolore cette fois 😉

— La Sénatrice`
  },
  {
    id: "mail2",
    name: "Musée Maritime - Invitation",
    type: "mail",
    content: `De : Direction du Musée Maritime
Objet : Invitation officielle
Date : 10 février 2025

Monsieur le Maire,

Vous êtes convié à l'exposition "Mémoires de la Mer – 1832-2025", retraçant l'histoire de notre ville portuaire.

Inauguration prévue le 3 mars à 18h.

Cordialement,
Le Conservateur`
  },
  {
    id: "mail3",
    name: "Marie - Rendez-vous médecin",
    type: "mail",
    content: `De : Marie (épouse)
Objet : RDV médecin
Date : 12 février 2025

Bernard,

N'oublie pas ton rendez-vous chez le cardiologue demain à 14h.
Tu travailles trop. Pense à toi aussi.

Je t'aime.
Marie`
  },
  {
    id: "mail4",
    name: "Rappel - Anniversaire mariage",
    type: "mail",
    content: `De : Rappel automatique
Objet : Anniversaire de mariage
Date : 1er avril 2025

RAPPEL : Votre anniversaire de mariage est dans 2 semaines.
32 ans ensemble !

N'oubliez pas de réserver au restaurant Le Phare.`
  }
];

export const notes: FileItem[] = [
  {
    id: "note1",
    name: "Notes personnelles.txt",
    type: "file",
    content: `Idées pour le discours du 14 avril :

- Remercier Marie pour ces 32 ans
- Évoquer papa et son engagement pour la ville
- Parler de l'avenir, des jeunes
- Ne pas trop s'épancher sur l'âge (58 ans déjà...)`
  },
  {
    id: "note2",
    name: "Liste_courses.txt",
    type: "file",
    content: `Pour l'anniversaire :
- Champagne (Marie aime le Veuve Clicquot)
- Fleurs
- Réserver restaurant
- Cadeau ??`
  },
  {
    id: "note3",
    name: "Aide_memoire_MDP.txt",
    type: "file",
    content: `AIDE-MÉMOIRE

Format du nouveau mot de passe :
[Fondation de la ville] + [Ma date de naissance complète]

Ainsi je n'oublierai jamais d'où je viens.`
  }
];

export const audioMemos: FileItem[] = [
  {
    id: "audio1",
    name: "memo_vocal_03_02.wav",
    type: "audio",
    content: `[Transcription du mémo vocal]

"Note à moi-même : penser à appeler le préfet avant le 14.
L'inauguration doit être parfaite. C'est mon anniversaire après tout...
58 ans. Le temps passe si vite depuis 1967..."`
  }
];

export const calendarEvents = [
  { date: "14 avril 2025", event: "Anniversaire Bernard - 58 ans", important: true },
  { date: "15 avril 2025", event: "Anniversaire de mariage - 32 ans" },
  { date: "21 février 2025", event: "Inauguration Square Léon Blum" },
  { date: "3 mars 2025", event: "Exposition Musée Maritime" },
  { date: "13 février 2025", event: "RDV Cardiologue 14h" }
];

// Browser history and web pages
export interface BrowserPage {
  id: string;
  url: string;
  title: string;
  content: string;
  visitedAt: string;
}

export const browserHistory: BrowserPage[] = [
  {
    id: "web1",
    url: "www.bourg-sur-mer.fr/histoire",
    title: "Histoire de Bourg-sur-Mer - Site Officiel",
    visitedAt: "10 février 2025",
    content: `HISTOIRE DE BOURG-SUR-MER

Fondee en 1832, Bourg-sur-Mer est une commune cotiere du littoral francais.

DATES CLES :
- 1832 : Fondation officielle de la commune
- 1856 : Construction du premier phare
- 1902 : Inauguration du port de peche
- 1967 : Ouverture du Musee Maritime
- 2015 : Election de Bernard Dupuis comme maire

PATRIMOINE :
La ville est connue pour son patrimoine maritime exceptionnel et sa statue de Leon Blum, inauguree en 2020.

Population : 12 450 habitants
Maire actuel : Bernard Dupuis (depuis 2015)`
  },
  {
    id: "web2",
    url: "www.bourg-sur-mer.fr/mairie/equipe",
    title: "L'equipe municipale - Mairie de Bourg-sur-Mer",
    visitedAt: "8 février 2025",
    content: `L'EQUIPE MUNICIPALE

MAIRE : Bernard Dupuis
Ne le 14 avril 1967 a Bourg-sur-Mer
Elu maire en 2015, reelu en 2020

"Je suis ne dans cette ville, j'y ai grandi, et j'ai l'honneur de la servir aujourd'hui."

PARCOURS :
- 1989 : Diplome de Sciences Politiques
- 1993 : Conseiller municipal
- 2008 : Premier adjoint
- 2015 : Elu maire

PRIORITES DU MANDAT :
- Preservation du patrimoine maritime
- Developpement du tourisme culturel
- Soutien aux associations locales`
  },
  {
    id: "web3",
    url: "www.musee-maritime-bourg.fr",
    title: "Musee Maritime de Bourg-sur-Mer",
    visitedAt: "5 février 2025",
    content: `MUSEE MARITIME DE BOURG-SUR-MER

Exposition actuelle : "Memoires de la Mer - 1832-2025"
Du 3 mars au 30 juin 2025

Cette exposition retrace l'histoire maritime de notre ville depuis sa fondation en 1832.

HORAIRES :
Mardi - Dimanche : 10h - 18h
Ferme le lundi

TARIFS :
Adultes : 8€
Etudiants : 5€
Gratuit pour les moins de 12 ans

INAUGURATION OFFICIELLE :
Le 3 mars 2025 a 18h en presence de M. le Maire Bernard Dupuis`
  },
  {
    id: "web4",
    url: "www.pagesjaunes.fr/bernard-dupuis",
    title: "Bernard DUPUIS - Pages Jaunes",
    visitedAt: "3 février 2025",
    content: `BERNARD DUPUIS

Profession : Maire
Adresse : Mairie de Bourg-sur-Mer
12 Place de la Republique
33120 Bourg-sur-Mer

Telephone : 05 XX XX XX XX
Email : maire@bourg-sur-mer.fr

Informations complementaires :
Date de naissance : 14/04/1967
Lieu de naissance : Bourg-sur-Mer`
  }
];

// Voice messages data
export interface VoiceMessage {
  id: string;
  name: string;
  audioSrc: string;
  date: string;
  transcript: string;
  from: string;
}

export const voiceMessages: VoiceMessage[] = [
  {
    id: "voice1",
    name: "message_marie_12_02.mp3",
    audioSrc: "/audio/marie.mp3",
    date: "12 fevrier 2025",
    from: "Marie (epouse)",
    transcript: `[Message vocal de Marie]

"Bernard, c'est moi. N'oublie pas ton rendez-vous chez le cardiologue demain a 14h. 
Je sais que tu travailles beaucoup en ce moment avec l'inauguration qui approche, mais ta sante est importante.

Ah, et j'ai reserve au restaurant Le Phare pour notre anniversaire de mariage le 15 avril. 
32 ans deja... Le temps passe si vite depuis 1993.

Je t'aime. A ce soir."`
  },
  {
    id: "voice2",
    name: "message_prefet_18_02.mp3",
    audioSrc: "/audio/prefet.mp3",
    date: "18 fevrier 2025",
    from: "Cabinet du Prefet",
    transcript: `[Message vocal du Cabinet du Prefet]

"Monsieur le Maire, ici le cabinet du Prefet.
Je vous confirme la presence de Monsieur le Prefet a l'inauguration du square Leon Blum le 21 fevrier.

Le protocole prevoit votre discours a 15h, suivi de la coupe du ruban.
N'oubliez pas votre echarpe tricolore cette fois-ci... 

Le Prefet m'a egalement demande de vous transmettre ses felicitations anticipees pour votre anniversaire le mois prochain. 
58 ans, c'est un bel age pour un maire aussi dynamique.

Cordialement."`
  },
  {
    id: "voice3",
    name: "memo_personnel_03_02.mp3",
    audioSrc: "/audio/moimeme.mp3",
    date: "3 fevrier 2025",
    from: "Moi-meme",
    transcript: `[Memo vocal personnel]

"Note a moi-meme : penser a changer le mot de passe de l'ordinateur.
L'ancien etait trop simple, juste le nom de la ville et la date de fondation.

Le nouveau doit etre plus personnel... quelque chose qui me rappelle d'ou je viens.
La fondation de la ville, ma date de naissance... oui, ca c'est bien.
Comme ca je n'oublierai jamais mes racines."`
  }
];

// File metadata for properties dialog
export interface FileMetadata {
  name: string;
  type: string;
  size: string;
  created: string;
  modified: string;
  author?: string;
  location: string;
}

export const fileMetadata: Record<string, FileMetadata> = {
  "doc1": {
    name: "Discours_Officiel_21_02.txt",
    type: "Document texte",
    size: "2.4 Ko",
    created: "15 février 2025, 09:32",
    modified: "20 février 2025, 14:15",
    author: "Bernard Dupuis",
    location: "C:\\Users\\BDupuis\\Documents"
  },
  "doc2": {
    name: "Budget_Culture_2025.pdf",
    type: "Document PDF",
    size: "156 Ko",
    created: "5 janvier 2025, 11:00",
    modified: "10 février 2025, 16:45",
    author: "Service Comptabilite - Mairie",
    location: "C:\\Users\\BDupuis\\Documents"
  },
  "doc3": {
    name: "Discours_Anniversaire_Ville.txt",
    type: "Document texte",
    size: "1.8 Ko",
    created: "14 avril 2024, 08:00",
    modified: "14 avril 2024, 10:30",
    author: "Bernard Dupuis - Ne le 14/04/1967",
    location: "C:\\Users\\BDupuis\\Documents"
  },
  "note3": {
    name: "Aide_memoire_MDP.txt",
    type: "Document texte",
    size: "0.5 Ko",
    created: "3 février 2025, 19:45",
    modified: "3 février 2025, 19:48",
    author: "BDupuis",
    location: "C:\\Users\\BDupuis\\Notes"
  }
};

export const fileSystem: FileItem[] = [
  {
    id: "documents",
    name: "Documents",
    type: "folder",
    children: documents
  },
  {
    id: "photos",
    name: "Photos",
    type: "folder",
    children: photos
  },
  {
    id: "notes",
    name: "Notes",
    type: "folder",
    children: notes
  },
  {
    id: "audio",
    name: "Mémos vocaux",
    type: "folder",
    children: audioMemos
  }
];
