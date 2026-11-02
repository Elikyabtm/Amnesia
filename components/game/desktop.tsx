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
import { RandomEvents } from "./random-events";
import { SuspicionBar } from "./suspicion-bar";
import { WinScreen } from "./win-screen";
import { WindowSwitcher } from "./window-switcher";

export function Desktop() {
  const { windows, gamePhase, wallpaper } = useGame();

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
          </Window>
        ))}

        {/* Notifications */}
        <NotificationCenter />

        {/* Random Events */}
        <RandomEvents />

        {/* Suspicion Bar */}
        <SuspicionBar />

        {/* Win Screen */}
        {gamePhase === "won" && <WinScreen />}

        {/* Alt+Tab / Alt+Q */}
        <WindowSwitcher />

        {/* Taskbar */}
        <Taskbar />
      </div>
  );
}
