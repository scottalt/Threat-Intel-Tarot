// Procedural sound effects via Web Audio API — no audio files needed
// All sounds are synthesized from noise bursts + filters

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function isMuted(): boolean {
  try {
    return localStorage.getItem("ti-tarot-muted") === "true";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    localStorage.setItem("ti-tarot-muted", String(muted));
  } catch {
    // localStorage not available
  }
}

function noiseBurst(
  audioCtx: AudioContext,
  startTime: number,
  duration: number,
  frequency: number,
  q: number,
  peak: number,
  decay: number = duration
) {
  const bufLen = Math.ceil(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufLen; i++) {
    // Shaped noise: quick attack, exponential tail
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.8);
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = frequency;
  filter.Q.value = q;

  const gainNode = audioCtx.createGain();
  const t = audioCtx.currentTime + startTime;
  gainNode.gain.setValueAtTime(peak, t);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t + decay);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  source.start(t);
}

// Card riff sound during shuffle — 8 rapid soft clicks
export function playShuffle(): void {
  if (isMuted()) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();

  for (let i = 0; i < 8; i++) {
    const freq = 2200 + Math.random() * 1800;
    const delay = i * 0.075 + Math.random() * 0.015;
    noiseBurst(c, delay, 0.055, freq, 2.0, 0.28, 0.055);
  }
}

// Card flip whoosh — played at the flip midpoint
export function playFlip(): void {
  if (isMuted()) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();

  // Swoosh: mid-high bandpass noise
  noiseBurst(c, 0, 0.14, 1600, 0.7, 0.4, 0.14);
  // Subtle low complement
  noiseBurst(c, 0.01, 0.08, 500, 1.5, 0.12, 0.08);
}

// Card deal thwap — when card lands on table
export function playDeal(): void {
  if (isMuted()) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();

  // Main impact
  noiseBurst(c, 0, 0.09, 900, 1.4, 0.55, 0.09);
  // Low thump
  noiseBurst(c, 0, 0.15, 120, 3.0, 0.45, 0.15);
  // High snap
  noiseBurst(c, 0.01, 0.04, 4000, 2.5, 0.18, 0.04);
}
