"use client";

import { GameProvider, useGame } from "@/lib/game-context";
import { SoundProvider } from "@/lib/sound-context";
import { TitleScreen } from "./title-screen";
import { LoginScreen } from "./login-screen";
import { Desktop } from "./desktop";
import { BootScreen } from "./boot-screen";

function GameContent() {
  const { gamePhase, startGame, finishBooting } = useGame();

  // Desktop renders the WinScreen itself once the game is won
  if (gamePhase === "exploring" || gamePhase === "won") {
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
    <SoundProvider>
      <GameProvider>
        <GameContent />
      </GameProvider>
    </SoundProvider>
  );
}
