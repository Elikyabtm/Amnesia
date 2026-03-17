"use client";

import { useCallback, useRef, useState } from "react";

type SoundType = "click" | "error" | "success" | "open" | "close" | "startup" | "notification";

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

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

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

        const adjustedVolume = volume * 0.2; // Scale down for comfort
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

  const toggleMute = useCallback(() => {
    setIsMuted((m) => !m);
  }, []);

  return { playSound, volume, setVolume, isMuted, setIsMuted, toggleMute };
}
