"use client";

import { useEffect, useRef, useState } from "react";
import { ListMusic, Music2, Pause, Play, SkipBack, SkipForward, StickyNote, Volume2, VolumeX } from "lucide-react";
import { useGame, type WindowState } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { useTextHighlight } from "@/lib/use-text-highlight";
import { JazzSynth } from "@/lib/jazz-synth";
import { MUSIC_CLUE, PLAYLIST, PLAYLIST_NAME } from "@/lib/data/music";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

interface MusicAppProps {
  window: WindowState;
}

export function MusicApp({ window: win }: MusicAppProps) {
  const { addClue } = useGame();
  const { volume, setVolume, isMuted, toggleMute } = useSound();
  const [index, setIndex] = useState(() => Math.max(0, PLAYLIST.findIndex((t) => t.id === win.target?.id)));
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const synthRef = useRef<JazzSynth | null>(null);
  const startRef = useRef<{ at: number; from: number }>({ at: 0, from: 0 });
  const detailsRef = useRef<HTMLDivElement>(null);

  const track = PLAYLIST[index];
  const effectiveVolume = isMuted ? 0 : volume;

  useTextHighlight(detailsRef, track.id === win.target?.id ? win.target?.highlight : undefined, win.id, [track.id]);

  // Indice : la note de Bernard sur le dernier morceau
  useEffect(() => {
    if (track.id !== MUSIC_CLUE.trackId) return;
    addClue({
      category: "password",
      text: MUSIC_CLUE.text,
      source: `Musique : ${track.title}`,
      ref: { kind: "app", id: `music:${track.id}` },
      highlight: MUSIC_CLUE.highlight,
    });
  }, [track, addClue]);

  // Le synthé est créé à la demande et arrêté à la fermeture de la fenêtre
  useEffect(() => () => synthRef.current?.dispose(), []);

  useEffect(() => {
    synthRef.current?.setVolume(effectiveVolume);
  }, [effectiveVolume]);

  const startAt = (i: number, fromSeconds: number) => {
    const t = PLAYLIST[i];
    if (!synthRef.current) synthRef.current = new JazzSynth();
    synthRef.current.play(t, effectiveVolume, Math.floor((fromSeconds * t.bpm) / 60));
    startRef.current = { at: performance.now(), from: fromSeconds };
    setIndex(i);
    setElapsed(fromSeconds);
    setPlaying(true);
  };

  const pause = () => {
    synthRef.current?.stop();
    setPlaying(false);
  };

  const next = () => startAt((index + 1) % PLAYLIST.length, 0);
  const prev = () => (elapsed > 3 ? startAt(index, 0) : startAt((index - 1 + PLAYLIST.length) % PLAYLIST.length, 0));

  // Progression et passage automatique au morceau suivant
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      const e = startRef.current.from + (performance.now() - startRef.current.at) / 1000;
      if (e >= track.duration) {
        startAt((index + 1) % PLAYLIST.length, 0);
      } else {
        setElapsed(e);
      }
    }, 250);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, index]);

  return (
    <div className="flex h-full bg-gradient-to-br from-[#1b1528] to-[#0e1424] text-white">
      {/* Playlist */}
      <div className="w-72 border-r border-white/10 flex flex-col bg-black/20">
        <div className="p-4 border-b border-white/10">
          <p className="text-xs text-white/50 flex items-center gap-2">
            <ListMusic className="w-4 h-4" /> Playlist
          </p>
          <p className="text-sm font-medium mt-1">{PLAYLIST_NAME}</p>
        </div>
        <ol className="flex-1 overflow-y-auto p-2">
          {PLAYLIST.map((t, i) => (
            <li key={t.id}>
              <button
                onClick={() => startAt(i, 0)}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded text-left transition-colors ${i === index ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                <span className="w-5 text-center text-xs text-white/40">
                  {i === index && playing ? <Music2 className="w-3.5 h-3.5 text-violet-300 mx-auto animate-pulse" /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm truncate ${i === index ? "text-violet-200" : ""}`}>{t.title}</span>
                  <span className="block text-xs text-white/45 truncate">{t.artist}</span>
                </span>
                <span className="text-xs text-white/40 tabular-nums">{fmt(t.duration)}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* En cours de lecture */}
      <div className="flex-1 flex flex-col min-w-0">
        <div ref={detailsRef} className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 shadow-2xl flex items-end justify-center gap-1.5 p-6 mb-6">
            {[0, 1, 2, 3, 4].map((b) => (
              <span
                key={b}
                className="w-3 rounded-full bg-white/80"
                style={{
                  height: playing ? `${30 + ((Math.sin(elapsed * (3 + b) + b) + 1) / 2) * 60}%` : "20%",
                  transition: "height 0.25s ease",
                }}
              />
            ))}
          </div>
          <h2 className="text-2xl font-semibold">{track.title}</h2>
          <p className="text-white/60">{track.artist}</p>
          <p className="text-xs text-white/40 mt-1">{track.recorded}</p>
          {track.note && (
            <p className="mt-5 max-w-md flex items-start gap-2 text-left text-sm text-amber-100/85 bg-amber-200/5 border border-amber-100/10 rounded-lg px-4 py-3">
              <StickyNote className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{track.note}</span>
            </p>
          )}
        </div>

        {/* Contrôles */}
        <div className="px-6 pb-5">
          <div className="flex items-center gap-3 text-xs text-white/50 tabular-nums">
            <span className="w-10 text-right">{fmt(elapsed)}</span>
            <input
              type="range"
              min={0}
              max={track.duration}
              value={elapsed}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (playing) startAt(index, v);
                else setElapsed(v);
              }}
              className="flex-1 accent-violet-400"
              aria-label="Position dans le morceau"
            />
            <span className="w-10">{fmt(track.duration)}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="w-40" />
            <div className="flex items-center gap-4">
              <button onClick={prev} className="p-2 rounded-full hover:bg-white/10" aria-label="Morceau précédent">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={() => (playing ? pause() : startAt(index, elapsed))}
                className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                aria-label={playing ? "Pause" : "Lecture"}
              >
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button onClick={next} className="p-2 rounded-full hover:bg-white/10" aria-label="Morceau suivant">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
            <div className="w-40 flex items-center gap-2">
              <button onClick={toggleMute} aria-label={isMuted ? "Rétablir le son" : "Couper le son"}>
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-white/70" /> : <Volume2 className="w-4 h-4 text-white/70" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={effectiveVolume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 accent-violet-400"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
