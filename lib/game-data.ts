// Game Data - Le Maire Bernard Dupuis
// 
// NIVEAU 1 - Compte Invité: "Bourg1832" (ancien mot de passe simple)
// NIVEAU 2 - Compte Admin: "BSM1832#14041967!"
// Format Admin: [Initiales ville] + [Année fondation] + # + [Date naissance JJMMAAAA] + !

export const GUEST_PASSWORD = "Bourg1832";
export const ADMIN_PASSWORD = "BSM1832#14041967!";

// Code PIN pour accéder à la corbeille (date de mariage inversée)
export const TRASH_PIN = "3991"; // 1993 inversé

// Code pour le dossier confidentiel (année élection maire)
export const CONFIDENTIAL_PIN = "2015";

// Seuils de suspicion
export const SUSPICION_THRESHOLDS = {
  WARNING: 50,      // Alerte de sécurité
  DANGER: 75,       // Écran de surveillance
  LOCKOUT: 100,     // Blocage temporaire
};

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
  },
  {
    id: "doc4",
    name: "Notes_Reunion_Securite.txt",
    type: "file",
    content: `RÉUNION SÉCURITÉ INFORMATIQUE - 28/01/2025

Présents : B. Dupuis, Service IT

Recommandations pour les mots de passe :
- Minimum 8 caractères
- Mélanger majuscules et minuscules
- Inclure des chiffres et symboles

EXEMPLE DE FORMAT SUGGÉRÉ :
Prénom + Année + Symbole
Ex: Bernard1967!

Note: Le maire a choisi un format différent, plus personnel.`
  },
  {
    id: "doc5",
    name: "Historique_Connexions.txt",
    type: "file",
    content: `JOURNAL DES CONNEXIONS - Février 2025

03/02 - 08:15 - Connexion réussie (nouveau MDP)
03/02 - 08:12 - Échec connexion (ancien MDP: Bourg1832)
03/02 - 08:10 - Échec connexion (BDupuis1967)
02/02 - 18:30 - Déconnexion
02/02 - 09:00 - Connexion réussie

Note système: L'utilisateur a changé son mot de passe le 03/02/2025.
Nouveau format détecté: Alphanumérique + Symboles`
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

Trop simple, trop évident.
Le nouveau suit un format plus sécurisé :
- Initiales + année importante + séparateur + date clé + ponctuation

Note: j'ai choisi le dièse (#) comme séparateur car j'adore la musique.
Le point d'exclamation final, c'est ma petite touche de fierté !`
  },
  {
    id: "trash3",
    name: "Brouillon_format_MDP.txt",
    type: "file",
    content: `Réflexions sur la sécurité...

Un bon mot de passe doit combiner :
- Des lettres (mes initiales de lieu préféré ?)
- Des chiffres (dates importantes)
- Des symboles (# et !)

Format retenu : ABC1234#12345678!
Où ABC = lieu, 1234 = fondation, 12345678 = naissance en JJMMAAAA`
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
  },
  {
    id: "mail5",
    name: "Service IT - Votre nouveau mot de passe",
    type: "mail",
    content: `De : Service Informatique Mairie
Objet : Confirmation changement de mot de passe
Date : 3 février 2025

Monsieur le Maire,

Votre mot de passe a été modifié avec succès.

Pour rappel, voici les bonnes pratiques :
- Ne jamais partager son mot de passe
- Éviter les dates de naissance seules
- Combiner lettres, chiffres et symboles

Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement.

Note: Nous avons détecté que votre nouveau mot de passe contient un symbole musical (#). 
Excellente idée pour la mémorisation !

Cordialement,
Le Service IT`
  },
  {
    id: "mail6",
    name: "Pierre (frère) - Souvenir d'enfance",
    type: "mail",
    content: `De : Pierre Dupuis
Objet : Tu te souviens ?
Date : 5 février 2025

Bernard,

Je suis tombé sur une vieille photo de nous devant la mairie, en 1975.
Tu avais 8 ans, moi 12. Papa venait d'être élu conseiller.

Tu te souviens de notre code secret pour la cabane ?
C'était ton année de naissance à l'envers : 7691 !
On se croyait tellement malins...

Bon courage pour l'inauguration.

Pierre

PS: Marie m'a dit que vous fêtez bientôt vos 32 ans de mariage. Déjà !`
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
    name: "Enigme_perso.txt",
    type: "file",
    content: `Petit pense-bête cryptique...

Trois lettres pour ma terre natale,
Quatre chiffres pour son commencement,
Un symbole de musique entre les deux mondes,
Huit chiffres pour le jour où tout a commencé pour moi,
Et le point final qui crie victoire.

Mon coeur bat pour BSM depuis toujours.`
  },
  {
    id: "note4",
    name: "Anciens_MDP_rejetes.txt",
    type: "file",
    content: `LISTE DES MOTS DE PASSE REJETÉS :

- Bourg1832 (trop simple)
- Bernard14041967 (trop évident)
- Maire2015BSM (pas assez personnel)
- 14Avril67! (manque le lieu)
- BSM@1967! (mauvais format de date)
- BourgSurMer1832 (trop long)

Le bon format doit inclure :
1. Abréviation du lieu (3 lettres)
2. Année de fondation
3. Séparateur musical
4. Date complète (8 chiffres)
5. Ponctuation finale`
  },
  {
    id: "note5",
    name: "Codes_divers.txt",
    type: "file",
    content: `CODES À RETENIR :

- Code alarme maison : 1967 (mon année)
- Code garage mairie : 2015 (élection)
- Code wifi maison : BourgSurMer33
- Code carte bancaire : XXXX (ne pas noter !)
- Digicode bureau : 1832

ATTENTION : Ne pas confondre avec le code de la corbeille !
Celui-là c'est Marie qui l'a choisi... notre année spéciale, mais à l'envers.`
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

Fondée en 1832, Bourg-sur-Mer est une commune côtière du littoral français.

DATES CLÉS :
- 1832 : Fondation officielle de la commune
- 1856 : Construction du premier phare
- 1902 : Inauguration du port de pêche
- 1967 : Ouverture du Musée Maritime
- 2015 : Élection de Bernard Dupuis comme maire

PATRIMOINE :
La ville est connue pour son patrimoine maritime exceptionnel et sa statue de Léon Blum, inaugurée en 2020.

Population : 12 450 habitants
Maire actuel : Bernard Dupuis (depuis 2015)`
  },
  {
    id: "web2",
    url: "www.bourg-sur-mer.fr/mairie/equipe",
    title: "L'équipe municipale - Mairie de Bourg-sur-Mer",
    visitedAt: "8 février 2025",
    content: `L'ÉQUIPE MUNICIPALE

MAIRE : Bernard Dupuis
Né le 14 avril 1967 à Bourg-sur-Mer
Élu maire en 2015, réélu en 2020

"Je suis né dans cette ville, j'y ai grandi, et j'ai l'honneur de la servir aujourd'hui."

PARCOURS :
- 1989 : Diplôme de Sciences Politiques
- 1993 : Conseiller municipal
- 2008 : Premier adjoint
- 2015 : Élu maire

PRIORITÉS DU MANDAT :
- Préservation du patrimoine maritime
- Développement du tourisme culturel
- Soutien aux associations locales`
  },
  {
    id: "web3",
    url: "www.musee-maritime-bourg.fr",
    title: "Musée Maritime de Bourg-sur-Mer",
    visitedAt: "5 février 2025",
    content: `MUSÉE MARITIME DE BOURG-SUR-MER

Exposition actuelle : "Mémoires de la Mer - 1832-2025"
Du 3 mars au 30 juin 2025

Cette exposition retrace l'histoire maritime de notre ville depuis sa fondation en 1832.

HORAIRES :
Mardi - Dimanche : 10h - 18h
Fermé le lundi

TARIFS :
Adultes : 8€
Étudiants : 5€
Gratuit pour les moins de 12 ans

INAUGURATION OFFICIELLE :
Le 3 mars 2025 à 18h en présence de M. le Maire Bernard Dupuis`
  },
  {
    id: "web4",
    url: "www.pagesjaunes.fr/bernard-dupuis",
    title: "Bernard DUPUIS - Pages Jaunes",
    visitedAt: "3 février 2025",
    content: `BERNARD DUPUIS

Profession : Maire
Adresse : Mairie de Bourg-sur-Mer
12 Place de la République
33120 Bourg-sur-Mer

Téléphone : 05 XX XX XX XX
Email : maire@bourg-sur-mer.fr

Informations complémentaires :
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
    date: "12 février 2025",
    from: "Marie (épouse)",
    transcript: `[Message vocal de Marie]

"Bernard, c'est moi. N'oublie pas ton rendez-vous chez le cardiologue demain à 14h. 
Je sais que tu travailles beaucoup en ce moment avec l'inauguration qui approche, mais ta santé est importante.

Ah, et j'ai réservé au restaurant Le Phare pour notre anniversaire de mariage le 15 avril. 
32 ans déjà... Le temps passe si vite depuis 1993.

Je t'aime. À ce soir."`
  },
  {
    id: "voice2",
    name: "message_prefet_18_02.mp3",
    audioSrc: "/audio/prefet.mp3",
    date: "18 février 2025",
    from: "Cabinet du Préfet",
    transcript: `[Message vocal du Cabinet du Préfet]

"Monsieur le Maire, ici le cabinet du Préfet.
Je vous confirme la présence de Monsieur le Préfet à l'inauguration du square Léon Blum le 21 février.

Le protocole prévoit votre discours à 15h, suivi de la coupe du ruban.
N'oubliez pas votre écharpe tricolore cette fois-ci... 

Le Préfet m'a également demandé de vous transmettre ses félicitations anticipées pour votre anniversaire le mois prochain. 
58 ans, c'est un bel âge pour un maire aussi dynamique.

Cordialement."`
  },
  {
    id: "voice3",
    name: "memo_personnel_03_02.mp3",
    audioSrc: "/audio/moimeme.mp3",
    date: "3 février 2025",
    from: "Moi-même",
    transcript: `[Mémo vocal personnel]

"Note à moi-même : le nouveau mot de passe est en place.
J'ai suivi les conseils du service informatique : lettres, chiffres, symboles.

Les trois lettres de ma ville d'abord... BSM, comme sur les plaques d'immatriculation d'antan.
Puis l'année où tout a commencé pour Bourg-sur-Mer.
Le dièse, parce que j'aime la musique.
Ma date de naissance complète, jour mois année, tout collé.
Et le point d'exclamation final, parce que je suis fier de mes origines !

Ah, et j'ai mis un code sur la corbeille aussi. L'année de notre mariage, mais à l'envers. Marie va adorer cette idée romantique..."`
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
    author: "Service Comptabilité - Mairie",
    location: "C:\\Users\\BDupuis\\Documents"
  },
  "doc3": {
    name: "Discours_Anniversaire_Ville.txt",
    type: "Document texte",
    size: "1.8 Ko",
    created: "14 avril 2024, 08:00",
    modified: "14 avril 2024, 10:30",
    author: "Bernard Dupuis - Né le 14/04/1967",
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

// Fichiers secrets - accessibles uniquement en mode admin
export const secretDocuments: FileItem[] = [
  {
    id: "secret1",
    name: "Contrat_Promoteur_CONFIDENTIEL.pdf",
    type: "file",
    content: `CONTRAT CONFIDENTIEL
PROJET IMMOBILIER "LES JARDINS DE LA MER"

Entre :
- M. Bernard Dupuis, Maire de Bourg-sur-Mer
- SCI Les Mouettes (Gérant: Philippe Maurin)

CLAUSES SPÉCIALES :
- Terrain communal vendu à 40% en dessous du prix du marché
- En échange: Appartement T4 vue mer (lot 12B) au nom de Mme Marie Dupuis
- Commission de "facilitation" : 85 000 EUR versée sur compte suisse

ATTENTION : Document à détruire après signature.

Signé le 14 mars 2019`
  },
  {
    id: "secret2",
    name: "Mail_Menaces_Journaliste.txt",
    type: "file",
    content: `De : Bernard Dupuis <bdupuis@bourg-sur-mer.fr>
A : redaction@le-phare-info.fr
Date : 22 janvier 2025
Objet : Votre "enquête"

Monsieur Garnier,

Je vous conseille fortement d'abandonner votre soi-disant enquête sur le projet des Jardins de la Mer.

Votre journal dépend des subventions municipales. Il serait dommage qu'elles soient... réexaminées.

Je connais aussi votre situation familiale. Votre femme travaille à la bibliothèque municipale, n'est-ce pas ?

Réfléchissez bien.

B. Dupuis`
  },
  {
    id: "secret3",
    name: "Comptes_Offshore.xlsx",
    type: "file",
    content: `RELEVÉ - COMPTE PRIVÉ SUISSE
Banque Helvetia - Genève
Titulaire : B.D. Consulting SA

MOUVEMENTS 2019-2024 :

03/2019 : +85 000 EUR (Virement SCI Les Mouettes)
06/2019 : +45 000 EUR (Consultation urbanisme)
11/2020 : +120 000 EUR (Projet marina - commission)
03/2022 : +67 000 EUR (Contrat déchets)
09/2023 : +93 000 EUR (Attribution marché voirie)

SOLDE ACTUEL : 847 230 EUR

Note : Transferts mensuels de 5000 EUR vers compte français
       (déclarés comme "revenus de conseil")`
  },
  {
    id: "secret4",
    name: "Photo_Compromettante.jpg",
    type: "image",
    imageSrc: "/images/photo_compromettante.jpg",
    content: `[PHOTO - Monaco, 15 août 2022]

Bernard Dupuis sur un yacht luxueux avec Philippe Maurin (promoteur immobilier) et Jean-Marc Vidal (préfet de l'époque).

Champagne, cigares. À l'arrière-plan : mallette ouverte contenant des liasses de billets.

Métadonnées : iPhone 13 Pro - Localisation Monaco
Photographe : Inconnu (photo volée ?)`
  },
  {
    id: "secret5",
    name: "Testament_Secret.txt",
    type: "file",
    content: `INSTRUCTIONS EN CAS DE DÉCÈS OU D'ARRESTATION

Marie,

Si tu lis ceci, c'est que les choses ont mal tourné.

Le coffre à la banque (code 1832-1967) contient :
- 200 000 EUR en liquide
- Les vrais documents du projet Jardins de la Mer
- Une clé USB avec toutes les preuves contre Maurin et Vidal

IMPORTANT : Ces preuves sont mon assurance-vie. Si je tombe, ils tombent avec moi.

Le mot de passe du coffre-fort numérique est le même que celui de cet ordinateur, mais SANS le dièse et avec "@" à la place.

Pardonne-moi pour tout ça. J'ai voulu assurer notre avenir, mais je me suis perdu en chemin.

Je t'aime.
Bernard

PS: Le vrai responsable de la mort de papa en 1982... c'était un accident, mais Maurin a couvert l'affaire. C'est comme ça que tout a commencé.`
  }
];

// Emails secrets visibles uniquement en mode admin
export const secretMails: FileItem[] = [
  {
    id: "secretmail1",
    name: "[URGENT] Journaliste - Dernières preuves",
    type: "mail",
    content: `De : Antoine Garnier <a.garnier@le-phare-info.fr>
Objet : Je sais tout
Date : 15 février 2025

Monsieur le Maire,

Vos menaces ne m'arrêteront pas.

J'ai obtenu les relevés de votre compte suisse. J'ai les photos de Monaco.
J'ai même retrouvé le dossier sur la mort de votre père en 1982.

Publication prévue le 25 février.

Vous avez une semaine pour démissionner ou je publie tout.

A. Garnier`
  },
  {
    id: "secretmail2",
    name: "Philippe M. - Problème urgent",
    type: "mail",
    content: `De : Philippe Maurin <pm@sci-lesmouettes.fr>
Objet : URGENT - Le journaliste
Date : 16 février 2025

Bernard,

Ce Garnier devient un vrai problème.

J'ai contacté nos amis. Ils proposent une "solution définitive" pour 50k.

Dis-moi si tu veux qu'on avance.

Philippe

PS: Détruis ce message immédiatement.`
  }
];

// Dossier confidentiel (accessible après PIN)
export const confidentialFolder: FileItem = {
  id: "confidential",
  name: "Dossier Confidentiel",
  type: "folder",
  children: secretDocuments
};

// Combine mails with secrets for admin mode
export const allMails = [...mails, ...secretMails];

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
  },
  confidentialFolder
];
