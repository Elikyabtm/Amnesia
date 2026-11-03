"use client";

import { useGame } from "@/lib/game-context";
import { Window } from "./window";
import { Taskbar } from "./taskbar";
import { DesktopIcons } from "./desktop-icons";
import { NotificationCenter } from "./notifications";
import { wallpaperBackground } from "@/lib/data/wallpapers";
import { FileExplorer } from "./apps/file-explorer";
import { MailApp } from "./apps/mail-app";
import { PhotosApp } from "./apps/photos-app";
import { NotepadApp } from "./apps/notepad-app";
import { CalendarApp } from "./apps/calendar-app";
import { TrashApp } from "./apps/trash-app";
import { PasswordApp } from "./apps/password-app";
import { BrowserApp } from "./apps/browser-app";
import { CluesApp } from "./apps/clues-app";
import { AudioApp } from "./apps/audio-app";
import { SettingsApp } from "./apps/settings-app";
import { ContactsApp } from "./apps/contacts-app";
import { TerminalApp } from "./apps/terminal-app";
import { CalculatorApp } from "./apps/calculator-app";
import { MusicApp } from "./apps/music-app";
import { PaintApp } from "./apps/paint-app";
import { MinesweeperApp } from "./apps/minesweeper-app";
import { EventManager } from "./events/event-manager";
import { SuspicionBar } from "./suspicion-bar";
import { WinScreen } from "./win-screen";
import { FinalChoiceScreen } from "./final-choice-screen";
import { WindowSwitcher } from "./window-switcher";

export function Desktop() {
  const { windows, gamePhase, wallpaper, lockedItems, finalChoice } = useGame();
  const needsFinalChoice = !finalChoice && lockedItems.some((i) => i.id === "confidential" && i.unlocked);

  return (
      <div 
        className="min-h-screen relative overflow-hidden select-none transition-[background] duration-500"
        style={{ background: wallpaperBackground(wallpaper) }}
      >
        {/* Desktop icons */}
        <DesktopIcons />

        {/* Windows */}
        {windows.map((win) => (
          <Window key={win.id} window={win}>
            {win.app === "explorer" && <FileExplorer window={win} />}
            {win.app === "mail" && <MailApp window={win} />}
            {win.app === "photos" && <PhotosApp window={win} />}
            {win.app === "notepad" && <NotepadApp window={win} />}
            {win.app === "calendar" && <CalendarApp window={win} />}
            {win.app === "trash" && <TrashApp window={win} />}
            {win.app === "password" && <PasswordApp />}
            {win.app === "browser" && <BrowserApp window={win} />}
            {win.app === "clues" && <CluesApp />}
            {win.app === "audio" && <AudioApp window={win} />}
            {win.app === "settings" && <SettingsApp window={win} />}
            {win.app === "contacts" && <ContactsApp window={win} />}
            {win.app === "terminal" && <TerminalApp window={win} />}
            {win.app === "calculator" && <CalculatorApp />}
            {win.app === "music" && <MusicApp window={win} />}
            {win.app === "paint" && <PaintApp />}
            {win.app === "minesweeper" && <MinesweeperApp />}
          </Window>
        ))}

        {/* Notifications */}
        <NotificationCenter />

        {/* Événements système et mini-jeux */}
        <EventManager />

        {/* Suspicion Bar */}
        <SuspicionBar />

        {/* Win Screen */}
        {/* Fin : choix moral si le dossier confidentiel a été ouvert, puis écran de fin */}
        {gamePhase === "won" && (needsFinalChoice ? <FinalChoiceScreen /> : <WinScreen />)}

        {/* Alt+Tab / Alt+Q */}
        <WindowSwitcher />

        {/* Taskbar */}
        <Taskbar />
      </div>
  );
}
