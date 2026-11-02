// Réseaux Wi-Fi visibles depuis le bureau du maire (mairie, sur le port).

export interface WifiNetwork {
  ssid: string;
  /** Force du signal, de 1 à 4 barres */
  signal: 1 | 2 | 3 | 4;
  secured: boolean;
  /** Réseau auquel l'ordinateur est connecté au démarrage */
  connected?: boolean;
  /** Message affiché quand on tente de s'y connecter */
  connectMessage: string;
}

export const WIFI_NETWORKS: WifiNetwork[] = [
  {
    ssid: "Mairie-BSM",
    signal: 4,
    secured: true,
    connected: true,
    connectMessage: "Connecté, sécurisé (WPA2-Entreprise). Réseau géré par le service informatique de la mairie.",
  },
  {
    ssid: "Mairie-BSM-Invités",
    signal: 3,
    secured: false,
    connectMessage: "Portail captif : acceptez les conditions d'utilisation à l'accueil de la mairie.",
  },
  {
    ssid: "Port-de-Plaisance_WiFi",
    signal: 2,
    secured: false,
    connectMessage: "Connexion impossible : signal trop faible depuis le bureau.",
  },
  {
    ssid: "Bibliotheque-Municipale",
    signal: 2,
    secured: true,
    connectMessage: "Clé de sécurité requise. Demandez-la à l'accueil de la bibliothèque.",
  },
  {
    ssid: "Le-Phare-Redaction",
    signal: 1,
    secured: true,
    connectMessage: "Clé de sécurité incorrecte. Ce réseau appartient au journal Le Phare.",
  },
];
