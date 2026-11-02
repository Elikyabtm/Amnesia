// Appel de Marie à mi-partie. Cohérent avec l'histoire : inauguration du
// square Léon Blum demain (21 février), RDV cardiologue du 13, anniversaire
// le 14 avril et anniversaire de mariage le 15 avril.

export interface CallChoice {
  id: string;
  label: string;
  reply: string;
  /** Effet sur la jauge (méfiance de Marie) */
  suspicion: number;
  /** Petit indice donné par Marie */
  clue?: string;
  highlight?: string;
}

export const MARIE_OPENING =
  "Bernard ? C'est moi. Tu étais bizarre ce matin... Tu m'as regardée au petit-déjeuner comme si tu ne me reconnaissais pas, et tu as cherché tes clés pendant dix minutes. Tout va bien, mon chéri ?";

export const MARIE_CHOICES: CallChoice[] = [
  {
    id: "tired",
    label: "« Oui, ne t'inquiète pas. Juste fatigué, l'inauguration de demain me stresse. »",
    reply:
      "Ah, le square Léon Blum... Tu travailles trop. Et tu oublies tout en ce moment : l'autre jour tu m'as même demandé ton propre mot de passe ! Je t'ai rappelé ce que tu m'avais dit : « ma ville avant ma naissance, et mes symboles de musicien ». Pense à te reposer, d'accord ? Je t'embrasse.",
    suspicion: 0,
    clue: "Marie se souvient : dans son mot de passe, Bernard a mis « sa ville avant sa naissance »",
    highlight: "ma ville avant ma naissance",
  },
  {
    id: "who",
    label: "« Pardon... qui est à l'appareil ? »",
    reply:
      "Comment ça, qui est à l'appareil ?! Bernard, c'est Marie. Ta femme. Tu me fais peur... Je vais appeler le docteur Martin, ce n'est pas normal. Ne bouge pas de ton bureau.",
    suspicion: 8,
  },
  {
    id: "busy",
    label: "« Je ne peux pas parler, je suis en réunion. »",
    reply: "En réunion ? Ta secrétaire m'a dit que tu étais seul dans ton bureau... Bon. On en parle ce soir.",
    suspicion: 4,
  },
];
