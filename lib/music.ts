// Ambient music via Tone.js — actual melody, not a drone
// Dynamic import keeps Tone (~200KB) out of the initial bundle.
// Starts only after first user interaction (browser autoplay policy).

import { isMuted } from "./sounds";

const MASTER_DB = -14;
const BPM = 68;

// 8-bar loop, A minor:
//   Bars 1–4: Am (A C E) pad
//   Bars 5–8: G  (G B D) pad
//
// Arpeggio walks the A minor pentatonic scale (A C D E G)
// at a half-note pulse — one note every two beats (~1.76s at 68bpm).
// The pattern ascends, peaks, and descends, giving it forward motion.

const PAD_EVENTS: [string, string[]][] = [
  ["0:0", ["A2", "E3", "A3", "C4"]],
  ["4:0", ["G2", "D3", "G3", "B3"]],
];

const ARP_EVENTS: [string, string][] = [
  // Am arc — rise
  ["0:0", "A3"], ["0:2", "C4"],
  ["1:0", "E4"], ["1:2", "G4"],
  ["2:0", "A4"], ["2:2", "G4"],
  ["3:0", "E4"], ["3:2", "C4"],
  // G arc — descent with colour
  ["4:0", "G3"], ["4:2", "B3"],
  ["5:0", "D4"], ["5:2", "G4"],
  ["6:0", "B4"], ["6:2", "A4"],
  ["7:0", "G4"], ["7:2", "E4"],
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

    // --- Effects ---
    const reverb = new Tone.Reverb({ decay: 7, wet: 0.6 });
    await reverb.ready; // Reverb builds an IR buffer — must await

    const delay = new Tone.FeedbackDelay("8n.", 0.22);

    this.masterVol = new Tone.Volume(-60); // start silent, ramp up
    this.masterVol.toDestination();
    reverb.connect(this.masterVol);
    delay.connect(reverb);

    // --- Pad synth ---
    // Sine wave, very slow attack — fills space without intruding
    const pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" as const },
      envelope: { attack: 3, decay: 0.8, sustain: 0.85, release: 6 },
    });
    pad.volume.value = -6;
    pad.connect(reverb);

    // --- Arpeggio synth ---
    // Triangle wave — warmer than a sine, pluckier envelope
    const arp = new Tone.Synth({
      oscillator: { type: "triangle" as const },
      envelope: { attack: 0.06, decay: 1.0, sustain: 0.15, release: 3 },
    });
    arp.volume.value = -12;
    arp.connect(delay);

    // --- Sequences ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const padPart = new Tone.Part<string[]>(
      (time, chord) => pad.triggerAttackRelease(chord, "3m", time),
      PAD_EVENTS as any
    );
    padPart.loop = true;
    padPart.loopEnd = "8m";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arpPart = new Tone.Part<string>(
      (time, note) => arp.triggerAttackRelease(note, "4n", time),
      ARP_EVENTS as any
    );
    arpPart.loop = true;
    arpPart.loopEnd = "8m";

    padPart.start(0);
    arpPart.start(0);

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
