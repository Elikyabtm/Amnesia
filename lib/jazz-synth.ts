"use client";

// Petit synthétiseur de jazz en Web Audio : contrebasse en marche, accords
// sur les temps 2 et 4, ride en croches swinguées et mélodie pentatonique.
// Tout est généré : aucun fichier audio n'est nécessaire.

import type { ChordQuality, Track } from "./data/music";

const INTERVALS: Record<ChordQuality, number[]> = {
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  "7": [0, 4, 7, 10],
  m7b5: [0, 3, 6, 10],
  "6": [0, 4, 7, 9],
};

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// Générateur pseudo-aléatoire déterministe : chaque morceau garde sa mélodie
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export class JazzSynth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextBeatTime = 0;
  private beat = 0;
  private track: Track | null = null;
  private rand = Math.random;
  private noise: AudioBuffer | null = null;

  private ensureContext() {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      // Bruit blanc pour la cymbale
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.3, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.noise = buffer;
    }
    return this.ctx;
  }

  setVolume(volume: number) {
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(volume * 0.35, this.ctx.currentTime, 0.05);
  }

  play(track: Track, volume: number, offsetBeats = 0) {
    const ctx = this.ensureContext();
    void ctx.resume();
    this.stop();
    this.track = track;
    this.rand = seeded(track.bpm * 31 + track.title.length);
    this.beat = offsetBeats;
    this.nextBeatTime = ctx.currentTime + 0.1;
    this.setVolume(volume);
    this.timer = setInterval(() => this.schedule(), 50);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /** Nombre de temps joués (pour reprendre au même endroit après une pause) */
  get position() {
    return this.beat;
  }

  dispose() {
    this.stop();
    void this.ctx?.close();
    this.ctx = null;
  }

  private schedule() {
    const ctx = this.ctx;
    const track = this.track;
    if (!ctx || !track) return;
    const beatLen = 60 / track.bpm;
    while (this.nextBeatTime < ctx.currentTime + 0.2) {
      this.playBeat(this.beat, this.nextBeatTime, beatLen, track);
      this.nextBeatTime += beatLen;
      this.beat++;
    }
  }

  private playBeat(beat: number, time: number, beatLen: number, track: Track) {
    const bar = Math.floor(beat / 4) % track.chords.length;
    const inBar = beat % 4;
    const [root, quality] = track.chords[bar];
    const [nextRoot] = track.chords[(bar + 1) % track.chords.length];
    const intervals = INTERVALS[quality];

    // Contrebasse : fondamentale, tierce, quinte, note d'approche chromatique
    const bassNotes = [root - 12, root - 12 + intervals[1], root - 12 + intervals[2], nextRoot - 12 + (this.rand() < 0.5 ? -1 : 1)];
    this.tone(midiToFreq(bassNotes[inBar]), time, beatLen * 0.9, "triangle", 0.5);

    // Accords sur 2 et 4 (comping), avec un peu de variation
    if (inBar === 1 || inBar === 3 || (inBar === 0 && this.rand() < 0.15)) {
      for (const iv of intervals) this.tone(midiToFreq(root + 12 + iv), time, beatLen * 0.45, "sine", 0.09);
    }

    // Ride : croches swinguées (2/3 - 1/3)
    this.cymbal(time, inBar === 1 || inBar === 3 ? 0.06 : 0.04);
    if (this.rand() < 0.6) this.cymbal(time + beatLen * 0.66, 0.03);

    // Mélodie pentatonique sur l'accord
    if (this.rand() < 0.55) {
      const scale = [0, 2, 4, 7, 9, 12].map((s) => root + 24 + s);
      const note = scale[Math.floor(this.rand() * scale.length)];
      const swing = this.rand() < 0.5 ? 0 : beatLen * 0.66;
      this.tone(midiToFreq(note), time + swing, beatLen * (this.rand() < 0.3 ? 1.2 : 0.5), "square", 0.035);
    }
  }

  private tone(freq: number, time: number, length: number, type: OscillatorType, gain: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(gain, time + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, time + length);
    osc.connect(env).connect(this.master!);
    osc.start(time);
    osc.stop(time + length + 0.05);
  }

  private cymbal(time: number, gain: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 7000;
    const env = ctx.createGain();
    env.gain.setValueAtTime(gain, time);
    env.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
    src.connect(filter).connect(env).connect(this.master!);
    src.start(time);
    src.stop(time + 0.2);
  }
}
