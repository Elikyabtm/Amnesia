import type { Scenario } from "./types";

export const developpeurLucas: Scenario = {
  id: "developpeur-lucas",
  character: {
    id: "lucas-bernard",
    name: "Lucas Bernard",
    profession: "Développeur",
    description: "Développeur senior chez TechCorp, expert en cybersécurité.",
    difficulty: "difficile",
    theme: "#0d1117", // Noir GitHub
  },
  passwords: {
    guest: "CodeLife404",
    admin: "LB#Root!2024@Dev",
  },
  pins: {
    trash: "404",
    trashHint: "L'erreur que tous les devs connaissent...",
    confidential: "1337",
    confidentialHint: "LEET speak for elite",
  },
  documents: [
    {
      id: "doc1",
      name: "README_Projet_Aurora.md",
      type: "file",
      content: `# PROJET AURORA
## Application de sécurité bancaire

### Description
Aurora est un système de détection de fraude 
utilisant l'IA pour les transactions bancaires.

### Stack technique
- Backend: Python/FastAPI
- Frontend: React/TypeScript  
- ML: TensorFlow
- Database: PostgreSQL

### Équipe
- Lead Dev: Lucas Bernard
- Data Scientist: Marie Chen
- DevOps: Thomas Petit

### Deadline
Livraison v1.0 : 1er mars 2025

### Statut
🟢 En bonne voie (85% complet)`
    },
    {
      id: "doc2",
      name: "Contrat_TechCorp.pdf",
      type: "file",
      content: `CONTRAT DE TRAVAIL
TechCorp Industries - Division Cybersécurité

Employé : Lucas Bernard
Poste : Développeur Senior / Lead Technique
Date d'embauche : 15 janvier 2020
Salaire : 85 000€/an + bonus

CLAUSE DE CONFIDENTIALITÉ :
Toute information relative aux projets de TechCorp
est strictement confidentielle. Toute divulgation
est passible de poursuites judiciaires.

CLAUSE DE NON-CONCURRENCE :
Interdiction de travailler pour un concurrent
pendant 24 mois après départ.

Signé : Lucas Bernard
Date : 15/01/2020`
    },
    {
      id: "doc3",
      name: "Notes_Bug_Critique.txt",
      type: "file",
      content: `BUG CRITIQUE - PROJET AURORA
Date : 19 février 2025

PROBLÈME :
Faille de sécurité découverte dans le module d'authentification.
Injection SQL possible via le champ "numéro de compte".

IMPACT :
- Accès non autorisé aux données bancaires
- Potentiel vol de millions d'euros

CORRECTION :
Paramétrage des requêtes SQL (fait)
Tests de pénétration (en cours)

SIGNALÉ À :
- Direction technique : OUI
- Direction générale : NON (ordre de Thomas)

"On ne peut pas reporter la deadline."
C'est ce qu'ils ont dit.`
    },
  ],
  photos: [
    {
      id: "photo1",
      name: "Bureau_Dev.jpg",
      type: "image",
      imageSrc: "/images/dev_bureau.jpg",
      content: "Bureau de développeur avec 3 écrans, code affiché, et figurines Star Wars"
    },
    {
      id: "photo2",
      name: "Equipe_TechCorp.jpg",
      type: "image",
      imageSrc: "/images/dev_equipe.jpg",
      content: "Photo d'équipe TechCorp lors du hackathon 2024"
    },
    {
      id: "photo3",
      name: "Badge_Conference.jpg",
      type: "image",
      imageSrc: "/images/dev_conference.jpg",
      content: "Badge speaker DefCon 2024 - Présentation sur la sécurité des API"
    },
  ],
  notes: [
    {
      id: "note1",
      name: "Passwords_Format.txt",
      type: "file",
      content: `FORMAT DE MES MOTS DE PASSE
(Note perso - à supprimer)

Basique : Passion + Code erreur + Année
Ex: CodeLife404

Sécurisé : Initiales + # + Root + ! + Année + @ + Métier
Ex: LB#Root!2024@Dev

Codes PIN :
- Corbeille : 404 (erreur classique)
- Confidentiel : 1337 (LEET)`
    },
    {
      id: "note2",
      name: "TODO_Personnel.txt",
      type: "file",
      content: `TODO LIST - FÉVRIER 2025

[x] Terminer module ML Aurora
[x] Review code de Marie
[ ] Signaler la faille à la direction générale
[ ] Décider quoi faire avec ce que j'ai trouvé
[ ] Dormir plus de 4h par nuit

DILEMME :
J'ai trouvé quelque chose dans les logs serveur.
Des accès suspects. Provenant de... l'intérieur.
Quelqu'un vend nos données.

Qu'est-ce que je fais ?`
    },
  ],
  mails: [
    {
      id: "mail1",
      name: "GitHub - Pull Request approved",
      type: "mail",
      content: `De : notifications@github.com
Objet : [TechCorp/Aurora] PR #847 merged
Date : 20 février 2025

Pull Request merged by lucas-bernard

Title: Fix SQL injection vulnerability
Branch: security-fix -> main
Reviews: 2 approved

+342 -28 lines changed

Merged commit: 7a3f2b1`
    },
    {
      id: "mail2",
      name: "Marie Chen - Tu as vu ça ?",
      type: "mail",
      content: `De : marie.chen@techcorp.com
Objet : Bizarre...
Date : 21 février 2025

Lucas,

J'ai remarqué des trucs bizarres sur le serveur.
Des requêtes à 3h du matin, des exports de données...

C'est toi qui fais des tests ?

Si c'est pas toi... on a un problème.

Marie`
    },
    {
      id: "mail3",
      name: "Direction - Projet Aurora urgent",
      type: "mail",
      content: `De : direction@techcorp.com
Objet : URGENT - Deadline Aurora
Date : 22 février 2025

Équipe Aurora,

Le client (Banque Centrale) exige une démonstration 
le 28 février. Pas de report possible.

Je sais qu'il reste des "ajustements de sécurité".
Réglez ça en production si nécessaire.

La priorité c'est la DEADLINE.

PS: Pas de discussion sur ce sujet par écrit.

Thomas Petit
Directeur Technique`
    },
  ],
  audioMemos: [
    {
      id: "voice1",
      name: "note_vocale_tard.mp3",
      type: "audio",
      date: "21 février 2025",
      from: "Moi-même",
      transcript: `[Mémo vocal - 3h du matin]

"Putain. J'ai trouvé quelque chose.

Les logs serveur... y'a des connexions depuis l'IP de Thomas.
À 2h du matin. Tous les jours depuis 3 semaines.
Export de la base clients vers un serveur externe.

Thomas vend nos données. J'en suis sûr.

Mon mot de passe admin c'est LB dièse Root exclamation 2024 arobase Dev.
Si quelqu'un trouve ça... au moins il y aura des preuves.

Je sais pas quoi faire. Si je le dénonce, je perds mon job.
Si je me tais, je suis complice.

Et cette faille de sécurité qu'ils veulent pas corriger...
Si quelqu'un l'exploite, c'est sur ma conscience."`
    },
  ],
  browserHistory: [
    {
      id: "web1",
      name: "LinkedIn - Lucas Bernard",
      type: "file",
      content: `LUCAS BERNARD
Développeur Senior @ TechCorp

Expérience :
- TechCorp (2020-présent) : Lead Dev Aurora
- StartupXYZ (2017-2020) : Full Stack Developer
- Freelance (2015-2017)

Formation :
- Master Informatique - EPITA (2015)
- Certification OSCP (2022)

Compétences :
Python, TypeScript, React, Cybersécurité, ML/AI

500+ connections`
    },
    {
      id: "web2",
      name: "HackerNews - Discussion éthique",
      type: "file",
      content: `HACKERNEWS - Thread suivi

"Que faire quand on découvre une fraude dans son entreprise ?"

Meilleures réponses :
- "Documente tout, puis whistleblower"
- "Parle à un avocat d'abord"
- "Ta loyauté c'est envers la loi, pas l'entreprise"
- "RIP ta carrière si tu parles"

Mon commentaire (anonyme) :
"Et si c'est ton chef direct qui fraude ?"

Réponse : "Pire scénario. Documente TOUT. 
Prépare une sortie. Puis agis."`
    },
  ],
  secretDocuments: [
    {
      id: "secret1",
      name: "Logs_Suspects_Thomas.txt",
      type: "file",
      content: `EXPORT LOGS SERVEUR - CONFIDENTIEL
Période : 1-21 février 2025

CONNEXIONS SUSPECTES :
IP: 192.168.1.47 (Poste Thomas Petit)

02/01 02:14 - Export: clients_data.csv (450 000 lignes)
02/03 02:31 - Export: transactions_2024.csv
02/05 02:08 - Export: credentials_encrypted.db
02/08 02:45 - Export: api_keys.json
...
02/21 02:22 - Export: aurora_source_code.zip

DESTINATION :
Serveur externe : 185.234.XX.XX
Localisation : Russie

CONCLUSION :
Thomas Petit exfiltre des données depuis des semaines.
Données clients, transactions, et maintenant le code source.

VALEUR ESTIMÉE DES DONNÉES :
Marché noir : 5-10 millions d'euros`
    },
    {
      id: "secret2",
      name: "Faille_Non_Corrigee.pdf",
      type: "file",
      content: `RAPPORT DE VULNÉRABILITÉ
Classification : CRITIQUE
Statut : NON CORRIGÉE (ordre direction)

VULNÉRABILITÉ :
Injection SQL dans le module Aurora v0.9

EXPLOITABILITÉ :
Facile - Aucune compétence technique requise

IMPACT :
- Accès total à la base de données
- Vol de 2.3 millions de comptes bancaires
- Transferts frauduleux possibles

RECOMMANDATION :
Report immédiat du déploiement.
Correction estimée : 2 semaines.

RÉPONSE DIRECTION :
"Déployez quand même. On patchera après."

---

Si cette faille est exploitée après déploiement,
je refuse d'en porter la responsabilité.
J'ai prévenu. Par écrit. Ici.

Lucas Bernard - 19/02/2025`
    },
    {
      id: "secret3",
      name: "Email_Anonyme_Recu.txt",
      type: "file",
      content: `MESSAGE REÇU VIA PROTONMAIL

De : anonyme@proton.me
Date : 22 février 2025

Lucas,

Je sais ce que tu as trouvé sur Thomas.
Je suis dans la même situation que toi.
Enfin, j'étais.

Thomas m'a viré il y a 6 mois. Officiellement "restructuration".
En vrai ? J'avais commencé à poser des questions sur les logs.

Il a des contacts haut placés. TRÈS haut.
Si tu parles, ta carrière est finie.
Peut-être pire.

Mon conseil : copie tout. Stocke ailleurs.
Puis disparais.

Ou alors, contacte ce journaliste :
Marc Dubois - Mediapart
Il enquête déjà sur TechCorp.

Bonne chance.

- Un ancien collègue`
    },
  ],
  secretMails: [
    {
      id: "secretmail1",
      name: "Thomas - On doit parler",
      type: "mail",
      content: `De : thomas.petit@techcorp.com
Objet : Passe dans mon bureau
Date : 23 février 2025

Lucas,

J'ai vu que tu as accédé aux logs serveur hier soir.
Passe dans mon bureau à 14h.

On doit discuter de... ce que tu as trouvé.

Thomas

---

Note : Il sait que je sais.
Qu'est-ce qui se passe à 14h ?
Promotion ? Menaces ? Les deux ?`
    },
    {
      id: "secretmail2",
      name: "Mediapart - Votre témoignage",
      type: "mail",
      content: `De : m.dubois@mediapart.fr
Objet : Re: Informations TechCorp
Date : 23 février 2025

Lucas,

Merci pour votre message anonyme.
Ce que vous décrivez est très grave.

J'enquête sur TechCorp depuis 8 mois.
Vous n'êtes pas le premier à me contacter.

Si vous avez des preuves documentées,
nous pouvons garantir votre anonymat
et votre protection en tant que lanceur d'alerte.

La loi Sapin II vous protège.

Êtes-vous prêt à témoigner ?

Marc Dubois
Journaliste d'investigation - Mediapart`
    },
  ],
  endings: [
    {
      id: "innocent",
      title: "Le Codeur",
      subtitle: "Vous écrivez du code, point.",
      description: "Vous êtes Lucas Bernard, développeur senior. Le code est votre vie.",
      icon: "Code",
      minSecrets: 0,
      maxSecrets: 0,
    },
    {
      id: "curious",
      title: "Le Découvreur",
      subtitle: "Ces logs ne mentent pas...",
      description: "Vous avez découvert que quelque chose cloche chez TechCorp.",
      icon: "Search",
      minSecrets: 1,
      maxSecrets: 1,
    },
    {
      id: "detective",
      title: "Le Lanceur d'alerte",
      subtitle: "Vous avez toutes les preuves.",
      description: "Vol de données, faille ignorée, corruption... Vous pouvez tout faire tomber. Mais à quel prix ?",
      icon: "Eye",
      minSecrets: 2,
    },
  ],
  darkSecret: "Lucas a découvert que son directeur technique vend des données clients à des hackers russes, et que l'entreprise va déployer une application bancaire avec une faille critique.",
};
