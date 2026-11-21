// config.js — the game's shared constants: panel size, set order, timing and chrome colours.
// Everything else reads its numbers from here so the scenes, the HUD and the screenshot
// poses all agree with each other.

export const PANEL_SIZE = 520; // each picture is a 520 x 520 canvas, in scene units

export const SET_SECONDS = [240, 300, 360]; // time on the clock for sets 1, 2 and 3
export const HINTS_PER_SET = 3;
export const LOW_TIME_SECONDS = 30; // the clock pulses red under this

export const CHROME = {
  page: '#f3ecdc', // warm paper the page sits on
  ink: '#22304a', // header text and panel labels
  bar: '#22304a', // the header bar behind the title
  barInk: '#f7f2df',
  accent: '#e07a3f', // buttons and the set tabs
  found: '#1f9d55', // the green of a found marker
  miss: '#d64541', // the red of a miss cross
  hint: '#f2b035', // the amber of a hint pulse
};
