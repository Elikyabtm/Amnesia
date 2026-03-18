import type { Scenario } from "./types";

export const streamerShadowPlay: Scenario = {
  id: "streamer-shadowplay",
  character: {
    id: "hugo-bernard",
    name: "Hugo Bernard",
    profession: "Streamer Gaming",
    description: "Streamer Twitch populaire sous le pseudo ShadowPlay, 500K abonnés.",
    difficulty: "facile",
    theme: "#6441a5", // Violet Twitch
  },
  passwords: {
    guest: "ShadowPlayTV",
    admin: "SP#Twitch500K!2019",
  },
  pins: {
    trash: "2019",
    trashHint: "L'année où tout a commencé sur Twitch...",
    confidential: "500",
    confidentialHint: "Le nombre de K abonnés",
  },
  documents: [
    {
      id: "doc1",
      name: "Planning_Stream_Fevrier.txt",
      type: "file",
      content: `PLANNING STREAMS - FÉVRIER 2025

Lundi 20h-00h : Elden Ring (Run No Hit)
Mercredi 20h-23h : Just Chatting + Jeu communauté
Vendredi 21h-02h : Tournoi Valorant
Samedi 15h-20h : Marathon caritatif

OBJECTIFS DU MOIS :
- Atteindre 500 000 abonnés
- Sponsoring Red Bull finalisé
- Nouveau setup streaming`
    },
    {
      id: "doc2",
      name: "Contrat_Sponsor_RedBull.pdf",
      type: "file",
      content: `CONTRAT DE SPONSORING
Red Bull Gaming France

Partenaire : Hugo Bernard (ShadowPlay)
Montant : 8 000€/mois
Durée : 12 mois (renouvelable)

Obligations :
- Port du logo Red Bull visible pendant les streams
- 3 posts Instagram/mois minimum
- Participation à 2 événements Red Bull Gaming

Signé le 15 janvier 2025
Hugo Bernard`
    },
    {
      id: "doc3",
      name: "Stats_Twitch_Janvier.txt",
      type: "file",
      content: `STATISTIQUES TWITCH - JANVIER 2025

Pseudo : ShadowPlay
Abonnés : 498 752 (+15 420 ce mois)
Vues totales : 45 millions
Heures regardées : 1.2 million

TOP STREAMS :
1. Elden Ring No Hit Run - 45K viewers
2. Réaction E3 2025 - 38K viewers
3. Collab avec Squeezie - 125K viewers

Revenus estimés : 12 400€
(Subs + Dons + Sponsors)`
    },
    {
      id: "doc4",
      name: "Setup_PC_Gaming.txt",
      type: "file",
      content: `MON SETUP 2025

PC :
- RTX 5090 Founders Edition
- Intel i9-14900K
- 64GB DDR5 RAM
- 4TB NVMe SSD

Périphériques :
- 3x Moniteurs OLED 4K 144Hz
- Clavier Wooting 60HE
- Souris Logitech G Pro X Superlight 2

Stream :
- Caméra Sony ZV-E1
- Micro Shure SM7B
- Elgato Stream Deck XL
- 2x Ring Light Elgato

Valeur totale : ~15 000€`
    },
  ],
  photos: [
    {
      id: "photo1",
      name: "Setup_Stream.jpg",
      type: "image",
      imageSrc: "/images/streamer_setup.jpg",
      content: "Photo du setup gaming professionnel avec 3 écrans, LEDs RGB et micro professionnel"
    },
    {
      id: "photo2",
      name: "Event_TwitchCon_2024.jpg",
      type: "image",
      imageSrc: "/images/streamer_twitchcon.jpg",
      content: "Photo à la TwitchCon 2024 avec badge VIP et autres streamers"
    },
    {
      id: "photo3",
      name: "500K_Celebration.jpg",
      type: "image",
      imageSrc: "/images/streamer_500k.jpg",
      content: "Capture d'écran du moment où ShadowPlay atteint 500 000 abonnés"
    },
  ],
  notes: [
    {
      id: "note1",
      name: "Idees_Contenu.txt",
      type: "file",
      content: `IDÉES DE CONTENU 2025

- Série "Du Bronze au Radiant" sur Valorant
- Collab avec Gotaga ?
- Réaction aux annonces Nintendo
- Challenge 24h sans dormir (avec médecin sur place)
- Voyage au Japon pour contenu IRL

À NE PAS OUBLIER :
Mon pseudo ShadowPlay + TV pour les comptes basiques
Le vrai mot de passe est plus complexe...`
    },
    {
      id: "note2",
      name: "Aide_Memoire_MDP.txt",
      type: "file",
      content: `Pense-bête sécurité...

Mon pseudo abrégé en deux lettres,
Le symbole de la musique,
Ma plateforme favorite,
Le nombre magique avec un K,
Le point qui crie,
Et l'année du premier stream.

Comme ça personne ne peut deviner !`
    },
    {
      id: "note3",
      name: "Contacts_Streamers.txt",
      type: "file",
      content: `CONTACTS STREAMERS

Squeezie - Lucas (collab confirmée mars)
Gotaga - Corentin (en discussion)
Domingo - Dorian (podcast prévu)
Zerator - Adrien (ZEvent 2025)
Sardoche - message ignoré...

Note : Garder ces contacts privés !`
    },
  ],
  mails: [
    {
      id: "mail1",
      name: "Twitch - Félicitations Partner+",
      type: "mail",
      content: `De : partner@twitch.tv
Objet : Bienvenue dans le programme Partner+
Date : 5 février 2025

Cher ShadowPlay,

Félicitations ! Vous avez été sélectionné pour rejoindre le programme Partner+ de Twitch.

Avantages :
- 70% des revenus d'abonnement (au lieu de 50%)
- Badge exclusif Partner+
- Accès priorité support
- Invitation événements Twitch exclusifs

Votre pseudo ShadowPlay est maintenant vérifié.

L'équipe Twitch`
    },
    {
      id: "mail2",
      name: "Maman - Tu manges bien ?",
      type: "mail",
      content: `De : Marie Bernard <marie.bernard@orange.fr>
Objet : Tu manges bien mon chéri ?
Date : 18 février 2025

Mon Hugo,

Je t'ai regardé streamer hier soir (oui, ta mère s'y met !).
Tu avais l'air fatigué. Tu dors assez ?

Ton père dit qu'il est fier de toi même s'il ne comprend toujours pas ton métier.
"500 000 personnes qui regardent quelqu'un jouer aux jeux vidéo ?"

N'oublie pas le repas de famille dimanche. 
Depuis que tu as commencé en 2019, on te voit plus beaucoup...

Bisous,
Maman`
    },
    {
      id: "mail3",
      name: "Red Bull - Prochaine campagne",
      type: "mail",
      content: `De : marketing@redbull-gaming.fr
Objet : Campagne "Wings of Gaming"
Date : 20 février 2025

Salut Hugo,

On lance la campagne "Wings of Gaming" le mois prochain.
On voudrait que tu sois la tête d'affiche France.

- Shooting photo : 5 mars
- Tournage pub : 10-11 mars
- Lancement : 20 mars

Budget : 25 000€ supplémentaires

Confirme-nous ta dispo !

L'équipe Red Bull Gaming`
    },
    {
      id: "mail4",
      name: "Lucas (Squeezie) - Collab",
      type: "mail",
      content: `De : Lucas Hauchard <contact@squeezie.fr>
Objet : Re: Collab Mario Kart
Date : 15 février 2025

Yo Hugo !

OK pour la collab Mario Kart le 15 mars.
On fait ça sur ta chaîne, je raid à la fin.

Par contre, garde ça secret jusqu'à l'annonce officielle.
Tu connais Twitter...

À plus,
Lucas`
    },
  ],
  audioMemos: [
    {
      id: "voice1",
      name: "memo_idee_stream.mp3",
      type: "audio",
      date: "19 février 2025",
      from: "Moi-même",
      transcript: `[Mémo vocal]

"Note pour demain : penser à changer le mot de passe Twitch.
Le mot de passe actuel c'est juste ShadowPlayTV, trop simple.

Le nouveau format : SP dièse Twitch 500K point d'exclamation 2019.
Comme ça je mélange mon pseudo, ma plateforme, mon objectif et l'année où j'ai commencé.

Faut que je note ça quelque part..."`
    },
  ],
  browserHistory: [
    {
      id: "web1",
      name: "TwitchTracker - ShadowPlay Stats",
      type: "file",
      content: `TWITCHTRACKER - SHADOWPLAY

Statistiques globales :
- Création de la chaîne : Mars 2019
- Peak viewers : 125 000 (Collab Squeezie)
- Moyenne viewers : 15 000
- Heures streamées (total) : 8 500h
- Catégorie principale : Just Chatting / FPS

Rang France : #12
Rang Monde : #847`
    },
    {
      id: "web2",
      name: "Twitter - ShadowPlay Officiel",
      type: "file",
      content: `@ShadowPlayTV - Vérifié
500K Followers

Dernier tweet :
"500 000 ABONNÉS SUR TWITCH !!!
Merci à tous, vous êtes incroyables.
RDV ce soir 20h pour un stream spécial 

#ShadowPlay #Twitch500K #2019to2025"`
    },
  ],
  secretDocuments: [
    {
      id: "secret1",
      name: "Contrat_ViewBot_CONFIDENTIEL.pdf",
      type: "file",
      content: `CONTRAT DE SERVICE
ViewBoost Pro - Services de croissance Twitch

Client : Hugo Bernard (ShadowPlay)
Service : Pack Premium

DÉTAILS :
- 5 000 viewers bots garantis par stream
- Augmentation progressive (aspect naturel)
- Chat bots pour simuler l'activité
- 500€/mois depuis janvier 2023

ATTENTION : Service strictement confidentiel.
Détection = Ban permanent Twitch.

Total payé depuis 2023 : 12 000€`
    },
    {
      id: "secret2",
      name: "DM_Twitter_Menaces.txt",
      type: "file",
      content: `MESSAGES PRIVÉS TWITTER - EXPORTÉS

De : @TruthSeeker_Gaming
Date : 10 février 2025

"ShadowPlay, je sais que tu utilises des viewbots.
J'ai les preuves, les factures, tout.

Tu me verses 50 000€ ou je balance tout.
Tu as une semaine.

PS: Ton petit arrangement avec ViewBoost Pro 
ne restera pas secret longtemps..."

---

Ma réponse :
"Tu n'as aucune preuve. Laisse-moi tranquille."

---

Sa réponse :
"ViewBoost Pro, 500€/mois depuis janvier 2023.
Tu veux que je continue ?"

[Conversation supprimée]`
    },
    {
      id: "secret3",
      name: "Factures_ViewBot_2023-2025.xlsx",
      type: "file",
      content: `FACTURES VIEWBOOST PRO

01/2023 : 500€ - Pack Premium
02/2023 : 500€ - Pack Premium
03/2023 : 500€ - Pack Premium
...
12/2024 : 500€ - Pack Premium
01/2025 : 500€ - Pack Premium
02/2025 : 500€ - Pack Premium

TOTAL : 12 500€

Note : Paiements en crypto pour éviter les traces.
Wallet utilisé : bc1q...x7m (Bitcoin)

SI TWITCH DÉCOUVRE = BAN DÉFINITIF
+ Perte des revenus (~150 000€/an)
+ Fin des sponsors
+ Réputation détruite`
    },
  ],
  secretMails: [
    {
      id: "secretmail1",
      name: "[URGENT] ViewBoost - Problème détection",
      type: "mail",
      content: `De : support@viewboostpro.net
Objet : URGENT - Risque de détection
Date : 21 février 2025

Cher client,

Nos systèmes ont détecté que Twitch a mis à jour ses algorithmes anti-bot.
Plusieurs de nos clients ont été bannis cette semaine.

RECOMMANDATIONS :
- Réduire le nombre de viewers bots à 2 000 max
- Éviter les streams de plus de 4h
- Mixer avec du trafic organique

Nous ne sommes PAS responsables en cas de ban.

ViewBoost Pro Team`
    },
    {
      id: "secretmail2",
      name: "Gotaga - Je sais tout",
      type: "mail",
      content: `De : Corentin Houssein <contact@gotaga.fr>
Objet : On doit parler...
Date : 19 février 2025

Hugo,

Un de mes contacts m'a montré des trucs sur toi.
ViewBoost Pro ? Sérieusement ?

Je ne vais pas te balancer, mais la collab c'est mort.
Je ne m'associe pas avec des tricheurs.

Tu mérites ta place, mais pas comme ça.
Réfléchis à ce que tu fais.

Corentin`
    },
  ],
  endings: [
    {
      id: "innocent",
      title: "Le Fan",
      subtitle: "Vous avez trouvé le mot de passe sans fouiller.",
      description: "Vous êtes ShadowPlay, streamer à succès. Rien de plus... en apparence.",
      icon: "Gamepad2",
      minSecrets: 0,
      maxSecrets: 0,
    },
    {
      id: "curious",
      title: "Le Sceptique",
      subtitle: "Ces chiffres semblent trop beaux...",
      description: "Vous avez découvert des incohérences dans vos statistiques.",
      icon: "Search",
      minSecrets: 1,
      maxSecrets: 1,
    },
    {
      id: "detective",
      title: "Le Démasqué",
      subtitle: "Toute votre carrière repose sur un mensonge.",
      description: "ViewBots, chantage, faux succès... Votre empire est bâti sur du sable.",
      icon: "Eye",
      minSecrets: 2,
    },
  ],
  darkSecret: "ShadowPlay utilise des viewbots payants depuis 2023 pour gonfler artificiellement ses statistiques Twitch. Il est maintenant victime de chantage.",
};
