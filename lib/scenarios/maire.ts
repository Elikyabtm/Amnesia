import type { Scenario } from "./types";

export const maireBernardDupuis: Scenario = {
  id: "maire-bernard-dupuis",
  character: {
    id: "bernard-dupuis",
    name: "Bernard Dupuis",
    profession: "Maire",
    description: "Maire de Bourg-sur-Mer depuis 2015, un homme respecté... en apparence.",
    difficulty: "moyen",
    theme: "#1a365d", // Bleu marine officiel
  },
  passwords: {
    guest: "Bourg1832",
    admin: "BSM1832#14041967!",
  },
  pins: {
    trash: "3991",
    trashHint: "Année du mariage, mais à l'envers...",
    confidential: "2015",
    confidentialHint: "L'année où j'ai été élu maire",
  },
  documents: [
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
  ],
  photos: [
    {
      id: "photo1",
      name: "Inauguration_Statue_2020.jpg",
      type: "image",
      imageSrc: "/images/photo_statue.jpg",
      content: "Photo de l'inauguration de la statue de Léon Blum - Bernard Dupuis sous la pluie avec un parapluie rouge"
    },
    {
      id: "photo2",
      name: "Anniversaire_58ans.jpg",
      type: "image",
      imageSrc: "/images/photo_anniversaire.jpg",
      content: "Photo d'anniversaire - 14 avril - Bernard Dupuis fête ses 58 ans"
    },
    {
      id: "photo3",
      name: "Visite_Musee_Maritime.jpg",
      type: "image",
      imageSrc: "/images/photo_musee.jpg",
      content: "Visite du Musée Maritime - Exposition Mémoires de la Mer 1832-2025"
    },
  ],
  notes: [
    {
      id: "note1",
      name: "Liste_Courses.txt",
      type: "file",
      content: `- Pain
- Lait
- Fleurs pour Marie (anniversaire de mariage bientôt !)
- Réserver restaurant Le Phare`
    },
    {
      id: "note2",
      name: "Idees_Discours.txt",
      type: "file",
      content: `Thèmes à aborder :
- Notre histoire commune depuis 1832
- L'avenir de Bourg-sur-Mer
- Remerciements au conseil municipal`
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

Mon cœur bat pour BSM depuis toujours.`
    },
  ],
  mails: [
    {
      id: "mail1",
      name: "Invitation Inauguration",
      type: "mail",
      content: `De : Cabinet du Préfet
Objet : Inauguration Square Léon Blum
Date : 10 février 2025

Monsieur le Maire,

J'ai l'honneur de vous confirmer la présence de Monsieur le Préfet à l'inauguration du square Léon Blum le 21 février prochain.

Cordialement,
Le Cabinet`
    },
    {
      id: "mail2",
      name: "Marie - Rappel RDV cardiologue",
      type: "mail",
      content: `De : Marie Dupuis
Objet : N'oublie pas !
Date : 12 février 2025

Bernard,

N'oublie pas ton rendez-vous chez le cardiologue demain à 14h.
Tu travailles trop en ce moment.

Je t'aime,
Marie

PS: 32 ans de mariage cette année ! Le temps passe si vite depuis 1993...`
    },
  ],
  audioMemos: [
    {
      id: "voice1",
      name: "memo_personnel_03_02.mp3",
      type: "audio",
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
    },
  ],
  browserHistory: [
    {
      id: "web1",
      name: "Histoire de Bourg-sur-Mer - Wikipédia",
      type: "file",
      content: `HISTOIRE DE BOURG-SUR-MER

Fondée en 1832, Bourg-sur-Mer est une commune côtière du littoral français.

DATES CLÉS :
- 1832 : Fondation officielle de la commune
- 1856 : Construction du premier phare
- 1902 : Inauguration du port de pêche
- 1967 : Ouverture du Musée Maritime
- 2015 : Élection de Bernard Dupuis comme maire

Population : 12 450 habitants
Maire actuel : Bernard Dupuis (depuis 2015)`
    },
  ],
  secretDocuments: [
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
      name: "Comptes_Offshore.xlsx",
      type: "file",
      content: `RELEVÉ - COMPTE PRIVÉ SUISSE
Banque Helvetia - Genève
Titulaire : B.D. Consulting SA

MOUVEMENTS 2019-2024 :

03/2019 : +85 000 EUR (Virement SCI Les Mouettes)
06/2019 : +45 000 EUR (Consultation urbanisme)
11/2020 : +120 000 EUR (Projet marina - commission)

SOLDE ACTUEL : 847 230 EUR`
    },
    {
      id: "secret3",
      name: "Photo_Compromettante.jpg",
      type: "image",
      imageSrc: "/images/photo_compromettante.jpg",
      content: `[PHOTO - Monaco, 15 août 2022]

Bernard Dupuis sur un yacht luxueux avec Philippe Maurin (promoteur immobilier).
Champagne, cigares. À l'arrière-plan : mallette ouverte contenant des liasses de billets.`
    },
  ],
  secretMails: [
    {
      id: "secretmail1",
      name: "[URGENT] Journaliste - Dernières preuves",
      type: "mail",
      content: `De : Antoine Garnier <a.garnier@le-phare-info.fr>
Objet : Je sais tout
Date : 15 février 2025

Monsieur le Maire,

Vos menaces ne m'arrêteront pas.
J'ai obtenu les relevés de votre compte suisse.

Publication prévue le 25 février.

A. Garnier`
    },
  ],
  endings: [
    {
      id: "innocent",
      title: "L'Innocent",
      subtitle: "Vous avez trouvé le mot de passe sans fouiller trop loin.",
      description: "Vous avez retrouvé votre identité sans découvrir les secrets sombres du maire.",
      icon: "Shield",
      minSecrets: 0,
      maxSecrets: 0,
    },
    {
      id: "curious",
      title: "Le Curieux",
      subtitle: "Vous avez commencé à gratter la surface...",
      description: "Vous avez découvert quelques irrégularités, mais pas assez pour comprendre l'ampleur de la corruption.",
      icon: "Search",
      minSecrets: 1,
      maxSecrets: 2,
    },
    {
      id: "detective",
      title: "Le Détective",
      subtitle: "Vous avez tout découvert.",
      description: "Corruption, menaces, comptes offshore... Vous connaissez maintenant la vérité sur Bernard Dupuis.",
      icon: "Eye",
      minSecrets: 3,
    },
  ],
  darkSecret: "Le maire Bernard Dupuis est impliqué dans un vaste réseau de corruption immobilière, avec des comptes offshore et des pressions sur les journalistes.",
};
