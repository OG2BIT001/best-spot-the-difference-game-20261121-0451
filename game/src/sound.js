// sound.js — the game's little noises, synthesised with WebAudio so the game needs no
// sound files: a two-note chime when a difference is found, a low thud for a miss, a
// soft blip for a hint and a rising arpeggio when a set is won. The context is created
// lazily on the first sound, which is always after a click or a key, as browsers ask.

let audioContext = null;

function ensureAudio() {
  if (typeof window === 'undefined' || !window.AudioContext) return null;
  if (!audioContext) audioContext = new window.AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function tone(ctx, frequency, start, duration, type, volume) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(ctx.currentTime + start);
  oscillator.stop(ctx.currentTime + start + duration);
}

export function playFind() {
  const ctx = ensureAudio();
  if (!ctx) return;
  tone(ctx, 880, 0, 0.14, 'sine', 0.16);
  tone(ctx, 1318, 0.07, 0.2, 'sine', 0.16);
}

export function playMiss() {
  const ctx = ensureAudio();
  if (!ctx) return;
  tone(ctx, 140, 0, 0.16, 'triangle', 0.2);
}

export function playHint() {
  const ctx = ensureAudio();
  if (!ctx) return;
  tone(ctx, 660, 0, 0.12, 'sine', 0.1);
  tone(ctx, 660, 0.16, 0.12, 'sine', 0.1);
}

export function playWin() {
  const ctx = ensureAudio();
  if (!ctx) return;
  [523, 659, 784, 1046].forEach((frequency, i) => tone(ctx, frequency, i * 0.09, 0.24, 'sine', 0.15));
}
