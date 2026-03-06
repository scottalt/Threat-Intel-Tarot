// Ambient music via Tone.js
// Dynamic import keeps Tone (~200KB) out of the initial bundle.
// Starts only after first user interaction (browser autoplay policy).

import { isMuted } from "./sounds";

const MASTER_DB = -14;
const BPM = 63; // Slightly slower for more weight

// 16-bar loop: Am → F → G → Em
//
// Am: dark, grounded — the home base
// F:  relative major area, slight uplift
// G:  forward motion, anticipation
// Em: tension that wants to resolve back to Am
//
// Four voices:
//   Pad     — slow sine chords, the harmonic bed
//   Bass    — sawtooth + LPF, root movement, adds weight
//   Arp     — triangle wave, melodic line with rhythmic variation
//   Melody  — sparse sine counter-melody with tremolo shimmer

const PAD_EVENTS: [string, string[]][] = [
  ["0:0",  ["A2", "E3", "C4"]],  // Am
  ["4:0",  ["F2", "C3", "A3"]],  // F
  ["8:0",  ["G2", "D3", "B3"]],  // G
  ["12:0", ["E2", "B2", "G3"]],  // Em
];

const BASS_EVENTS: [string, string][] = [
  // Am — root then fifth
  ["0:0", "A1"], ["2:0", "E2"],
  // F — root then fifth
  ["4:0", "F1"], ["6:0", "C2"],
  // G — root then fifth
  ["8:0", "G1"], ["10:0", "D2"],
  // Em — root, dip low, fifth
  ["12:0", "E1"], ["13:2", "B0"], ["14:2", "B1"],
];

const ARP_EVENTS: [string, string][] = [
  // Am — rise from A3 to A4, fall back
  ["0:0", "A3"], ["0:2", "C4"],
  ["1:0", "E4"], ["1:3", "G4"],
  ["2:0", "A4"], ["2:2", "E4"],
  ["3:1", "C4"], ["3:3", "A3"],
  // F — explore upper range
  ["4:0", "F3"], ["4:2", "A3"],
  ["5:0", "C4"], ["5:3", "E4"],
  ["6:0", "F4"], ["6:2", "C4"],
  ["7:1", "A3"], ["7:3", "F3"],
  // G — upward energy, peak at B4
  ["8:0", "G3"], ["8:2", "B3"],
  ["9:0", "D4"], ["9:3", "G4"],
  ["10:0", "B4"], ["10:2", "D4"],
  ["11:1", "B3"], ["11:3", "G3"],
  // Em — descend through tension
  ["12:0", "E3"], ["12:2", "G3"],
  ["13:0", "B3"], ["13:3", "E4"],
  ["14:0", "G4"], ["14:2", "B3"],
  ["15:1", "G3"], ["15:3", "E3"],
];

// Sparse counter-melody — 8 notes across 16 bars, breathes
const MELODY_EVENTS: [string, string][] = [
  ["1:2",  "E5"],
  ["3:0",  "C5"],
  ["5:1",  "A5"],
  ["7:0",  "F5"],
  ["9:2",  "G5"],
  ["11:1", "B5"],
  ["13:0", "E5"],
  ["14:2", "G5"],
];

class AmbientMusicPlayer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private masterVol: any = null;
  private started = false;
  private loading = false;

  async start(): Promise<void> {
    if (this.started || this.loading || isMuted()) return;
    this.loading = true;

    // Dynamic import — Tone only loads on first interaction
    const Tone = await import("tone");

    // Resume AudioContext (required by browser autoplay policy)
    await Tone.start();

    Tone.getTransport().bpm.value = BPM;

    // --- Effects chain ---
    const reverb = new Tone.Reverb({ decay: 8, wet: 0.65 });
    await reverb.ready; // Reverb builds an IR buffer — must await

    const delay = new Tone.FeedbackDelay("8n.", 0.25);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tremolo = new (Tone as any).Tremolo({ frequency: 3.5, depth: 0.35 }).start();

    this.masterVol = new Tone.Volume(-60); // start silent, ramp up
    this.masterVol.toDestination();
    reverb.connect(this.masterVol);
    delay.connect(reverb);
    tremolo.connect(delay);

    // --- Bass synth ---
    // Sawtooth + lowpass filter — warm, deep root movement
    const bassFilter = new Tone.Filter(220, "lowpass");
    bassFilter.connect(reverb);

    const bass = new Tone.Synth({
      oscillator: { type: "sawtooth" as const },
      envelope: { attack: 0.5, decay: 0.4, sustain: 0.85, release: 5 },
    });
    bass.volume.value = -20;
    bass.connect(bassFilter);

    // --- Pad synth ---
    // Sine, very slow attack — harmonic bed, fills without intruding
    const pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" as const },
      envelope: { attack: 3.5, decay: 1, sustain: 0.8, release: 7 },
    });
    pad.volume.value = -8;
    pad.connect(reverb);

    // --- Arpeggio synth ---
    // Triangle — warmer than sine, plucky envelope
    const arp = new Tone.Synth({
      oscillator: { type: "triangle" as const },
      envelope: { attack: 0.05, decay: 1.2, sustain: 0.1, release: 3 },
    });
    arp.volume.value = -14;
    arp.connect(delay);

    // --- Counter-melody synth ---
    // Sine with tremolo shimmer — ethereal, barely-there, high register
    const melody = new Tone.Synth({
      oscillator: { type: "sine" as const },
      envelope: { attack: 1.0, decay: 2.0, sustain: 0.2, release: 6 },
    });
    melody.volume.value = -22;
    melody.connect(tremolo);

    // --- Sequences ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const padPart = new Tone.Part<string[]>(
      (time, chord) => pad.triggerAttackRelease(chord, "4m", time),
      PAD_EVENTS as any
    );
    padPart.loop = true;
    padPart.loopEnd = "16m";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bassPart = new Tone.Part<string>(
      (time, note) => bass.triggerAttackRelease(note, "2m", time),
      BASS_EVENTS as any
    );
    bassPart.loop = true;
    bassPart.loopEnd = "16m";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arpPart = new Tone.Part<string>(
      (time, note) => arp.triggerAttackRelease(note, "4n", time),
      ARP_EVENTS as any
    );
    arpPart.loop = true;
    arpPart.loopEnd = "16m";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const melodyPart = new Tone.Part<string>(
      (time, note) => melody.triggerAttackRelease(note, "2n", time),
      MELODY_EVENTS as any
    );
    melodyPart.loop = true;
    melodyPart.loopEnd = "16m";

    padPart.start(0);
    bassPart.start(0);
    arpPart.start(0);
    melodyPart.start(0);

    // Fade in over 5s
    this.masterVol.volume.rampTo(MASTER_DB, 5);
    Tone.getTransport().start();

    this.started = true;
    this.loading = false;
  }

  pause(): void {
    this.masterVol?.volume.rampTo(-60, 2);
  }

  resume(): void {
    if (!this.started) {
      this.start();
      return;
    }
    this.masterVol?.volume.rampTo(MASTER_DB, 2);
  }

  isStarted(): boolean {
    return this.started;
  }
}

export const musicPlayer = new AmbientMusicPlayer();
