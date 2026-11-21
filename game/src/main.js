// main.js — the game's conductor: it owns the two panel canvases and the HUD, runs the
// frame loop (clock, fading misses, the hint pulse), and turns spots and keys into
// state changes through state.js. The scenes paint themselves (scenes.js), the
// markers paint themselves (markers.js); this file only keeps them in step.

import { LOW_TIME_SECONDS } from './config.js';
import { SCENES } from './scenes.js';
import { createSetState, remainingCount, differenceAt, markFound, spendHint, formatClock } from './state.js';
import { drawFoundMarker, drawMissMarker, drawHintPulse } from './markers.js';
import { attachInput } from './input.js';
import { playFind, playMiss, playHint, playWin } from './sound.js';
import { readShotPose } from './shots.js';

const leftCanvas = document.getElementById('left-panel');
const rightCanvas = document.getElementById('right-panel');
const leftCtx = leftCanvas.getContext('2d');
const rightCtx = rightCanvas.getContext('2d');
const hud = {
  setName: document.getElementById('set-name'),
  setBlurb: document.getElementById('set-blurb'),
  found: document.getElementById('found-count'),
  total: document.getElementById('total-count'),
  remaining: document.getElementById('remaining-count'),
  timer: document.getElementById('timer'),
  hints: document.getElementById('hints-left'),
  message: document.getElementById('message'),
};
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlay-text');
const overlayButton = document.getElementById('overlay-button');
const tabButtons = [...document.querySelectorAll('#set-tabs button')];

const NO_ALTERED = new Set();
let state = createSetState(0);
let elapsed = 0; // seconds since the page opened, for marker pops and miss fades
let timeUp = false;
let frozen = false; // a screenshot pose holds the clock and the pulses still
let overlayAction = () => {};

function currentScene() {
  return SCENES[state.sceneIndex];
}

function allAltered(scene) {
  return new Set(scene.differences.map((d) => d.id));
}

function startSet(index) {
  state = createSetState(index);
  timeUp = false;
  overlay.hidden = true;
  say(`Set ${index + 1}: find ${currentScene().differences.length} differences.`);
  updateHud();
}

function say(message) {
  hud.message.textContent = message;
}

function updateHud() {
  const scene = currentScene();
  hud.setName.textContent = scene.title;
  hud.setBlurb.textContent = scene.blurb;
  hud.found.textContent = String(state.found.size);
  hud.total.textContent = String(scene.differences.length);
  hud.remaining.textContent = String(remainingCount(state, scene));
  hud.timer.textContent = formatClock(state.secondsLeft);
  hud.timer.classList.toggle('low', !state.won && state.secondsLeft <= LOW_TIME_SECONDS);
  hud.hints.textContent = String(state.hintsLeft);
  tabButtons.forEach((button, i) => button.classList.toggle('active', i === state.sceneIndex));
}

function showOverlay(message, buttonLabel, action) {
  overlayText.textContent = message;
  overlayButton.textContent = buttonLabel;
  overlayAction = action;
  overlay.hidden = false;
}

function winSet() {
  state.won = true;
  playWin();
  const last = state.sceneIndex === SCENES.length - 1;
  say('Every difference found. Lantern Lane is safe for another night.');
  showOverlay(
    `${currentScene().title} complete — every difference found.`,
    last ? 'Play again from set 1' : 'Next set',
    () => startSet(last ? 0 : state.sceneIndex + 1),
  );
  updateHud();
}

function handleSpot(x, y) {
  if (state.won || timeUp || frozen) return;
  const scene = currentScene();
  const difference = differenceAt(scene, state, x, y);
  if (difference) {
    markFound(state, difference, elapsed);
    playFind();
    if (remainingCount(state, scene) === 0) {
      winSet();
      return;
    }
    say(`Found one — ${remainingCount(state, scene)} to go.`);
  } else {
    state.misses.push({ x, y, age: 0 });
    playMiss();
    say('Not there. Look again.');
  }
  updateHud();
}

function handleHint() {
  if (state.won || timeUp || frozen) return;
  const id = spendHint(state, currentScene(), (hidden) => hidden[Math.floor(Math.random() * hidden.length)]);
  if (id) {
    playHint();
    say('A hint shimmers around one you have missed.');
  } else {
    say(state.hintsLeft <= 0 ? 'No hints left.' : 'Nothing left to hint at.');
  }
  updateHud();
}

function handleKey(key) {
  if (key === 'h') handleHint();
  else if (key === 'r') startSet(state.sceneIndex);
  else if (key === 'n') startSet((state.sceneIndex + 1) % SCENES.length);
  else if (key >= '1' && key <= String(SCENES.length)) startSet(Number(key) - 1);
}

function drawPanel(ctx, altered) {
  const scene = currentScene();
  scene.draw(ctx, altered);
  for (const difference of scene.differences) {
    if (!state.found.has(difference.id)) continue;
    const foundAt = state.foundAt[difference.id];
    const pop = foundAt === undefined ? 1 : Math.min(1, Math.max(0, (elapsed - foundAt) / 0.28));
    drawFoundMarker(ctx, difference, pop);
  }
  if (state.hintId) {
    const hinted = scene.differences.find((d) => d.id === state.hintId);
    if (hinted) drawHintPulse(ctx, hinted, state.hintPhase);
  }
  for (const miss of state.misses) drawMissMarker(ctx, miss);
}

let lastTime = null;
function frame(now) {
  if (lastTime === null) lastTime = now;
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (!frozen) {
    elapsed += dt;
    if (!state.won && !timeUp) {
      state.secondsLeft -= dt;
      if (state.secondsLeft <= 0) {
        state.secondsLeft = 0;
        timeUp = true;
        say('Out of time — the differences keep their secrets.');
        showOverlay('Out of time.', 'Try this set again', () => startSet(state.sceneIndex));
      }
    }
    state.misses = state.misses.filter((miss) => (miss.age += dt / 0.7) < 1);
    if (state.hintId) state.hintPhase = (state.hintPhase + dt / 1.2) % 1;
    hud.timer.textContent = formatClock(state.secondsLeft);
    hud.timer.classList.toggle('low', !state.won && state.secondsLeft <= LOW_TIME_SECONDS);
  }
  drawPanel(leftCtx, NO_ALTERED);
  drawPanel(rightCtx, allAltered(currentScene()));
  requestAnimationFrame(frame);
}

// ---- wiring -------------------------------------------------------------------

attachInput([leftCanvas, rightCanvas], { onSpot: handleSpot, onKey: handleKey });
document.getElementById('hint-button').addEventListener('click', handleHint);
document.getElementById('restart-button').addEventListener('click', () => startSet(state.sceneIndex));
overlayButton.addEventListener('click', () => overlayAction());
tabButtons.forEach((button, i) => button.addEventListener('click', () => startSet(i)));

const pose = readShotPose();
if (pose) {
  startSet(Math.min(pose.set, SCENES.length - 1));
  for (const id of pose.found) {
    const difference = currentScene().differences.find((d) => d.id === id);
    if (difference) markFound(state, difference);
  }
  if (pose.secondsLeft !== null && !Number.isNaN(pose.secondsLeft)) state.secondsLeft = pose.secondsLeft;
  frozen = true;
  updateHud();
} else {
  startSet(0);
}
requestAnimationFrame(frame);
