// Emails et messages vocaux ajoutés en phase 3. Ils rendent trouvables
// quatre indices dont le détecteur existait sans aucun contenu pour le
// déclencher. Les contenus d'origine (game-data.ts) ne sont pas modifiés.

import { deletedMails, mails, voiceMessages, type FileItem, type VoiceMessage } from "../game-data";

/** Nouveaux emails de la boîte de réception */
export const extraInboxMails: FileItem[] = [
  {
    id: "mail7",
    name: "Comité des fêtes - Une surprise pour vos 58 ans ?",
    type: "mail",
    content: `De : Comité des fêtes de Bourg-sur-Mer
Objet : Une surprise pour vos 58 ans ?
Date : 19 février 2025

Monsieur le Maire,

Le conseil municipal aimerait marquer vos 58 ans, le lundi 14 avril, par un petit pot à la mairie, la veille de votre anniversaire de mariage.

Madame Dupuis est dans la confidence. Nous comptons sur votre discrétion... et sur votre présence vers 18h !

Pour le Comité,
Josiane Le Goff`,
  },
];

/** Nouveaux emails de la corbeille du Courrier */
export const extraDeletedMails: FileItem[] = [
  {
    id: "del3",
    name: "Service IT - Re: Votre nouveau mot de passe",
    type: "mail",
    content: `De : Service Informatique Mairie
Objet : Re: Votre nouveau mot de passe
Date : 3 février 2025

Monsieur le Maire,

Bien reçu votre appel de ce matin. Le format que vous nous avez décrit — initiales + année + symbole + date + ponctuation — est excellent : long, personnel, avec deux symboles. La stratégie de sécurité l'a accepté.

Surtout, ne le notez nulle part et supprimez ce message après lecture.

Le Service IT — poste 214`,
  },
];

/** Nouveaux messages vocaux (audio de messagerie synthétique) */
export const extraVoiceMessages: VoiceMessage[] = [
  {
    id: "voice7",
    name: "message_cabinet_martin_11_02.wav",
    audioSrc: "/audio/cabinet_martin.wav",
    date: "11 février 2025",
    from: "Cabinet du Dr Martin",
    transcript: `[Message vocal — transcription automatique]

"Bonjour Monsieur Dupuis, ici le secrétariat du docteur Martin.
Je vous confirme votre rendez-vous de contrôle ce jeudi 13 février à 14h.

Pour la mise à jour de votre dossier, nous avons une année de naissance en 1967, mais le jour est illisible sur l'ancienne fiche.
Pouvez-vous nous le redonner en arrivant ? Pensez aussi à vos dernières analyses. Bonne journée."`,
  },
  {
    id: "voice8",
    name: "message_service_it_03_02.wav",
    audioSrc: "/audio/service_it_rappel.wav",
    date: "3 février 2025",
    from: "Service Informatique",
    transcript: `[Message vocal — transcription automatique]

"Monsieur le Maire, c'est encore le service informatique, avant votre changement de mot de passe.
Un dernier conseil : évitez de simplement coller la fondation de la ville et votre date de naissance l'une à côté de l'autre.
Ajoutez vos initiales préférées et des symboles, au milieu et à la fin. Là, ce sera parfait.
Rappelez-nous au 214 si besoin."`,
  },
];

// Listes complètes utilisées par les applications
export const allInboxMails: FileItem[] = [...mails, ...extraInboxMails];
export const allDeletedMails: FileItem[] = [...deletedMails, ...extraDeletedMails];
export const allVoiceMessages: VoiceMessage[] = [...voiceMessages, ...extraVoiceMessages];
