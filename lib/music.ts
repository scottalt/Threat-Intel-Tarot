// Procedural ambient music — A minor drone with slow LFO breathing
// No audio files. All synthesized via Web Audio API.
// Starts on first user interaction, respects the shared mute state.

import { isMuted } from "./sounds";

// Layered notes for a rich Am ambient pad
// Pairs of slightly detuned oscillators create natural chorus/shimmer
const LAYERS = [
  { freq: 55,    vol: 0.20, detune: 0   }, // A1 — sub bass foundation
  { freq: 110,   vol: 0.22, detune: 4   }, // A2 — bass
  { freq: 110,   vol: 0.14, detune: -6  }, // A2 — detuned pair (beating)
  { freq: 165,   vol: 0.13, detune: 3   }, // E3 — perfect fifth
  { freq: 165,   vol: 0.08, detune: -4  }, // E3 — detuned pair
  { freq: 220,   vol: 0.10, detune: 5   }, // A3 — octave
  { freq: 261.6, vol: 0.06, detune: -3  }, // C4 — minor third (the darkness)
  { freq: 330,   vol: 0.04, detune: 7   }, // E4 — high fifth shimmer
  { freq: 440,   vol: 0.02, detune: -8  }, // A4 — air
];

const MASTER_VOL = 0.10; // kept deliberately quiet

class AmbientMusicPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private nodes: AudioNode[] = [];
  private started = false;

  start(): void {
    if (this.started) return;
    if (isMuted()) return;

    this.ctx = new AudioContext();
    const now = this.ctx.currentTime;

    // Master gain — slow 5s fade in so it's not jarring
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(MASTER_VOL, now + 5);
    this.masterGain.connect(this.ctx.destination);

    for (const layer of LAYERS) {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = layer.freq;
      osc.detune.value = layer.detune;

      const gainNode = this.ctx.createGain();
      gainNode.gain.value = layer.vol;

      // Slow tremolo LFO — each layer breathes at a slightly different rate
      // so they phase in and out of each other organically
      const lfo = this.ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.04 + Math.random() * 0.04; // 0.04–0.08 Hz

      const lfoDepth = this.ctx.createGain();
      lfoDepth.gain.value = layer.vol * 0.28; // subtle — 28% modulation depth

      lfo.connect(lfoDepth);
      lfoDepth.connect(gainNode.gain);

      // Very gentle high-shelf rolloff to keep it warm
      const filter = this.ctx.createBiquadFilter();
      filter.type = "highshelf";
      filter.frequency.value = 2000;
      filter.gain.value = -10; // tame any harshness

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);

      osc.start(now);
      lfo.start(now);

      this.nodes.push(osc, lfo, gainNode, lfoDepth, filter);
    }

    this.started = true;
  }

  pause(): void {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.8);
  }

  resume(): void {
    if (!this.started) {
      this.start();
      return;
    }
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setTargetAtTime(MASTER_VOL, this.ctx.currentTime, 0.8);
  }

  isStarted(): boolean {
    return this.started;
  }
}

// Singleton — shared across the app
export const musicPlayer = new AmbientMusicPlayer();
