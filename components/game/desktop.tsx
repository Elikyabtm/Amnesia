"use client";

import { useGame } from "@/lib/game-context";
import { Window } from "./window";
import { Taskbar } from "./taskbar";
import { DesktopIcons } from "./desktop-icons";
import { NotificationCenter } from "./notifications";
import { ContextMenuProvider } from "./context-menu";
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

export function Desktop() {
  const { windows } = useGame();

  return (
    <ContextMenuProvider>
      <div 
        className="min-h-screen bg-cover bg-center relative overflow-hidden select-none"
        style={{ backgroundImage: "url('/images/wallpaper.jpg')" }}
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
            {win.app === "calendar" && <CalendarApp />}
            {win.app === "trash" && <TrashApp window={win} />}
            {win.app === "password" && <PasswordApp />}
            {win.app === "browser" && <BrowserApp />}
            {win.app === "clues" && <CluesApp />}
            {win.app === "audio" && <AudioApp />}
          </Window>
        ))}

        {/* Notifications */}
        <NotificationCenter />

        {/* Random Events */}
        <RandomEvents />

        {/* Taskbar */}
        <Taskbar />
      </div>
    </ContextMenuProvider>
  );
}
