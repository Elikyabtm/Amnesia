// Types pour le système multi-scénarios

export interface ScenarioCharacter {
  id: string;
  name: string;
  profession: string;
  avatar?: string;
  description: string;
  difficulty: "facile" | "moyen" | "difficile" | "expert";
  theme: string; // Couleur du thème pour le bureau
}

export interface ScenarioPasswords {
  guest: string;
  admin: string;
}

export interface ScenarioPins {
  trash: string;
  trashHint: string;
  confidential: string;
  confidentialHint: string;
}

export interface ScenarioSecret {
  id: string;
  name: string;
  type: "file" | "mail" | "image";
  content: string;
  imageSrc?: string;
}

export interface ScenarioFileItem {
  id: string;
  name: string;
  type: "folder" | "file" | "image" | "mail" | "audio";
  icon?: string;
  content?: string;
  children?: ScenarioFileItem[];
  imageSrc?: string;
  audioSrc?: string;
  date?: string;
  from?: string;
  transcript?: string;
}

export interface ScenarioEnding {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  minSecrets: number;
  maxSecrets?: number;
}

export interface Scenario {
  id: string;
  character: ScenarioCharacter;
  passwords: ScenarioPasswords;
  pins: ScenarioPins;
  documents: ScenarioFileItem[];
  photos: ScenarioFileItem[];
  notes: ScenarioFileItem[];
  mails: ScenarioFileItem[];
  audioMemos: ScenarioFileItem[];
  browserHistory: ScenarioFileItem[];
  secretDocuments: ScenarioFileItem[];
  secretMails: ScenarioFileItem[];
  endings: ScenarioEnding[];
  darkSecret: string; // Description du secret sombre du personnage
}

export interface CompletedScenario {
  scenarioId: string;
  characterName: string;
  profession: string;
  completedAt: Date;
  endingId: string;
  secretsFound: number;
  totalSecrets: number;
}

export interface GameProgress {
  completedScenarios: CompletedScenario[];
  unlockedScenarios: string[];
  currentScenarioId: string | null;
}
