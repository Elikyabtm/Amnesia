// Fonds d'écran proposés dans "Personnaliser" (clic droit sur le bureau) et
// dans Paramètres > Personnalisation.

export interface Wallpaper {
  id: string;
  label: string;
  /** Valeur CSS "background" */
  background: string;
}

export const WALLPAPERS: Wallpaper[] = [
  { id: "default", label: "Vagues (par défaut)", background: "url('/images/wallpaper.jpg') center / cover" },
  { id: "login", label: "Aurore", background: "url('/images/login-bg.jpg') center / cover" },
  { id: "port", label: "Port de Bourg-sur-Mer", background: "url('/images/concert_jazz.jpg') center / cover" },
  { id: "musee", label: "Musée Maritime", background: "url('/images/photo_musee.jpg') center / cover" },
  { id: "ocean", label: "Océan", background: "linear-gradient(135deg, #0b3d5c 0%, #1673a8 50%, #5fb3d9 100%)" },
  { id: "sunset", label: "Coucher de soleil", background: "linear-gradient(160deg, #2b1055 0%, #d53369 55%, #f6a04d 100%)" },
  { id: "night", label: "Nuit", background: "radial-gradient(circle at 30% 20%, #1e2a4a 0%, #0a0f1f 70%)" },
  { id: "plain", label: "Uni sombre", background: "#1b1f24" },
];

export const DEFAULT_WALLPAPER = "default";

export function wallpaperBackground(id: string) {
  return (WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0]).background;
}
