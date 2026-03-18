"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { 
  allScenarios, 
  getScenarioById, 
  loadGameProgress, 
  saveGameProgress,
  completeScenario as completeScenarioFn,
  type Scenario, 
  type GameProgress 
} from "./scenarios";

interface ScenarioContextType {
  // Current state
  currentScenario: Scenario | null;
  gameProgress: GameProgress;
  appPhase: "menu" | "playing" | "notebook";
  
  // Actions
  selectScenario: (scenarioId: string) => void;
  completeCurrentScenario: (endingId: string, secretsFound: number) => void;
  returnToMenu: () => void;
  openNotebook: () => void;
  closeNotebook: () => void;
  
  // Helpers
  getCurrentPasswords: () => { guest: string; admin: string };
  getCurrentPins: () => { trash: string; trashHint: string; confidential: string; confidentialHint: string };
  getTotalSecrets: () => number;
}

const ScenarioContext = createContext<ScenarioContextType | null>(null);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [gameProgress, setGameProgress] = useState<GameProgress>({
    completedScenarios: [],
    unlockedScenarios: [],
    currentScenarioId: null,
  });
  const [appPhase, setAppPhase] = useState<"menu" | "playing" | "notebook">("menu");

  // Load progress on mount
  useEffect(() => {
    const progress = loadGameProgress();
    setGameProgress(progress);
    
    // If there was a scenario in progress, restore it
    if (progress.currentScenarioId) {
      const scenario = getScenarioById(progress.currentScenarioId);
      if (scenario) {
        setCurrentScenario(scenario);
        setAppPhase("playing");
      }
    }
  }, []);

  const selectScenario = useCallback((scenarioId: string) => {
    const scenario = getScenarioById(scenarioId);
    if (scenario) {
      setCurrentScenario(scenario);
      setAppPhase("playing");
      
      // Save current scenario to progress
      const newProgress = { ...gameProgress, currentScenarioId: scenarioId };
      setGameProgress(newProgress);
      saveGameProgress(newProgress);
    }
  }, [gameProgress]);

  const completeCurrentScenario = useCallback((endingId: string, secretsFound: number) => {
    if (!currentScenario) return;
    
    const totalSecrets = currentScenario.secretDocuments.length + currentScenario.secretMails.length;
    const newProgress = completeScenarioFn(
      gameProgress, 
      currentScenario.id, 
      endingId, 
      secretsFound, 
      totalSecrets
    );
    
    // Clear current scenario
    newProgress.currentScenarioId = null;
    setGameProgress(newProgress);
    saveGameProgress(newProgress);
  }, [currentScenario, gameProgress]);

  const returnToMenu = useCallback(() => {
    setCurrentScenario(null);
    setAppPhase("menu");
    
    // Clear current scenario from progress
    const newProgress = { ...gameProgress, currentScenarioId: null };
    setGameProgress(newProgress);
    saveGameProgress(newProgress);
  }, [gameProgress]);

  const openNotebook = useCallback(() => {
    setAppPhase("notebook");
  }, []);

  const closeNotebook = useCallback(() => {
    setAppPhase(currentScenario ? "playing" : "menu");
  }, [currentScenario]);

  const getCurrentPasswords = useCallback(() => {
    if (!currentScenario) {
      return { guest: "", admin: "" };
    }
    return currentScenario.passwords;
  }, [currentScenario]);

  const getCurrentPins = useCallback(() => {
    if (!currentScenario) {
      return { trash: "", trashHint: "", confidential: "", confidentialHint: "" };
    }
    return currentScenario.pins;
  }, [currentScenario]);

  const getTotalSecrets = useCallback(() => {
    if (!currentScenario) return 0;
    return currentScenario.secretDocuments.length + currentScenario.secretMails.length;
  }, [currentScenario]);

  return (
    <ScenarioContext.Provider
      value={{
        currentScenario,
        gameProgress,
        appPhase,
        selectScenario,
        completeCurrentScenario,
        returnToMenu,
        openNotebook,
        closeNotebook,
        getCurrentPasswords,
        getCurrentPins,
        getTotalSecrets,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error("useScenario must be used within a ScenarioProvider");
  }
  return context;
}
