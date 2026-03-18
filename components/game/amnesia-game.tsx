"use client";

import { useState } from "react";
import { GameProvider, useGame } from "@/lib/game-context";
import { SoundProvider } from "@/lib/sound-context";
import { ScenarioProvider, useScenario } from "@/lib/scenario-context";
import { TitleScreen } from "./title-screen";
import { LoginScreen } from "./login-screen";
import { Desktop } from "./desktop";
import { VictoryScreen } from "./victory-screen";
import { BootScreen } from "./boot-screen";
import { ScenarioSelect } from "./scenario-select";
import { IdentityNotebook } from "./identity-notebook";

function GameContent() {
  const { gamePhase, startGame, finishBooting } = useGame();
  const { returnToMenu, completeCurrentScenario, getTotalSecrets, currentScenario } = useScenario();

  const handleRestart = () => {
    window.location.reload();
  };

  const handleReturnToMenu = () => {
    returnToMenu();
    window.location.reload();
  };

  if (gamePhase === "won") {
    return (
      <>
        <Desktop />
        <VictoryScreen 
          onRestart={handleRestart} 
          onReturnToMenu={handleReturnToMenu}
        />
      </>
    );
  }

  if (gamePhase === "exploring") {
    return <Desktop />;
  }

  if (gamePhase === "booting") {
    return <BootScreen onComplete={finishBooting} />;
  }

  if (gamePhase === "intro") {
    return <LoginScreen />;
  }

  return <TitleScreen onStart={startGame} />;
}

function AppContent() {
  const { appPhase, selectScenario, openNotebook, closeNotebook, currentScenario } = useScenario();
  const [notebookOpen, setNotebookOpen] = useState(false);

  const handleOpenNotebook = () => {
    setNotebookOpen(true);
  };

  const handleCloseNotebook = () => {
    setNotebookOpen(false);
  };

  // Show scenario selection if no scenario is selected
  if (!currentScenario) {
    return (
      <>
        <ScenarioSelect 
          onSelectScenario={selectScenario}
          onOpenNotebook={handleOpenNotebook}
        />
        <IdentityNotebook 
          isOpen={notebookOpen}
          onClose={handleCloseNotebook}
        />
      </>
    );
  }

  // Show game with current scenario
  return (
    <GameProvider scenario={currentScenario}>
      <GameContent />
    </GameProvider>
  );
}

export function AmnesiaGame() {
  return (
    <SoundProvider>
      <ScenarioProvider>
        <AppContent />
      </ScenarioProvider>
    </SoundProvider>
  );
}
