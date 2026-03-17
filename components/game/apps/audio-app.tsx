"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Mic, User, Clock, Rewind, FastForward } from "lucide-react";
import { voiceMessages, type VoiceMessage } from "@/lib/game-data";
import { useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

export function AudioApp() {
  const [selectedMessage, setSelectedMessage] = useState<VoiceMessage | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [hasListened, setHasListened] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { addClue } = useGame();
  const { playSound } = useSound();

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const detectClues = useCallback((message: VoiceMessage) => {
    if (message.transcript.includes("1967")) {
      addClue({
        category: "date",
        text: "Une reference a l'annee 1967 dans un message vocal",
        source: `Message de ${message.from}`,
      });
    }
    if (message.transcript.includes("58 ans")) {
      addClue({
        category: "date",
        text: "Bernard aura 58 ans - ne en 1967",
        source: `Message de ${message.from}`,
      });
    }
    if (message.transcript.includes("fondation") && message.transcript.includes("naissance")) {
      addClue({
        category: "password",
        text: "Le mot de passe combine la fondation de la ville et la date de naissance",
        source: "Memo vocal personnel",
      });
    }
    if (message.transcript.includes("14 avril") || message.transcript.includes("15 avril")) {
      addClue({
        category: "date",
        text: "Date importante : mi-avril (anniversaire/mariage)",
        source: `Message de ${message.from}`,
      });
    }
    if (message.transcript.includes("32 ans")) {
      addClue({
        category: "date",
        text: "32 ans de mariage en 2025 (marie en 1993)",
        source: `Message de ${message.from}`,
      });
    }
  }, [addClue]);

  const selectMessage = (message: VoiceMessage) => {
    playSound("click");
    
    // Pause current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setSelectedMessage(message);
    setIsPlaying(false);
    setCurrentTime(0);
    setShowTranscript(false);
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !selectedMessage) return;
    
    playSound("click");
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setShowTranscript(true);
    if (selectedMessage && !hasListened.has(selectedMessage.id)) {
      detectClues(selectedMessage);
      setHasListened((prev) => new Set([...prev, selectedMessage.id]));
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    playSound("click");
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    playSound("click");
    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
      } else {
        audioRef.current.volume = 0;
      }
    }
    setIsMuted(!isMuted);
  };

  // Update audio element when message changes
  useEffect(() => {
    if (audioRef.current && selectedMessage) {
      audioRef.current.src = selectedMessage.audioSrc;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.load();
    }
  }, [selectedMessage, volume, isMuted]);

  // Sync play state
  useEffect(() => {
    if (audioRef.current) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      
      audioRef.current.addEventListener("play", handlePlay);
      audioRef.current.addEventListener("pause", handlePause);
      
      return () => {
        audioRef.current?.removeEventListener("play", handlePlay);
        audioRef.current?.removeEventListener("pause", handlePause);
      };
    }
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-full flex bg-[#1a1a2e]">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Sidebar - Message list */}
      <div className="w-72 border-r border-white/10 flex flex-col bg-[#16213e]">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#0f3460] to-[#16213e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e94560]/20 flex items-center justify-center">
              <Mic className="w-5 h-5 text-[#e94560]" />
            </div>
            <div>
              <span className="font-semibold text-white">Messages vocaux</span>
              <p className="text-xs text-white/50">{voiceMessages.length} message(s)</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-2">
          {voiceMessages.map((message) => (
            <button
              key={message.id}
              onClick={() => selectMessage(message)}
              className={`w-full p-3 text-left rounded-lg mb-2 transition-all ${
                selectedMessage?.id === message.id 
                  ? "bg-[#e94560]/20 ring-1 ring-[#e94560]/50" 
                  : "hover:bg-white/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  hasListened.has(message.id) 
                    ? "bg-green-500/20" 
                    : "bg-[#0f3460]"
                }`}>
                  <User className={`w-5 h-5 ${
                    hasListened.has(message.id) ? "text-green-400" : "text-[#e94560]"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{message.from}</p>
                  <p className="text-xs text-white/50 truncate">{message.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Clock className="w-3 h-3 text-white/30" />
                    <span className="text-xs text-white/40">{message.date}</span>
                  </div>
                  {hasListened.has(message.id) && (
                    <span className="text-xs text-green-400 mt-1 inline-block">Ecoute</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
        {selectedMessage ? (
          <>
            {/* Player header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#e94560] to-[#0f3460] flex items-center justify-center shadow-lg">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedMessage.name}</h2>
                  <p className="text-sm text-[#e94560]">De : {selectedMessage.from}</p>
                  <p className="text-xs text-white/40 mt-1">{selectedMessage.date}</p>
                </div>
              </div>
            </div>

            {/* Player controls */}
            <div className="p-6">
              {/* Waveform visualization placeholder */}
              <div className="mb-6 h-16 bg-[#0f3460]/50 rounded-lg flex items-center justify-center gap-1 overflow-hidden">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div 
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isPlaying 
                        ? "bg-[#e94560]" 
                        : "bg-white/20"
                    }`}
                    style={{ 
                      height: `${Math.random() * 60 + 20}%`,
                      opacity: progress > (i / 50) * 100 ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div 
                  className="h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#e94560] to-[#ff6b6b] rounded-full transition-all relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-1/2" />
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-white/60 font-mono">{formatTime(currentTime)}</span>
                  <span className="text-sm text-white/60 font-mono">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                <button 
                  onClick={skipBackward}
                  className="p-3 text-white/50 hover:text-white transition-colors hover:bg-white/10 rounded-full"
                  title="Reculer de 5s"
                >
                  <Rewind className="w-6 h-6" />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-[#e94560] to-[#ff6b6b] flex items-center justify-center hover:shadow-lg hover:shadow-[#e94560]/50 transition-all transform hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 text-white" />
                  ) : (
                    <Play className="w-7 h-7 text-white ml-1" />
                  )}
                </button>
                <button 
                  onClick={skipForward}
                  className="p-3 text-white/50 hover:text-white transition-colors hover:bg-white/10 rounded-full"
                  title="Avancer de 5s"
                >
                  <FastForward className="w-6 h-6" />
                </button>
              </div>
              
              {/* Volume control */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <button 
                  onClick={toggleMute}
                  className="p-2 text-white/50 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-32 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#e94560] [&::-webkit-slider-thumb]:shadow-lg"
                />
                <span className="text-xs text-white/50 w-10">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
              </div>
            </div>

            {/* Transcript */}
            <div className={`flex-1 overflow-auto border-t border-white/10 transition-all ${showTranscript ? "opacity-100" : "opacity-30"}`}>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-semibold text-white">Transcription</span>
                  {showTranscript ? (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Disponible
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-white/10 text-white/50 text-xs rounded-full">
                      Ecoutez pour debloquer
                    </span>
                  )}
                </div>
                {showTranscript ? (
                  <div className="p-4 bg-[#0f3460]/50 rounded-xl border border-white/10">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-white/80 leading-relaxed">
                      {selectedMessage.transcript}
                    </pre>
                  </div>
                ) : (
                  <div className="p-4 bg-[#0f3460]/30 rounded-xl border border-white/5">
                    <p className="text-white/30 text-sm text-center">
                      Ecoutez le message en entier pour voir la transcription
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/40">
            <div className="w-24 h-24 rounded-full bg-[#0f3460]/50 flex items-center justify-center mb-6">
              <Mic className="w-12 h-12 opacity-30" />
            </div>
            <p className="text-lg font-medium">Selectionnez un message</p>
            <p className="text-sm mt-2 text-white/30">pour l'ecouter</p>
          </div>
        )}
      </div>
    </div>
  );
}
