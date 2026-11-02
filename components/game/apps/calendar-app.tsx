"use client";

import { useState, useRef } from "react";
import { useTextHighlight } from "@/lib/use-text-highlight";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, X, Bell } from "lucide-react";
import { calendarEvents } from "@/lib/game-data";
import { useSound } from "@/hooks/use-sound";
import { useGame, type WindowState } from "@/lib/game-context";
import { gameNow } from "@/lib/game-clock";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

// Extended event data for detail view
const eventDetails: Record<string, { time?: string; location?: string; description?: string }> = {
  "Anniversaire Bernard - 58 ans": {
    time: "Toute la journée",
    description: "Joyeux anniversaire ! Vous fêterez vos 58 ans. Né en 1967, vous avez parcouru un long chemin...",
  },
  "Anniversaire de mariage - 32 ans": {
    time: "19h00",
    location: "Restaurant Le Phare",
    description: "32 ans de mariage avec Marie. Réservation faite au restaurant.",
  },
  "Inauguration Square Léon Blum": {
    time: "15h00",
    location: "Square Léon Blum, Centre-ville",
    description: "Cérémonie officielle en présence du Préfet. Ne pas oublier l'écharpe tricolore.",
  },
  "Exposition Musée Maritime": {
    time: "18h00",
    location: "Musée Maritime de Bourg-sur-Mer",
    description: "Inauguration de l'exposition 'Mémoires de la Mer - 1832-2025'. Discours prévu.",
  },
  "RDV Cardiologue 14h": {
    time: "14h00",
    location: "Cabinet Dr. Martin, 15 rue de la Santé",
    description: "Visite de contrôle annuelle. Penser à apporter les derniers résultats d'analyse.",
  },
};

const MONTH_INDEX: Record<string, number> = {
  janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11,
};

// "14 avril 2025" -> { day: 14, month: 3, year: 2025 }
function parseEventDate(text: string) {
  const match = text.toLowerCase().match(/^(\d{1,2})\s+(\S+)\s+(\d{4})$/);
  if (!match) return null;
  const month = MONTH_INDEX[match[2]];
  if (month === undefined) return null;
  return { day: Number(match[1]), month, year: Number(match[3]) };
}

interface CalendarAppProps {
  window: WindowState;
}

export function CalendarApp({ window: win }: CalendarAppProps) {
  const [today] = useState(() => gameNow());
  // Ouvert depuis le carnet d'indices : on va au mois de l'événement source et on l'affiche
  const [targetEvent] = useState(() =>
    win.target ? calendarEvents.find((e) => e.event === win.target?.id) ?? null : null
  );
  const [targetDate] = useState(() => {
    const d = targetEvent ? parseEventDate(targetEvent.date) : null;
    return d ? new Date(d.year, d.month, d.day) : null;
  });
  const [currentDate, setCurrentDate] = useState(() =>
    targetDate
      ? new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
      : new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    () => targetDate ?? new Date(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const [selectedEvent, setSelectedEvent] = useState<typeof calendarEvents[0] | null>(targetEvent);
  const eventDetailRef = useRef<HTMLDivElement>(null);
  useTextHighlight(
    eventDetailRef,
    selectedEvent && selectedEvent.event === win.target?.id ? win.target?.highlight : undefined,
    win.id,
    [selectedEvent?.event]
  );
  const [view, setView] = useState<"calendar" | "agenda">("calendar");
  const { playSound } = useSound();
  const { addClue } = useGame();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  
  let startDay = firstDayOfMonth.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const prevMonth = () => {
    playSound("click");
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    playSound("click");
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDate = (day: number) => {
    return calendarEvents.filter((event) => {
      const d = parseEventDate(event.date);
      return d !== null && d.day === day && d.month === month && d.year === year;
    });
  };

  const isTodayCell = (day: number | null) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const handleEventClick = (event: typeof calendarEvents[0]) => {
    playSound("click");
    setSelectedEvent(event);
    
    // Detect clues
    if (event.event.includes("58 ans")) {
      addClue({
        category: "date",
        text: "L'anniversaire de Bernard est le 14 avril, il aura 58 ans (né en 1967)",
        source: "Calendrier",
        ref: { kind: "event", id: event.event },
        highlight: "58 ans",
      });
    }
    if (event.event.includes("32 ans")) {
      addClue({
        category: "date",
        text: "Mariage en 1993, soit 32 ans en 2025",
        source: "Calendrier",
        ref: { kind: "event", id: event.event },
        highlight: "32 ans",
      });
    }
  };

  // Generate calendar grid
  const calendarDays = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="relative flex h-full">
      {/* Sidebar */}
      <div className="w-72 bg-[#1f1f1f] border-r border-white/10 flex flex-col">
        {/* View toggle */}
        <div className="p-3 border-b border-white/10">
          <div className="flex rounded-lg bg-[#2d2d2d] p-1">
            <button
              onClick={() => setView("calendar")}
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                view === "calendar" ? "bg-[#0078d4] text-white" : "text-white/70 hover:text-white"
              }`}
            >
              Calendrier
            </button>
            <button
              onClick={() => setView("agenda")}
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                view === "agenda" ? "bg-[#0078d4] text-white" : "text-white/70 hover:text-white"
              }`}
            >
              Agenda
            </button>
          </div>
        </div>

        {/* Mini calendar */}
        <div className="p-3 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-white/70" />
            </button>
            <span className="text-sm text-white font-medium">
              {MONTHS[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-white/70" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {DAYS.map((day) => (
              <div key={day} className="text-xs text-white/40 py-1">
                {day.charAt(0)}
              </div>
            ))}
            {calendarDays.map((day, index) => {
              const hasEvent = day ? getEventsForDate(day).length > 0 : false;
              const isSelected = day && selectedDate?.getDate() === day && selectedDate?.getMonth() === month;
              const isToday = isTodayCell(day);

              return (
                <button
                  key={index}
                  onClick={() => {
                    if (day) {
                      playSound("click");
                      setSelectedDate(new Date(year, month, day));
                    }
                  }}
                  disabled={!day}
                  className={`text-xs py-1.5 rounded-lg transition-colors relative ${
                    !day 
                      ? "" 
                      : isSelected
                        ? "bg-[#0078d4] text-white"
                        : isToday
                          ? "bg-[#0078d4]/30 text-white ring-1 ring-[#0078d4]"
                          : "text-white/70 hover:bg-white/10"
                  }`}
                >
                  {day}
                  {hasEvent && !isSelected && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#f4c542]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events list */}
        <div className="flex-1 overflow-auto">
          <div className="p-3">
            <h3 className="text-xs text-white/50 font-medium mb-3 uppercase tracking-wider">Tous les événements</h3>
            <div className="space-y-2">
              {calendarEvents.map((event, index) => (
                <button 
                  key={index}
                  onClick={() => handleEventClick(event)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    event.important 
                      ? "bg-[#0078d4]/20 border-l-3 border-[#0078d4] hover:bg-[#0078d4]/30" 
                      : "bg-white/5 hover:bg-white/10"
                  } ${selectedEvent?.event === event.event ? "ring-1 ring-[#0078d4]" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    {event.important && <Bell className="w-4 h-4 text-[#0078d4] mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white/90 truncate">{event.event}</div>
                      <div className="text-xs text-white/50 mt-0.5">{event.date}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-[#191919]">
        {view === "calendar" ? (
          <>
            {/* Calendar header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5 text-white/70" />
                </button>
                <h2 className="text-xl font-medium text-white">
                  {MONTHS[month]} {year}
                </h2>
                <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5 text-white/70" />
                </button>
              </div>
              <button 
                onClick={() => {
                  playSound("click");
                  setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
                  setSelectedDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
                }}
                className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Aujourd'hui
              </button>
            </div>

            {/* Calendar grid */}
            <div className="flex-1 p-4 overflow-auto">
              <div className="grid grid-cols-7 h-full gap-px bg-white/10 rounded-xl overflow-hidden">
                {DAYS.map((day) => (
                  <div key={day} className="bg-[#252525] p-3 text-center text-sm text-white/50 font-medium">
                    {day}
                  </div>
                ))}
                
                {calendarDays.map((day, index) => {
                  const events = day ? getEventsForDate(day) : [];
                  const isSelected = day && selectedDate?.getDate() === day && selectedDate?.getMonth() === month;
                  const isToday = isTodayCell(day);

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (day) {
                          playSound("click");
                          setSelectedDate(new Date(year, month, day));
                        }
                      }}
                      className={`bg-[#1a1a1a] p-2 text-left transition-colors min-h-[90px] ${
                        day ? "hover:bg-white/5 cursor-pointer" : ""
                      } ${isSelected ? "ring-2 ring-inset ring-[#0078d4]" : ""}`}
                    >
                      {day && (
                        <div className="flex flex-col h-full">
                          <span className={`text-sm mb-1 ${
                            isToday 
                              ? "w-7 h-7 flex items-center justify-center rounded-full bg-[#0078d4] text-white font-medium" 
                              : "text-white/70"
                          }`}>
                            {day}
                          </span>
                          <div className="flex-1 space-y-1">
                            {events.slice(0, 2).map((event, i) => (
                              <div 
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventClick(event);
                                }}
                                className={`px-2 py-1 rounded text-xs truncate cursor-pointer transition-colors ${
                                  event.important 
                                    ? "bg-[#0078d4] text-white hover:bg-[#1084d8]" 
                                    : "bg-white/10 text-white/70 hover:bg-white/20"
                                }`}
                              >
                                {event.event.split(" - ")[0]}
                              </div>
                            ))}
                            {events.length > 2 && (
                              <div className="text-xs text-white/50 px-2">
                                +{events.length - 2} autres
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Agenda view */
          <div className="flex-1 overflow-auto p-4">
            <h2 className="text-xl font-medium text-white mb-4">Agenda</h2>
            <div className="space-y-4">
              {calendarEvents.map((event, index) => {
                const details = eventDetails[event.event] || {};
                return (
                  <button
                    key={index}
                    onClick={() => handleEventClick(event)}
                    className={`w-full rounded-xl overflow-hidden text-left transition-all ${
                      selectedEvent?.event === event.event ? "ring-2 ring-[#0078d4]" : ""
                    }`}
                  >
                    <div className={`p-4 ${event.important ? "bg-[#0078d4]/20" : "bg-white/5"}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          event.important ? "bg-[#0078d4]" : "bg-white/10"
                        }`}>
                          <CalendarIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{event.event}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                            <span>{event.date}</span>
                            {details.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {details.time}
                              </span>
                            )}
                          </div>
                          {details.location && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-white/50">
                              <MapPin className="w-3.5 h-3.5" />
                              {details.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Event detail modal */}
        {selectedEvent && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
            <div ref={eventDetailRef} className="bg-[#2d2d2d] rounded-xl max-w-md w-full animate-window-open">
              <div className={`p-6 rounded-t-xl ${selectedEvent.important ? "bg-[#0078d4]" : "bg-[#404040]"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-8 h-8 text-white" />
                    <div>
                      <h3 className="font-semibold text-white text-lg">{selectedEvent.event}</h3>
                      <p className="text-white/80 text-sm">{selectedEvent.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {eventDetails[selectedEvent.event] && (
                  <div className="space-y-4">
                    {eventDetails[selectedEvent.event].time && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-white/50" />
                        <span className="text-white/80">{eventDetails[selectedEvent.event].time}</span>
                      </div>
                    )}
                    {eventDetails[selectedEvent.event].location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-white/50" />
                        <span className="text-white/80">{eventDetails[selectedEvent.event].location}</span>
                      </div>
                    )}
                    {eventDetails[selectedEvent.event].description && (
                      <p className="text-white/60 text-sm leading-relaxed pt-2 border-t border-white/10">
                        {eventDetails[selectedEvent.event].description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
