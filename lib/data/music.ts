// Playlist jazz de Bernard, en lien avec le Festival Jazz BSM 2024
// (programme dans Téléchargements : Les Marins du Swing, Quartet du Phare,
// trio "Do dièse", scène ouverte, concert de clôture du 14 juillet).
// La musique est générée en direct (lib/jazz-synth.ts) : aucun fichier audio.

export type ChordQuality = "maj7" | "m7" | "7" | "m7b5" | "6";

export interface Track {
  id: string;
  title: string;
  artist: string;
  recorded: string;
  /** Durée nominale en secondes, avant passage au morceau suivant */
  duration: number;
  bpm: number;
  /** Grille d'accords (une mesure par accord) : [note MIDI de la fondamentale, qualité] */
  chords: [number, ChordQuality][];
  /** Note de Bernard affichée avec le morceau */
  note?: string;
}

export const PLAYLIST_NAME = "Festival Jazz BSM 2024 — mes préférés";

export const PLAYLIST: Track[] = [
  {
    id: "track1",
    title: "Quai des Brumes",
    artist: "Les Marins du Swing",
    recorded: "Festival Jazz BSM, 12 juillet 2024",
    duration: 150,
    bpm: 132,
    chords: [[53, "maj7"], [50, "7"], [55, "m7"], [48, "7"]],
    note: "Le concert d'ouverture, sur le port. Marie a dansé toute la soirée.",
  },
  {
    id: "track2",
    title: "Phare Ouest",
    artist: "Quartet du Phare",
    recorded: "Festival Jazz BSM, 12 juillet 2024",
    duration: 140,
    bpm: 112,
    chords: [[50, "m7"], [55, "7"], [48, "maj7"], [57, "7"]],
  },
  {
    id: "track3",
    title: "Valse pour Marie",
    artist: "Trio Do dièse",
    recorded: "Festival Jazz BSM, 13 juillet 2024",
    duration: 160,
    bpm: 96,
    chords: [[49, "maj7"], [54, "maj7"], [51, "m7"], [56, "7"]],
    note: "Notre morceau. Pour le 15 avril, au Phare.",
  },
  {
    id: "track4",
    title: "Dièse & Mer (blues en do dièse)",
    artist: "Trio Do dièse",
    recorded: "Festival Jazz BSM, 13 juillet 2024",
    duration: 130,
    bpm: 120,
    chords: [[49, "7"], [54, "7"], [49, "7"], [49, "7"], [54, "7"], [54, "7"], [49, "7"], [56, "7"]],
    note: "Le dièse, mon symbole préféré. J'en ai même un sur mon t-shirt du festival.",
  },
  {
    id: "track5",
    title: "Bourg 1832",
    artist: "Scène ouverte des écoles de musique",
    recorded: "Festival Jazz BSM, 13 juillet 2024",
    duration: 120,
    bpm: 104,
    chords: [[48, "6"], [45, "m7"], [50, "m7"], [55, "7"]],
  },
  {
    id: "track6",
    title: "Point final !",
    artist: "Concert de clôture",
    recorded: "Quai du port, 14 juillet 2024",
    duration: 150,
    bpm: 144,
    chords: [[53, "6"], [50, "7"], [55, "m7"], [48, "7"], [57, "m7b5"], [50, "7"], [55, "m7"], [48, "7"]],
    note: "Comme mes discours et mes mots de passe : il faut toujours finir sur un point d'exclamation !",
  },
];

/** Morceau dont la note donne un indice */
export const MUSIC_CLUE = {
  trackId: "track6",
  text: "Bernard aime « toujours finir sur un point d'exclamation ! », même ses mots de passe",
  highlight: "point d'exclamation",
};
