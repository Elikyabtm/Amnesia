"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

type SoundType = "click" | "error" | "success" | "open" | "close" | "startup" | "notification";

interface SoundContextType {
  playSound: (type: SoundType) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

// Sound frequencies and patterns for each type
const soundPatterns: Record<SoundType, { freq: number[]; duration: number[]; type: OscillatorType }> = {
  click: { freq: [800], duration: [50], type: "sine" },
  error: { freq: [200, 150], duration: [150, 200], type: "square" },
  success: { freq: [523, 659, 784], duration: [100, 100, 200], type: "sine" },
  open: { freq: [400, 600], duration: [50, 80], type: "sine" },
  close: { freq: [500, 300], duration: [50, 80], type: "sine" },
  startup: { freq: [440, 554, 659, 880], duration: [200, 200, 200, 400], type: "sine" },
  notification: { freq: [880, 1100], duration: [100, 150], type: "sine" },
};

export function SoundProvider({ children }: { children: ReactNode }) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [volume, setVolumeState] = useState(0.5);
  const [isMuted, setIsMutedState] = useState(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (isMuted || volume === 0) return;
    
    try {
      const ctx = getAudioContext();
      const pattern = soundPatterns[type];
      let startTime = ctx.currentTime;

      pattern.freq.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = pattern.type;
        oscillator.frequency.setValueAtTime(freq, startTime);

        const adjustedVolume = volume * 0.2;
        gainNode.gain.setValueAtTime(adjustedVolume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + pattern.duration[i] / 1000);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + pattern.duration[i] / 1000);

        startTime += pattern.duration[i] / 1000;
      });
    } catch {
      // Audio not supported
    }
  }, [getAudioContext, isMuted, volume]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMutedState(false);
    }
  }, [isMuted]);

  const setIsMuted = useCallback((muted: boolean) => {
    setIsMutedState(muted);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMutedState((m) => !m);
  }, []);

  return (
    <SoundContext.Provider
      value={{
        playSound,
        volume,
        setVolume,
        isMuted,
        setIsMuted,
        toggleMute,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
