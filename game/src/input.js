// input.js — turns the player's mouse and keyboard into game events. Clicks on either
// picture are converted from page pixels into scene units (the pictures are drawn at
// 520 x 520 whatever size the page shows them at), and keys are reported by name so
// main.js can map them: H hint, R restart, N next set, 1/2/3 jump to a set.

import { PANEL_SIZE } from './config.js';

// toScenePoint maps a mouse event on a panel canvas to scene coordinates.
export function toScenePoint(canvas, event) {
  const box = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - box.left) / box.width) * PANEL_SIZE,
    y: ((event.clientY - box.top) / box.height) * PANEL_SIZE,
  };
}

// attachInput wires both panels and the keyboard to one handler object:
// { onSpot(x, y), onKey(key) }.
export function attachInput(canvases, handler) {
  for (const canvas of canvases) {
    canvas.addEventListener('pointerdown', (event) => {
      const point = toScenePoint(canvas, event);
      handler.onSpot(point.x, point.y);
    });
  }
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    handler.onKey(event.key.toLowerCase());
  });
}
