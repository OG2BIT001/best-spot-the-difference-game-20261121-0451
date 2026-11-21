// state.js — the state of one set in play and the rules that change it: what has been
// found, how many hints are left, where the misses landed and whether the set is won.
// No drawing and no DOM here: main.js reads the state, markers.js and the HUD show it.

import { SET_SECONDS, HINTS_PER_SET } from './config.js';

// createSetState starts a fresh set: nothing found, a full clock, all hints unspent.
export function createSetState(sceneIndex) {
  return {
    sceneIndex,
    found: new Set(),
    foundAt: {}, // difference id -> the elapsed second it was found at, for the marker pop
    misses: [], // [{ x, y, age }] in scene units; age runs 0..1, then the miss is dropped
    hintsLeft: HINTS_PER_SET,
    hintId: null, // the difference a hint is pulsing on, while it shows
    hintPhase: 0,
    secondsLeft: SET_SECONDS[sceneIndex],
    won: false,
    startedAt: null, // set by main.js on the first frame
  };
}

// remainingCount is the number the HUD leads with: how many differences are still hiding.
export function remainingCount(state, scene) {
  return scene.differences.length - state.found.size;
}

// differenceAt returns the unfound difference whose circle holds the point, if any.
export function differenceAt(scene, state, x, y) {
  for (const difference of scene.differences) {
    if (state.found.has(difference.id)) continue;
    const dx = x - difference.x;
    const dy = y - difference.y;
    if (dx * dx + dy * dy <= difference.r * difference.r) return difference;
  }
  return null;
}

// markFound records a find (and when it happened, so its marker can pop) and
// clears any hint that was pointing at it.
export function markFound(state, difference, now = 0) {
  state.found.add(difference.id);
  state.foundAt[difference.id] = now;
  if (state.hintId === difference.id) state.hintId = null;
}

// spendHint picks a still-hidden difference for the hint pulse to point at, if the
// player has a hint left and anything is still hidden. Returns its id, or null.
export function spendHint(state, scene, pick) {
  if (state.hintsLeft <= 0) return null;
  const hidden = scene.differences.filter((d) => !state.found.has(d.id));
  if (hidden.length === 0) return null;
  state.hintsLeft -= 1;
  state.hintId = pick(hidden).id;
  state.hintPhase = 0;
  return state.hintId;
}

// formatClock turns a number of seconds into the HUD's m:ss.
export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.ceil(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
