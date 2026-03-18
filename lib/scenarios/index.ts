// Export de tous les scénarios disponibles
import { maireBernardDupuis } from "./maire";
import { streamerShadowPlay } from "./streamer";
import { detectiveVictorHale } from "./detective";
import { chefMarcoSilva } from "./chef";
import { developpeurLucas } from "./developpeur";
import type { Scenario, CompletedScenario, GameProgress } from "./types";

// Liste de tous les scénarios disponibles
export const allScenarios: Scenario[] = [
  maireBernardDupuis,
  streamerShadowPlay,
  chefMarcoSilva,
  developpeurLucas,
  detectiveVictorHale,
];

// Scénarios débloqués par défaut
export const defaultUnlockedScenarios = [
  "maire-bernard-dupuis",
  "streamer-shadowplay",
  "chef-marco-silva",
];

// Fonction pour obtenir un scénario par ID
export function getScenarioById(id: string): Scenario | undefined {
  return allScenarios.find((s) => s.id === id);
}

// Fonction pour obtenir le scénario suivant après complétion
export function getNextScenarioToUnlock(completedIds: string[]): string | null {
  const allIds = allScenarios.map((s) => s.id);
  const locked = allIds.filter(
    (id) => !completedIds.includes(id) && !defaultUnlockedScenarios.includes(id)
  );
  return locked.length > 0 ? locked[0] : null;
}

// Clé localStorage pour la progression
export const PROGRESS_STORAGE_KEY = "amnesia-game-progress";

// Fonction pour charger la progression
export function loadGameProgress(): GameProgress {
  if (typeof window === "undefined") {
    return {
      completedScenarios: [],
      unlockedScenarios: [...defaultUnlockedScenarios],
      currentScenarioId: null,
    };
  }

  const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
  if (!saved) {
    return {
      completedScenarios: [],
      unlockedScenarios: [...defaultUnlockedScenarios],
      currentScenarioId: null,
    };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      ...parsed,
      completedScenarios: parsed.completedScenarios.map((c: CompletedScenario) => ({
        ...c,
        completedAt: new Date(c.completedAt),
      })),
    };
  } catch {
    return {
      completedScenarios: [],
      unlockedScenarios: [...defaultUnlockedScenarios],
      currentScenarioId: null,
    };
  }
}

// Fonction pour sauvegarder la progression
export function saveGameProgress(progress: GameProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

// Fonction pour marquer un scénario comme complété
export function completeScenario(
  progress: GameProgress,
  scenarioId: string,
  endingId: string,
  secretsFound: number,
  totalSecrets: number
): GameProgress {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) return progress;

  const newCompleted: CompletedScenario = {
    scenarioId,
    characterName: scenario.character.name,
    profession: scenario.character.profession,
    completedAt: new Date(),
    endingId,
    secretsFound,
    totalSecrets,
  };

  // Vérifier si déjà complété
  const existingIndex = progress.completedScenarios.findIndex(
    (c) => c.scenarioId === scenarioId
  );

  let newCompletedList: CompletedScenario[];
  if (existingIndex >= 0) {
    // Mettre à jour si meilleur score
    const existing = progress.completedScenarios[existingIndex];
    if (secretsFound > existing.secretsFound) {
      newCompletedList = [...progress.completedScenarios];
      newCompletedList[existingIndex] = newCompleted;
    } else {
      newCompletedList = progress.completedScenarios;
    }
  } else {
    newCompletedList = [...progress.completedScenarios, newCompleted];
  }

  // Débloquer le prochain scénario
  const completedIds = newCompletedList.map((c) => c.scenarioId);
  const nextToUnlock = getNextScenarioToUnlock(completedIds);
  
  let newUnlocked = [...progress.unlockedScenarios];
  if (nextToUnlock && !newUnlocked.includes(nextToUnlock)) {
    newUnlocked.push(nextToUnlock);
  }

  const newProgress: GameProgress = {
    ...progress,
    completedScenarios: newCompletedList,
    unlockedScenarios: newUnlocked,
  };

  saveGameProgress(newProgress);
  return newProgress;
}

// Export des types
export type { Scenario, ScenarioCharacter, ScenarioFileItem, CompletedScenario, GameProgress } from "./types";
