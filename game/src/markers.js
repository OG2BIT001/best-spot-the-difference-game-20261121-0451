// markers.js — everything drawn over a picture once play starts: the green ring that
// lands on a found difference, the red cross of a miss (which fades), and the amber
// pulse that gives a hint away. main.js calls these every frame; the shapes are kept
// here so the "feel" of a find lives in one file.

import { CHROME } from './config.js';
import { ring, line, circle } from './render.js';

// drawFoundMarker rings a difference the player has found: a white-edged green ring
// with a tick, sized to the difference's own radius. `pop` runs 0..1 in the first
// moment after the find and springs the ring from small to full size, so a find
// lands with a little bounce; at rest it is 1.
export function drawFoundMarker(ctx, difference, pop = 1) {
  const { x, y } = difference;
  const r = difference.r * (0.55 + 0.45 * pop);
  ring(ctx, x, y, r, '#ffffff', 7, pop);
  ring(ctx, x, y, r, CHROME.found, 4.5, pop);
  const s = Math.max(0.32, r / 46);
  line(ctx, x - 9 * s, y + 1, x - 3 * s, y + 7 * s, CHROME.found, 5 * s, pop);
  line(ctx, x - 3 * s, y + 7 * s, x + 10 * s, y - 7 * s, CHROME.found, 5 * s, pop);
}

// drawMissMarker draws the red cross of a click that found nothing; `age` runs 0..1
// over its short life and fades and shrinks it away.
export function drawMissMarker(ctx, miss) {
  const alpha = Math.max(0, 1 - miss.age);
  const s = 10 * (1 - miss.age * 0.3);
  line(ctx, miss.x - s, miss.y - s, miss.x + s, miss.y + s, CHROME.miss, 4.5, alpha);
  line(ctx, miss.x - s, miss.y + s, miss.x + s, miss.y - s, CHROME.miss, 4.5, alpha);
}

// drawHintPulse draws two expanding amber rings around the difference a hint points
// at; `phase` runs 0..1 and loops while the hint is on show.
export function drawHintPulse(ctx, difference, phase) {
  for (const offset of [0, 0.5]) {
    const p = (phase + offset) % 1;
    ring(ctx, difference.x, difference.y, difference.r + 6 + p * 26, CHROME.hint, 4, 1 - p);
  }
  circle(ctx, difference.x, difference.y, 4, CHROME.hint);
}
