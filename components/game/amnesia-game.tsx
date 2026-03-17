"use client";

import { GameProvider, useGame } from "@/lib/game-context";
import { TitleScreen } from "./title-screen";
import { LoginScreen } from "./login-screen";
import { Desktop } from "./desktop";
import { VictoryScreen } from "./victory-screen";
import { BootScreen } from "./boot-screen";

function GameContent() {
  const { gamePhase, startGame, finishBooting } = useGame();

  const handleRestart = () => {
    window.location.reload();
  };

  if (gamePhase === "won") {
    return (
      <>
        <Desktop />
        <VictoryScreen onRestart={handleRestart} />
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

export function AmnesiaGame() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
