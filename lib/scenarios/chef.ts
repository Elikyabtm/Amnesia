import type { Scenario } from "./types";

export const chefMarcoSilva: Scenario = {
  id: "chef-marco-silva",
  character: {
    id: "marco-silva",
    name: "Marco Silva",
    profession: "Chef Cuisinier",
    description: "Chef étoilé du restaurant 'La Table de Marco', une étoile Michelin.",
    difficulty: "moyen",
    theme: "#8b0000", // Rouge bordeaux cuisine
  },
  passwords: {
    guest: "PastaTruffe2018",
    admin: "MS#Truffe1Star!2018",
  },
  pins: {
    trash: "2018",
    trashHint: "L'année de la première étoile...",
    confidential: "1985",
    confidentialHint: "Mon année de naissance en Italie",
  },
  documents: [
    {
      id: "doc1",
      name: "Menu_Degustation_Hiver.txt",
      type: "file",
      content: `LA TABLE DE MARCO
Menu Dégustation Hiver 2025
195€ par personne

AMUSE-BOUCHE
Tuile parmesan, mousse de truffe noire

ENTRÉE
Saint-Jacques snackées, beurre noisette, caviar d'Aquitaine

POISSON
Turbot de ligne, risotto crémeux aux cèpes

VIANDE
Filet de bœuf Wagyu A5, purée truffée, jus corsé

PRÉ-DESSERT
Sorbet citron yuzu, basilic cristallisé

DESSERT
Sphère chocolat Valrhona, cœur praliné, glace vanille Bourbon

Chef : Marco Silva - 1 étoile Michelin depuis 2018`
    },
    {
      id: "doc2",
      name: "Commande_Fournisseurs.pdf",
      type: "file",
      content: `COMMANDE HEBDOMADAIRE
Semaine du 17 février 2025

MAISON PÉBEYRE (Truffes) :
- 500g Truffe noire du Périgord : 850€
- 200g Truffe blanche d'Alba : 1 200€

RUNGIS MARÉE :
- 5kg Saint-Jacques (calibre U10) : 180€
- 3kg Turbot sauvage : 120€

BOUCHERIE HUGO DESNOYER :
- 2kg Wagyu A5 Kagoshima : 800€

TOTAL SEMAINE : 3 150€

Note : La truffe blanche est pour le dîner privé de samedi.
Client VIP - ne pas échouer.`
    },
    {
      id: "doc3",
      name: "Avis_Guide_Michelin_2018.txt",
      type: "file",
      content: `GUIDE MICHELIN - ÉVALUATION 2018

Restaurant : La Table de Marco
Chef : Marco Silva
Adresse : 15 rue du Commerce, Paris 15ème

NOTATION : ★ (Une étoile)

"Une cuisine d'auteur maîtrisée, où les produits italiens 
rencontrent la finesse française. Le risotto aux truffes 
est un modèle du genre. Chef à suivre."

Cette étoile, obtenue en 2018, a changé ma vie.
Né en Italie en 1985, arrivé en France à 20 ans...
Le rêve américain, version française.`
    },
  ],
  photos: [
    {
      id: "photo1",
      name: "Etoile_Michelin_2018.jpg",
      type: "image",
      imageSrc: "/images/chef_etoile.jpg",
      content: "Photo de Marco Silva recevant son étoile Michelin en 2018, sourire ému"
    },
    {
      id: "photo2",
      name: "Cuisine_Restaurant.jpg",
      type: "image",
      imageSrc: "/images/chef_cuisine.jpg",
      content: "La cuisine professionnelle de La Table de Marco, brigade en action"
    },
    {
      id: "photo3",
      name: "Plat_Signature.jpg",
      type: "image",
      imageSrc: "/images/chef_plat.jpg",
      content: "Le fameux risotto à la truffe noire, plat signature de Marco"
    },
  ],
  notes: [
    {
      id: "note1",
      name: "Recette_Risotto_Secret.txt",
      type: "file",
      content: `RISOTTO ALLA TRUFA - RECETTE SECRÈTE
(Ne jamais partager)

BASE :
- 400g Carnaroli vieilli 18 mois
- 1.5L bouillon de volaille fait maison
- 150g parmesan Reggiano 36 mois
- 100g beurre de Normandie
- 50g truffe noire râpée

TECHNIQUE :
1. Nacrer le riz SANS huile (secret!)
2. Déglacer vin blanc sec
3. Incorporer bouillon louche par louche
4. Mantecare avec beurre FROID
5. Finir avec truffe à cru

TEMPS : 18 minutes exactement

Ce risotto m'a donné mon étoile.
Et mon secret honteux...`
    },
    {
      id: "note2",
      name: "Mot_de_passe_memo.txt",
      type: "file",
      content: `Aide-mémoire sécurité :

Simple : Mon plat préféré + ingrédient star + année étoile
Exemple : PastaTruffe2018

Complet : Mes initiales + dièse + Ingrédient + 1Star + ! + année

Le 1985 c'est pour le dossier de ma naissance.
Le 2018 pour la corbeille, l'année où tout a changé.`
    },
  ],
  mails: [
    {
      id: "mail1",
      name: "Guide Michelin - Inspection prévue",
      type: "mail",
      content: `De : relations@guidemichelin.fr
Objet : Visite d'évaluation 2025
Date : 10 février 2025

Cher Chef Silva,

Dans le cadre de notre évaluation annuelle, 
nos inspecteurs visiteront votre établissement 
dans les prochaines semaines.

Comme vous le savez, les visites sont anonymes.
Nous vous souhaitons bonne continuation.

Le Guide Michelin

---

Note personnelle : 
Deuxième étoile cette année ? Il le faut.
Mais à quel prix...`
    },
    {
      id: "mail2",
      name: "Mamma - Ti voglio bene",
      type: "mail",
      content: `De : Rosa Silva <rosa.silva@libero.it>
Objet : Fiero di te, figlio mio
Date : 15 février 2025

Caro Marco,

J'ai vu l'article sur ton restaurant dans La Repubblica !
Mon fils, une étoile Michelin à Paris...
Ton père serait si fier.

Tu travailles trop. Tu manges assez ?
Viens nous voir à Naples cet été.
La vraie cuisine, c'est celle de mamma !

Ti voglio bene,
Mamma Rosa

PS: Cette recette de risotto... 
c'est vraiment celle de Nonna Maria ?`
    },
    {
      id: "mail3",
      name: "Client VIP - Dîner privé",
      type: "mail",
      content: `De : assistant@ministere-culture.gouv.fr
Objet : Dîner privé 22 février
Date : 18 février 2025

Chef Silva,

Le Ministre de la Culture souhaite organiser 
un dîner privé dans votre restaurant le 22 février.
8 personnes.

Menu dégustation truffe blanche impératif.
Budget : pas de limite.

Discrétion absolue requise.
Cette soirée pourrait accélérer votre candidature 
pour la Légion d'Honneur.

Bien cordialement,
L'assistante du Ministre`
    },
  ],
  audioMemos: [
    {
      id: "voice1",
      name: "memo_fin_service.mp3",
      type: "audio",
      date: "19 février 2025",
      from: "Moi-même",
      transcript: `[Mémo vocal après service]

"Service du soir terminé. 45 couverts, pas une erreur.

Le mot de passe de l'ordi... MS dièse Truffe 1Star exclamation 2018.
Faut que je le note quelque part.

Le dîner du ministre samedi... c'est ma chance pour la deuxième étoile.
Mais ce qu'ils me demandent...

Non. Je ne peux pas utiliser ÇA.
Ou peut-être... pour une fois ?

Personne ne saura. C'est pour l'étoile.
Pour la deuxième étoile."`
    },
  ],
  browserHistory: [
    {
      id: "web1",
      name: "TripAdvisor - La Table de Marco",
      type: "file",
      content: `LA TABLE DE MARCO
★★★★★ (4.8/5) - 847 avis

"Une expérience inoubliable !" ★★★★★
"Le risotto à la truffe est divin" ★★★★★
"Cher mais mérite chaque euro" ★★★★☆
"Le chef est un artiste" ★★★★★

Chef Marco Silva - 1 étoile Michelin depuis 2018
Menu dégustation : 195€
Réservation conseillée 3 semaines à l'avance`
    },
  ],
  secretDocuments: [
    {
      id: "secret1",
      name: "Facture_Aromes_Artificiels.pdf",
      type: "file",
      content: `FACTURE CONFIDENTIELLE
ChemFood Industries - Arômes alimentaires

Client : Marco Silva (personnel)
Livraison : Adresse privée

PRODUITS :
- Arôme truffe synthétique (qualité premium) x5 : 450€
- Exhausteur de goût MSG masqué x3 : 180€
- Colorant alimentaire "or" x2 : 90€

TOTAL : 720€

NOTE : Produits légaux mais... éthiquement discutables
pour un restaurant étoilé.

Livraison discrète. Pas de logo sur le colis.

---

Mon secret honteux : parfois, quand la vraie truffe 
est trop chère ou indisponible, j'utilise ça.
Personne ne fait la différence. Même le Michelin.`
    },
    {
      id: "secret2",
      name: "Vrai_Origine_Recette.txt",
      type: "file",
      content: `LA VÉRITÉ SUR "MA" RECETTE

Le risotto qui m'a donné l'étoile...
Ce n'est pas ma création.

C'est la recette de Luigi Benedetti, mon ancien mentor.
Il m'a formé pendant 5 ans à Rome.
Il est mort en 2016 sans avoir été reconnu.

J'ai pris sa recette. J'ai dit que c'était la mienne.
"La recette de ma grand-mère Maria" - quelle blague.

Luigi méritait cette étoile. Pas moi.

Si sa famille l'apprend...
Si le Michelin l'apprend...

Tout s'écroule.`
    },
    {
      id: "secret3",
      name: "Message_Fils_Luigi.txt",
      type: "file",
      content: `MESSAGE REÇU - Instagram DM

De : @benedetti_paolo
Date : 20 février 2025

"Marco Silva,

Je suis Paolo, le fils de Luigi Benedetti.

J'ai retrouvé les carnets de recettes de mon père.
Le risotto alla tartufo... page 47.
Exactement comme vous le faites.

Mon père vous a tout appris. Et vous lui avez tout volé.

J'ai contacté un journaliste du Figaro.
L'article sort dans 2 semaines.

À moins que vous ne fassiez quelque chose.
200 000€ pour mon silence.

Vous avez jusqu'au 1er mars.

Paolo Benedetti"

---

Note : Je suis foutu. Tout est foutu.
Payer ? Avec quel argent ?
Tout avouer ? Perdre l'étoile, le restaurant, tout.

Qu'est-ce que je fais ?`
    },
  ],
  secretMails: [
    {
      id: "secretmail1",
      name: "Journaliste Figaro - Questions",
      type: "mail",
      content: `De : m.dupont@lefigaro.fr
Objet : Questions sur vos origines culinaires
Date : 21 février 2025

Chef Silva,

Je prépare un article sur les "secrets des grands chefs".
J'ai reçu des informations troublantes vous concernant.

Luigi Benedetti. Rome. 2010-2015.
Le risotto alla tartufo.

Souhaitez-vous commenter avant publication ?

Marie Dupont
Le Figaro - Rubrique Gastronomie`
    },
    {
      id: "secretmail2",
      name: "Fournisseur arômes - Renouvellement",
      type: "mail",
      content: `De : commercial@chemfood.com
Objet : Renouvellement commande
Date : 22 février 2025

Cher client,

Nous n'avons pas reçu votre commande mensuelle 
d'arômes truffe synthétique.

Souhaitez-vous maintenir votre abonnement ?
Rappel : notre produit est utilisé par de nombreux 
établissements étoilés (confidentialité garantie).

PS: Votre facture de janvier est en pièce jointe.
Merci de ne pas la laisser traîner sur votre ordinateur ;)

ChemFood Industries`
    },
  ],
  endings: [
    {
      id: "innocent",
      title: "L'Artiste",
      subtitle: "Un chef passionné, rien de plus.",
      description: "Vous êtes Marco Silva, chef étoilé. Votre cuisine parle pour vous.",
      icon: "ChefHat",
      minSecrets: 0,
      maxSecrets: 0,
    },
    {
      id: "curious",
      title: "L'Imposteur",
      subtitle: "Ces arômes artificiels...",
      description: "Vous utilisez des raccourcis que vos clients ignorent.",
      icon: "Search",
      minSecrets: 1,
      maxSecrets: 1,
    },
    {
      id: "detective",
      title: "Le Voleur",
      subtitle: "Votre étoile ne vous appartient pas.",
      description: "Recette volée, arômes artificiels, chantage... Votre empire gastronomique repose sur des mensonges.",
      icon: "Eye",
      minSecrets: 2,
    },
  ],
  darkSecret: "Marco Silva a volé la recette signature de son mentor décédé et utilise des arômes artificiels dans son restaurant étoilé. Il est maintenant victime de chantage.",
};
