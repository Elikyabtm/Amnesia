import type { Scenario } from "./types";

export const detectiveVictorHale: Scenario = {
  id: "detective-victor-hale",
  character: {
    id: "victor-hale",
    name: "Victor Hale",
    profession: "Détective Privé",
    description: "Ancien flic devenu détective privé, spécialisé dans les affaires sensibles.",
    difficulty: "difficile",
    theme: "#1a1a2e", // Noir mystère
  },
  passwords: {
    guest: "CaseFile007",
    admin: "VH#Case1987!Noir",
  },
  pins: {
    trash: "1987",
    trashHint: "L'année de l'affaire qui a tout changé...",
    confidential: "007",
    confidentialHint: "Mon numéro de dossier fétiche",
  },
  documents: [
    {
      id: "doc1",
      name: "Dossier_Affaire_Moreau.txt",
      type: "file",
      content: `DOSSIER D'ENQUÊTE #2025-012
Client : Mme Moreau
Objet : Surveillance mari

SUJET : Pierre Moreau, 45 ans, banquier
MOTIF : Soupçon d'infidélité

SURVEILLANCE :
- Lundi : Sujet quitte bureau 18h30, va au Café du Commerce
- Mardi : Rencontre avec femme blonde, 30 ans environ
- Mercredi : Hôtel "Le Discret", chambre 204, 2h

CONCLUSION : Infidélité confirmée
PHOTOS : 47 clichés compromettants

Honoraires : 3 500€ (payés)`
    },
    {
      id: "doc2",
      name: "Tarifs_2025.pdf",
      type: "file",
      content: `CABINET HALE INVESTIGATIONS
Tarifs en vigueur - 2025

SURVEILLANCE :
- Demi-journée : 400€
- Journée complète : 700€
- Semaine : 3 000€

RECHERCHE DE PERSONNES :
- France : 1 500€ - 5 000€
- International : Sur devis

ENQUÊTE FINANCIÈRE :
- À partir de 2 500€

CONDITIONS :
- Acompte 50% à la signature
- Confidentialité absolue garantie
- Rapport détaillé + preuves

Victor Hale - Licence n°2019-VH-75`
    },
    {
      id: "doc3",
      name: "Notes_Affaire_Disparition.txt",
      type: "file",
      content: `AFFAIRE DISPARITION - JULIE MARTIN
Dossier #2025-019

Disparue le : 3 février 2025
Dernière localisation : Gare du Nord, Paris
Description : 28 ans, brune, 1m65

PISTES :
1. Ex-petit ami violent (alibi vérifié)
2. Collègue suspect (à creuser)
3. Compte bancaire vidé 2 jours avant

THÉORIE :
Disparition volontaire ? Fuite ?
Ou quelque chose de plus sombre...

À FAIRE :
- Vérifier vidéosurveillance gare
- Interroger la sœur
- Suivre la piste de l'argent`
    },
  ],
  photos: [
    {
      id: "photo1",
      name: "Bureau_Detective.jpg",
      type: "image",
      imageSrc: "/images/detective_bureau.jpg",
      content: "Bureau du détective avec dossiers empilés, tableau d'indices et lampe de bureau"
    },
    {
      id: "photo2",
      name: "Surveillance_Moreau.jpg",
      type: "image",
      imageSrc: "/images/detective_surveillance.jpg",
      content: "Photo de surveillance : homme et femme sortant d'un hôtel"
    },
    {
      id: "photo3",
      name: "Badge_Police_Ancien.jpg",
      type: "image",
      imageSrc: "/images/detective_badge.jpg",
      content: "Ancien badge de police - Victor Hale - Brigade Criminelle - 1985-2010"
    },
  ],
  notes: [
    {
      id: "note1",
      name: "Methode_Travail.txt",
      type: "file",
      content: `MES RÈGLES D'OR

1. Ne jamais faire confiance, toujours vérifier
2. Les gens mentent, les preuves non
3. Suivre l'argent mène toujours quelque part
4. Garder une copie de tout, TOUJOURS
5. Le passé revient toujours hanter

"Dans ce métier, on ne trouve pas la vérité.
On la déterre." - VH`
    },
    {
      id: "note2",
      name: "Aide_Memoire_Securite.txt",
      type: "file",
      content: `SÉCURITÉ INFORMATIQUE

Format de mes mots de passe :
[Initiales] + [Symbole] + [Référence affaire] + [Année clé] + [Exclamation] + [Thème]

Le dossier 007 est celui qui m'a lancé en 1987.
"Noir" comme le film noir que j'adore.

Mot de passe simple : juste la référence au dossier
Mot de passe admin : la totale, avec l'année noire`
    },
  ],
  mails: [
    {
      id: "mail1",
      name: "Client - Merci pour l'enquête",
      type: "mail",
      content: `De : Sophie Moreau <s.moreau@gmail.com>
Objet : Merci
Date : 18 février 2025

Monsieur Hale,

Les photos que vous m'avez fournies sont... difficiles à voir.
Mais au moins je sais maintenant.

Mon avocat prépare le divorce.
Pierre ne sait pas ce qui l'attend.

Merci pour votre professionnalisme.
Le virement a été effectué.

Sophie Moreau`
    },
    {
      id: "mail2",
      name: "Famille Martin - Nouvelles de Julie ?",
      type: "mail",
      content: `De : Marc Martin <marc.martin@outlook.fr>
Objet : Des nouvelles de Julie ???
Date : 21 février 2025

Monsieur Hale,

Ça fait 18 jours que ma sœur a disparu.
La police ne fait rien.
Vous êtes notre dernier espoir.

On a réuni 5 000€ pour vos honoraires.
S'il vous plaît, trouvez-la.

Marc Martin`
    },
    {
      id: "mail3",
      name: "Ancien collègue - Attention",
      type: "mail",
      content: `De : Jean-Pierre Duval <jpduval@police.fr>
Objet : Fais gaffe, Victor
Date : 19 février 2025

Salut Victor,

J'ai entendu dire que tu creusais l'affaire Martin.
Fais attention.

Cette disparition... y'a des gens haut placés qui veulent pas qu'on la retrouve.
Je peux pas t'en dire plus.

Mais rappelle-toi 1987. L'affaire Noir.
Parfois, certaines vérités sont dangereuses.

Jean-Pierre

PS: Efface ce mail après lecture.`
    },
  ],
  audioMemos: [
    {
      id: "voice1",
      name: "notes_vocales_enquete.mp3",
      type: "audio",
      date: "20 février 2025",
      from: "Moi-même",
      transcript: `[Enregistrement dictaphone]

"Affaire Martin, jour 17.

La piste de l'argent mène quelque part d'intéressant.
50 000 euros virés sur un compte au Luxembourg deux jours avant la disparition.

Le compte appartient à une société écran : "Noir Consulting".
Noir... comme l'affaire de 87. Coïncidence ?

Mon mot de passe admin utilise cette référence : mes initiales VH, dièse, Case1987, point d'exclamation, Noir.
Je deviens parano avec l'âge.

Note : le dossier confidentiel utilise 007, mon numéro fétiche.
Et la corbeille... 1987, l'année où tout a changé."`
    },
  ],
  browserHistory: [
    {
      id: "web1",
      name: "Pages Jaunes - Détectives Privés Paris",
      type: "file",
      content: `HALE INVESTIGATIONS
Détective Privé - Paris 75008

Victor Hale
Ancien inspecteur Brigade Criminelle (25 ans)
Licence professionnelle n°2019-VH-75

Spécialisations :
- Recherche de personnes disparues
- Enquêtes conjugales
- Investigations financières
- Contre-espionnage industriel

"La vérité a un prix. Je la trouve."

Contact : 01 XX XX XX XX`
    },
    {
      id: "web2",
      name: "Article - Affaire Noir 1987",
      type: "file",
      content: `LE PARISIEN - Archives 1987

L'AFFAIRE NOIR : UN DÉPUTÉ IMPLIQUÉ
DANS UN RÉSEAU DE CORRUPTION

L'inspecteur Victor Hale de la Brigade Criminelle 
a mis au jour un vaste réseau de corruption impliquant 
le député Jean Noir et plusieurs hauts fonctionnaires.

L'enquête, qui a duré 18 mois, a révélé des détournements 
de fonds publics estimés à 10 millions de francs.

Le député Noir a été condamné à 5 ans de prison.
L'inspecteur Hale a été décoré pour son travail.

Mais des rumeurs persistent : Hale aurait été poussé 
vers la sortie après cette affaire...`
    },
  ],
  secretDocuments: [
    {
      id: "secret1",
      name: "Affaire_Noir_VERITABLE_DOSSIER.pdf",
      type: "file",
      content: `DOSSIER CLASSÉ SECRET
AFFAIRE NOIR - 1987 - LA VÉRITÉ

Ce que les médias n'ont jamais su :

Le député Jean Noir n'était qu'un pion.
Le vrai chef du réseau : le Préfet Maurice Leblanc.
Toujours en poste. Protégé.

PREUVES CACHÉES :
- Enregistrements compromettants
- Photos du Préfet avec des liasses de billets
- Témoignage d'un informateur (assassiné en 1988)

POURQUOI J'AI ÉTÉ VIRÉ :
J'ai voulu aller plus haut. On m'a fait comprendre
que certaines personnes étaient intouchables.

"Abandonne ou tu finis comme l'informateur."

J'ai quitté la police. Mais j'ai gardé les preuves.
Un jour, la vérité éclatera.`
    },
    {
      id: "secret2",
      name: "Julie_Martin_VERITE.txt",
      type: "file",
      content: `AFFAIRE JULIE MARTIN - CE QUE J'AI TROUVÉ

Julie n'a pas disparu. Elle s'est enfuie.

DÉCOUVERTES :
1. Julie était escort de luxe
2. Un de ses clients : Maurice Leblanc (oui, LUI)
3. Elle a menacé de tout révéler
4. 50 000€ pour disparaître et se taire

LE LIEN AVEC 1987 :
Leblanc. Encore lui. 38 ans plus tard.
Il n'a pas changé.

DILEMME :
Si je révèle ça, Julie est en danger.
Si je me tais, Leblanc continue.

La famille mérite de savoir... mais à quel prix ?`
    },
    {
      id: "secret3",
      name: "Enregistrement_Leblanc_2024.mp3",
      type: "file",
      content: `[TRANSCRIPTION ENREGISTREMENT]
Date : 15 décembre 2024
Lieu : Restaurant Le Diplomate, Paris

Voix 1 (Leblanc) : "Cette fille commence à m'inquiéter."
Voix 2 (Inconnu) : "On s'en occupe ?"
Voix 1 : "Non. Pas de violence. On lui propose de l'argent. 
          50 000, cash. Elle disparaît, nouvelle identité."
Voix 2 : "Et si elle refuse ?"
Voix 1 : "Elle ne refusera pas. Sinon... 
          tu sais comment on gère ces situations."

[FIN ENREGISTREMENT]

Note : Cet enregistrement peut faire tomber un préfet.
Mais à quel prix pour moi ?`
    },
  ],
  secretMails: [
    {
      id: "secretmail1",
      name: "[SANS OBJET] - Menaces",
      type: "mail",
      content: `De : anonyme@protonmail.com
Objet : (sans objet)
Date : 22 février 2025

Hale,

On sait que tu fouilles dans l'affaire Martin.
On sait que tu as fait le lien avec 1987.

Arrête maintenant.

Tu as déjà perdu ta carrière une fois.
Cette fois, tu pourrais perdre plus.

Tu as une fille, n'est-ce pas ?
Sarah, 28 ans, avocate au barreau de Lyon.

Réfléchis bien.`
    },
    {
      id: "secretmail2",
      name: "Julie Martin - Je suis vivante",
      type: "mail",
      content: `De : anonyme_julie@tutanota.com
Objet : SVP arrêtez de chercher
Date : 23 février 2025

Monsieur Hale,

C'est Julie. Je suis vivante.
J'ai choisi de disparaître.

Ne dites rien à ma famille. C'est mieux ainsi.
Certaines personnes sont trop dangereuses.

J'ai l'argent. J'ai une nouvelle vie.
C'est le prix de ma sécurité.

Si vous continuez à chercher, vous nous mettez 
tous en danger. Moi, vous, votre fille.

Oubliez cette affaire.

Julie (ou ce qu'il en reste)`
    },
  ],
  endings: [
    {
      id: "innocent",
      title: "Le Professionnel",
      subtitle: "Vous faites votre travail, point.",
      description: "Vous êtes Victor Hale, détective privé. Les affaires se suivent et se ressemblent.",
      icon: "Briefcase",
      minSecrets: 0,
      maxSecrets: 0,
    },
    {
      id: "curious",
      title: "L'Obstiné",
      subtitle: "Certaines affaires ne vous lâchent pas...",
      description: "Vous avez senti que quelque chose clochait. 1987 n'est pas terminé.",
      icon: "Search",
      minSecrets: 1,
      maxSecrets: 1,
    },
    {
      id: "detective",
      title: "Le Témoin",
      subtitle: "Vous savez tout. Et c'est dangereux.",
      description: "Leblanc, les menaces, Julie... Vous avez toutes les pièces du puzzle. La question : que faites-vous maintenant ?",
      icon: "Eye",
      minSecrets: 2,
    },
  ],
  darkSecret: "Victor Hale a découvert qu'un préfet corrompu depuis 1987 est impliqué dans la disparition de Julie Martin, mais révéler la vérité mettrait sa propre fille en danger.",
};
