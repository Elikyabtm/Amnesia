// Contenu de l'application Paramètres.
// Cohérent avec Historique_Connexions.txt (changement de mot de passe le
// 03/02/2025 à 08:15 après deux échecs) et la réunion sécurité du 28/01.

export interface LoginEntry {
  date: string;
  event: string;
  status: "ok" | "fail" | "info";
}

export const LOGIN_HISTORY: LoginEntry[] = [
  { date: "20/02/2025 08:41", event: "Ouverture de session", status: "ok" },
  { date: "19/02/2025 23:05", event: "Verrouillage de la session", status: "info" },
  { date: "19/02/2025 08:37", event: "Ouverture de session", status: "ok" },
  { date: "03/02/2025 08:15", event: "Mot de passe modifié — nouveau mot de passe accepté", status: "info" },
  { date: "03/02/2025 08:12", event: "Échec de connexion (ancien mot de passe)", status: "fail" },
  { date: "03/02/2025 08:10", event: "Échec de connexion", status: "fail" },
  { date: "02/02/2025 09:00", event: "Ouverture de session", status: "ok" },
];

/** Critères du mot de passe actuel, tels que vérifiés par la stratégie de sécurité */
export const PASSWORD_POLICY_REPORT = {
  changedOn: "3 février 2025, 08:15",
  length: 17,
  details: "Majuscules, chiffres et 2 symboles — conforme à la stratégie du service informatique",
};

export interface UpdateEntry {
  id: string;
  date: string;
  title: string;
  description: string;
}

export const UPDATE_HISTORY: UpdateEntry[] = [
  {
    id: "KB2025-0214",
    date: "14 février 2025",
    title: "Mise à jour de sécurité mensuelle",
    description: "Correctifs de sécurité pour AmnesiaOS 1.0.",
  },
  {
    id: "KB2025-0203",
    date: "3 février 2025",
    title: "Stratégie de mots de passe renforcée (Service informatique de la mairie)",
    description:
      "Longueur minimale portée à 12 caractères ; au moins un symbole exigé. Appliquée au poste du maire après la réunion sécurité du 28 janvier.",
  },
  {
    id: "KB2025-0117",
    date: "17 janvier 2025",
    title: "Pilote audio Realtek",
    description: "Améliore la lecture des messages vocaux.",
  },
  {
    id: "KB2024-1210",
    date: "10 décembre 2024",
    title: "Mise à jour des fonctionnalités AmnesiaOS 1.0",
    description: "Nouveau menu Démarrer et centre de notifications.",
  },
];

export const SYSTEM_INFO = [
  { label: "Nom de l'appareil", value: "PC-MAIRE-BSM" },
  { label: "Système", value: "AmnesiaOS 1.0 (build 1832)" },
  { label: "Processeur", value: "Intel Core i5-1135G7 @ 2.40 GHz" },
  { label: "Mémoire", value: "16 Go" },
  { label: "Stockage", value: "512 Go SSD — 214 Go utilisés" },
  { label: "Propriétaire", value: "Mairie de Bourg-sur-Mer — service informatique (poste 214)" },
];

export const NETWORK_INFO = [
  { label: "Réseau", value: "Mairie-BSM (Wi-Fi, WPA2-Entreprise)" },
  { label: "Adresse IPv4", value: "192.168.18.32" },
  { label: "Passerelle", value: "192.168.18.1" },
  { label: "DNS", value: "dns.bourg-sur-mer.fr" },
  { label: "Proxy", value: "proxy.mairie-bsm.local:8080 (filtrage des sites)" },
];
