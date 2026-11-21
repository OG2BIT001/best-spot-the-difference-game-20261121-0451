// scenes.js — the three pictures of Lantern Lane, each drawn in code and each hiding a set
// of deliberate differences. A scene is { id, title, blurb, differences, draw }:
//   differences — [{ id, x, y, r }] the spots a player can find, in scene units (the
//                 centre of the changed thing and how close a click must land);
//   draw(ctx, altered) — paints the picture; `altered` is a Set of difference ids, and
//                 the right-hand picture is drawn with every id in it, the left with
//                 none, so the two panels can only differ where a difference says so.
// Small shared shapes (clouds, gulls, crates, lanterns) live at the top; each scene's own
// painter is named for its scene.

import { PANEL_SIZE } from './config.js';
import { scatterPoints } from './random.js';
import { skyGradient, rect, circle, ellipse, poly, line, curve, ring, roundRect, glow } from './render.js';

const W = PANEL_SIZE;
const H = PANEL_SIZE;

// ---- shared shapes ----------------------------------------------------------

function cloud(ctx, x, y, s, colour) {
  ellipse(ctx, x, y, 34 * s, 17 * s, colour);
  ellipse(ctx, x - 22 * s, y + 5 * s, 22 * s, 12 * s, colour);
  ellipse(ctx, x + 23 * s, y + 5 * s, 24 * s, 13 * s, colour);
  ellipse(ctx, x + 2 * s, y - 10 * s, 22 * s, 14 * s, colour);
}

function gull(ctx, x, y, s, colour) {
  curve(ctx, x - 11 * s, y, x - 5 * s, y - 7 * s, x, y, colour, 2.4 * s);
  curve(ctx, x, y, x + 5 * s, y - 7 * s, x + 11 * s, y, colour, 2.4 * s);
}

function wave(ctx, x, y, s, colour) {
  curve(ctx, x - 16 * s, y, x - 6 * s, y - 7 * s, x + 2 * s, y, colour, 2.6 * s);
  curve(ctx, x + 2 * s, y, x + 10 * s, y - 7 * s, x + 18 * s, y, colour, 2.6 * s);
}

function sailboat(ctx, x, y, s, hull, sail) {
  poly(ctx, [[x - 30 * s, y], [x + 30 * s, y], [x + 20 * s, y + 13 * s], [x - 20 * s, y + 13 * s]], hull);
  line(ctx, x, y, x, y - 52 * s, '#5b4636', 3.4 * s);
  poly(ctx, [[x + 3 * s, y - 50 * s], [x + 3 * s, y - 4 * s], [x + 27 * s, y - 4 * s]], sail);
  poly(ctx, [[x - 3 * s, y - 44 * s], [x - 3 * s, y - 4 * s], [x - 20 * s, y - 4 * s]], '#f8f5ec');
}

function shoreHouse(ctx, x, base, w, h, wall, roof) {
  rect(ctx, x, base - h, w, h, wall);
  poly(ctx, [[x - 5, base - h], [x + w + 5, base - h], [x + w / 2, base - h - 20]], roof);
  rect(ctx, x + w / 2 - 6, base - 26, 12, 26, '#5b4636');
}

function windowPane(ctx, x, y, lit) {
  rect(ctx, x - 7, y - 9, 14, 18, lit ? '#ffd60a' : '#33566b');
  line(ctx, x, y - 9, x, y + 9, '#22304a', 1.6);
  line(ctx, x - 7, y, x + 7, y, '#22304a', 1.6);
}

function crateOfFruit(ctx, x, y, fruit, count) {
  const spots = [[-16, -6], [0, -10], [16, -6], [-8, 6], [9, 6]];
  for (let i = 0; i < count; i += 1) circle(ctx, x + spots[i][0], y + spots[i][1], 10, fruit);
  poly(ctx, [[x - 30, y + 4], [x + 30, y + 4], [x + 24, y + 30], [x - 24, y + 30]], '#9a6a3f');
  line(ctx, x - 30, y + 13, x + 30, y + 13, '#7c5330', 3);
}

function lantern(ctx, x, y, body, lit) {
  if (lit) glow(ctx, x, y + 8, 26, '#ffca3a');
  line(ctx, x, y - 12, x, y, '#101d33', 2.4);
  roundRect(ctx, x - 8, y, 16, 22, 6, body);
  circle(ctx, x, y + 11, 4.5, lit ? '#ffe66d' : '#3a4a63');
}

function catSilhouette(ctx, x, y, s, colour, tailUp) {
  ellipse(ctx, x, y, 13 * s, 10 * s, colour); // body
  circle(ctx, x + 10 * s, y - 10 * s, 8 * s, colour); // head
  poly(ctx, [[x + 4 * s, y - 16 * s], [x + 7 * s, y - 23 * s], [x + 10 * s, y - 16 * s]], colour); // ear
  poly(ctx, [[x + 11 * s, y - 17 * s], [x + 15 * s, y - 23 * s], [x + 17 * s, y - 15 * s]], colour); // ear
  if (tailUp) curve(ctx, x - 12 * s, y + 2 * s, x - 20 * s, y - 4 * s, x - 17 * s, y - 14 * s, colour, 4 * s);
  else curve(ctx, x - 12 * s, y + 4 * s, x - 20 * s, y + 8 * s, x - 24 * s, y + 3 * s, colour, 4 * s);
}

// ---- set 1: Harbour Dawn ------------------------------------------------------

function drawHarbourDawn(ctx, altered) {
  skyGradient(ctx, W, H, [[0, '#ffc98a'], [0.45, '#ffe9c4'], [0.64, '#fff6dd'], [0.65, '#2e7f86'], [1, '#1f5f6b']]);
  // the sun, with rays on the left picture only
  if (!altered.has('sun-rays')) {
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      line(ctx, 105 + Math.cos(a) * 50, 100 + Math.sin(a) * 50, 105 + Math.cos(a) * 66, 100 + Math.sin(a) * 66, '#ffb703', 5);
    }
  }
  circle(ctx, 105, 100, 40, '#ffb703');
  circle(ctx, 105, 100, 33, '#ffc93c');
  cloud(ctx, 300, 78, 1, '#ffffff');
  cloud(ctx, 178, 148, 0.55, '#fffaf0');
  cloud(ctx, 418, 138, 0.72, '#ffffff');
  if (!altered.has('cloud-puff')) ellipse(ctx, 452, 128, 15, 10, '#ffffff'); // the small extra puff
  // gulls: three on the left, two on the right
  gull(ctx, 248, 92, 1, '#40607a');
  gull(ctx, 214, 122, 0.8, '#40607a');
  if (!altered.has('gulls')) gull(ctx, 286, 112, 0.9, '#40607a');
  // the quay and its houses
  rect(ctx, 0, 322, W, 10, '#8a6f4d');
  shoreHouse(ctx, 26, 322, 48, 58, '#f2e3c6', '#b3543f');
  shoreHouse(ctx, 84, 322, 50, 66, '#e8d7ae', '#7a5c3e');
  shoreHouse(ctx, 144, 322, 46, 54, '#f6ecd2', '#b3543f');
  windowPane(ctx, 50, 292, true);
  windowPane(ctx, 109, 284, altered.has('window')); // lit on the right, dark on the left
  windowPane(ctx, 167, 296, false);
  // the lighthouse on its rocks
  poly(ctx, [[392, 332], [520, 332], [520, 292], [470, 268], [420, 288]], '#4a4a52');
  poly(ctx, [[404, 332], [470, 332], [452, 300], [420, 306]], '#5d5d68');
  poly(ctx, [[436, 268], [474, 268], [468, 196], [442, 196]], '#f4f1e6');
  poly(ctx, [[440, 240], [470, 240], [467, 218], [443, 218]], '#d64541');
  poly(ctx, [[442, 196], [468, 196], [462, 178], [448, 178]], '#22304a');
  if (altered.has('lamp')) {
    rect(ctx, 449, 181, 12, 12, '#5a6a80'); // lamp gone dark
  } else {
    glow(ctx, 455, 187, 30, '#ffd60a');
    rect(ctx, 449, 181, 12, 12, '#ffd60a');
  }
  poly(ctx, [[434, 178], [476, 178], [455, 164]], '#b3543f');
  // boats on the water
  sailboat(ctx, 152, 388, 1, '#7a4a2b', altered.has('sail') ? '#f8f5ec' : '#e63946');
  sailboat(ctx, 322, 428, 0.78, '#5b4636', '#4361ee');
  circle(ctx, 252, 452, 8, '#d64541');
  rect(ctx, 248, 442, 8, 5, '#f8f5ec');
  wave(ctx, 90, 470, 1, '#bfe6ea');
  wave(ctx, 300, 486, 1.2, '#bfe6ea');
  wave(ctx, 430, 462, 0.9, '#bfe6ea');
  wave(ctx, 200, 356, 0.7, '#dff3f2');
}

// ---- set 2: Market Day --------------------------------------------------------

function drawMarketDay(ctx, altered) {
  skyGradient(ctx, W, H, [[0, '#a8dcff'], [0.55, '#e8f8ff'], [0.56, '#eec987'], [1, '#dfae62']]);
  circle(ctx, 458, 58, 26, '#ffd60a');
  cloud(ctx, 110, 66, 0.8, '#ffffff');
  cloud(ctx, 330, 44, 0.6, '#ffffff');
  // bunting across the top: two swags of flags
  const flagColours = ['#e63946', '#ffd166', '#2a9d8f', '#4361ee', '#f4845f'];
  for (const [x1, x2, sag] of [[16, 256, 66], [264, 504, 66]]) {
    curve(ctx, x1, 26, (x1 + x2) / 2, 26 + sag, x2, 26, '#5b4636', 2.4);
    for (let i = 0; i < 5; i += 1) {
      const t = (i + 0.5) / 5;
      const fx = x1 + (x2 - x1) * t;
      const fy = 26 + sag * 2 * t * (1 - t) + 2;
      let colour = flagColours[i];
      if (altered.has('bunting-flag') && x1 === 16 && i === 2) colour = '#9b5de5';
      poly(ctx, [[fx - 11, fy], [fx + 11, fy], [fx, fy + 20]], colour);
    }
  }
  // three stalls
  drawStall(ctx, 30, altered.has('awning') ? '#4361ee' : '#e63946');
  drawStall(ctx, 190, '#2a9d8f');
  drawStall(ctx, 350, '#f4845f');
  // the middle stall's hanging sign: a round emblem, or a star on the right
  line(ctx, 260, 196, 260, 214, '#5b4636', 3);
  if (altered.has('sign')) {
    const star = [];
    for (let i = 0; i < 10; i += 1) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? 15 : 6.5;
      star.push([260 + Math.cos(a) * r, 232 + Math.sin(a) * r]);
    }
    poly(ctx, star, '#ffd166');
    ring(ctx, 260, 232, 17, '#5b4636', 2.4);
  } else {
    circle(ctx, 260, 232, 16, '#ffd166');
    ring(ctx, 260, 232, 16, '#5b4636', 2.4);
    circle(ctx, 260, 232, 6, '#e07a3f');
  }
  // crates of fruit in front of the stalls
  crateOfFruit(ctx, 78, 330, altered.has('apples') ? '#7bc950' : '#e63946', 5);
  crateOfFruit(ctx, 262, 336, '#f48400', altered.has('oranges') ? 4 : 5);
  crateOfFruit(ctx, 428, 330, '#ffd60a', 5);
  // the plaza and its cobbles
  for (let row = 0; row < 3; row += 1) {
    for (let i = 0; i < 7; i += 1) {
      curve(ctx, 30 + i * 72 + (row % 2) * 30, 402 + row * 38, 52 + i * 72 + (row % 2) * 30, 394 + row * 38, 76 + i * 72 + (row % 2) * 30, 402 + row * 38, '#c99e5f', 2.4);
    }
  }
  // a bicycle leaning at the left
  ring(ctx, 66, 452, 24, '#22304a', 4);
  if (!altered.has('bike-wheel')) ring(ctx, 142, 452, 24, '#22304a', 4); // front wheel, left picture only
  line(ctx, 66, 452, 98, 416, '#c0392b', 4.4);
  line(ctx, 98, 416, 142, 452, '#c0392b', 4.4);
  line(ctx, 66, 452, 104, 452, '#c0392b', 4.4);
  line(ctx, 98, 416, 92, 404, '#22304a', 4);
  line(ctx, 84, 404, 104, 404, '#22304a', 4);
  // the market cat, tail up on the left and down on the right
  catSilhouette(ctx, 356, 428, 1.15, '#3c3c44', !altered.has('cat-tail'));
  // a sunflower in a pot at the right
  rect(ctx, 452, 448, 34, 30, '#b3543f');
  line(ctx, 469, 448, 469, 402, '#2a9d8f', 4.4);
  ellipse(ctx, 458, 424, 10, 5, '#2a9d8f');
  if (altered.has('flower')) {
    ellipse(ctx, 469, 392, 9, 13, '#7bc950'); // an unopened bud
  } else {
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      ellipse(ctx, 469 + Math.cos(a) * 13, 390 + Math.sin(a) * 13, 8, 5, '#ffd60a');
    }
    circle(ctx, 469, 390, 9, '#7a4a2b');
  }
}

function drawStall(ctx, x, awning) {
  rect(ctx, x + 6, 196, 8, 184, '#7a5c3e');
  rect(ctx, x + 126, 196, 8, 184, '#7a5c3e');
  for (let i = 0; i < 6; i += 1) {
    poly(ctx, [[x + i * 23, 196], [x + i * 23 + 12, 158], [x + i * 23 + 24, 158], [x + i * 23 + 12, 196]], i % 2 === 0 ? awning : '#f8f5ec');
  }
  rect(ctx, x, 300, 140, 14, '#9a6a3f');
  rect(ctx, x + 8, 314, 124, 66, '#b07f4e');
  line(ctx, x + 8, 336, x + 132, 336, '#8a6136', 3);
  line(ctx, x + 8, 358, x + 132, 358, '#8a6136', 3);
}

// ---- set 3: Lantern Night -----------------------------------------------------

function drawLanternNight(ctx, altered) {
  skyGradient(ctx, W, H, [[0, '#081c3a'], [0.6, '#12315e'], [0.61, '#0a1a33'], [1, '#0a1a33']]);
  // a steady field of stars, the same on both panels
  for (const star of scatterPoints(7, 80, W, 300, 14)) circle(ctx, star.x, star.y, star.r, '#dbe7ff', 0.75);
  if (!altered.has('star')) { // the bright sparkle star, left picture only
    circle(ctx, 402, 70, 3.6, '#ffffff');
    line(ctx, 402, 54, 402, 86, '#ffffff', 2.2);
    line(ctx, 386, 70, 418, 70, '#ffffff', 2.2);
  }
  // the moon: a crescent facing right on the left, left on the right
  circle(ctx, 82, 82, 34, '#f4f1de');
  circle(ctx, altered.has('moon') ? 62 : 102, 74, 30, '#0d2247');
  // rooftops and a chimney
  poly(ctx, [[0, 330], [90, 288], [180, 330]], '#0a1a33');
  poly(ctx, [[150, 330], [250, 282], [350, 330]], '#0a1a33');
  poly(ctx, [[330, 330], [430, 290], [520, 330]], '#0a1a33');
  rect(ctx, 140, 268, 20, 34, '#0a1a33');
  if (!altered.has('smoke')) { // chimney smoke, left picture only
    circle(ctx, 150, 248, 8, '#8fa8c8', 0.5);
    circle(ctx, 160, 230, 11, '#8fa8c8', 0.4);
    circle(ctx, 174, 208, 14, '#8fa8c8', 0.3);
  }
  // a string of lanterns across the street
  curve(ctx, 8, 118, 260, 178, 512, 112, '#050f1f', 2.6);
  const lanternSpots = [[70, 132], [160, 148], [260, 156], [360, 148], [450, 130]];
  lanternSpots.forEach(([x, y], i) => {
    let body = ['#e63946', '#ffca3a', '#2a9d8f', '#ffca3a', '#e63946'][i];
    if (altered.has('lantern-colour') && i === 2) body = '#e63946';
    const lit = !(altered.has('lantern-lit') && i === 1);
    lantern(ctx, x, y, body, lit);
  });
  // the buildings and their windows
  rect(ctx, 0, 330, 170, 190, '#1d3557');
  rect(ctx, 176, 330, 180, 190, '#243b55');
  rect(ctx, 362, 330, 158, 190, '#1d3557');
  for (const [x, y] of [[36, 366], [86, 366], [36, 420], [212, 366], [262, 366], [312, 366], [398, 366], [448, 366], [398, 420], [448, 420]]) {
    rect(ctx, x, y, 20, 26, '#ffd60a', 0.9);
    line(ctx, x + 10, y, x + 10, y + 26, '#1d3557', 2);
  }
  rect(ctx, 86, 420, 20, 26, '#2c4a73'); // one dark window
  // the shuttered window: shutters open on the left, closed on the right
  if (altered.has('shutters')) {
    rect(ctx, 306, 414, 28, 30, '#7a4a2b');
    line(ctx, 320, 414, 320, 444, '#5d3820', 2.4);
  } else {
    rect(ctx, 310, 414, 20, 30, '#ffd60a', 0.9);
    poly(ctx, [[310, 414], [298, 420], [298, 438], [310, 444]], '#7a4a2b');
    poly(ctx, [[330, 414], [342, 420], [342, 438], [330, 444]], '#7a4a2b');
  }
  // a door with a wreath on the left picture only
  roundRect(ctx, 36, 452, 52, 68, 10, '#7a4a2b');
  if (!altered.has('wreath')) {
    ring(ctx, 62, 478, 11, '#2a9d8f', 5);
    circle(ctx, 62, 467, 3.4, '#e63946');
    circle(ctx, 53, 484, 3.4, '#e63946');
    circle(ctx, 71, 484, 3.4, '#e63946');
  }
  // a street lamp, lit on both panels
  line(ctx, 492, 330, 492, 452, '#050f1f', 6);
  lantern(ctx, 492, 318, '#22304a', true);
  // a low wall, and the cat that sits on it on the left picture only
  rect(ctx, 380, 452, 140, 14, '#2c4a73');
  if (!altered.has('cat')) catSilhouette(ctx, 436, 442, 1.05, '#050f1f', true);
  // a signpost whose arrow turns around on the right
  line(ctx, 196, 452, 196, 372, '#050f1f', 6);
  if (altered.has('arrow')) {
    poly(ctx, [[196, 380], [150, 380], [150, 372], [132, 386], [150, 400], [150, 392], [196, 392]], '#c98f2e');
  } else {
    poly(ctx, [[196, 380], [242, 380], [242, 372], [260, 386], [242, 400], [242, 392], [196, 392]], '#c98f2e');
  }
  // the street and a puddle that may or may not hold the moon
  rect(ctx, 0, 466, W, 54, '#0d2247');
  ellipse(ctx, 282, 496, 62, 11, '#3a6ea5', 0.55);
  if (!altered.has('reflection')) ellipse(ctx, 268, 496, 16, 4.5, '#f4f1de', 0.8);
}

// ---- the set list ---------------------------------------------------------------

export const SCENES = [
  {
    id: 'harbour',
    title: 'Harbour Dawn',
    blurb: 'Set 1 of 3 · a gentle warm-up',
    differences: [
      { id: 'sun-rays', x: 105, y: 100, r: 52 },
      { id: 'cloud-puff', x: 452, y: 132, r: 30 },
      { id: 'gulls', x: 286, y: 112, r: 24 },
      { id: 'window', x: 109, y: 284, r: 20 },
      { id: 'lamp', x: 455, y: 187, r: 28 },
      { id: 'sail', x: 158, y: 356, r: 36 },
    ],
    draw: drawHarbourDawn,
  },
  {
    id: 'market',
    title: 'Market Day',
    blurb: 'Set 2 of 3 · a busier hunt',
    differences: [
      { id: 'bunting-flag', x: 136, y: 52, r: 22 },
      { id: 'awning', x: 100, y: 176, r: 44 },
      { id: 'sign', x: 260, y: 232, r: 22 },
      { id: 'apples', x: 78, y: 330, r: 28 },
      { id: 'oranges', x: 262, y: 336, r: 28 },
      { id: 'bike-wheel', x: 142, y: 452, r: 28 },
      { id: 'cat-tail', x: 338, y: 424, r: 24 },
      { id: 'flower', x: 469, y: 390, r: 26 },
    ],
    draw: drawMarketDay,
  },
  {
    id: 'lantern',
    title: 'Lantern Night',
    blurb: 'Set 3 of 3 · the hard one',
    differences: [
      { id: 'moon', x: 82, y: 82, r: 38 },
      { id: 'star', x: 402, y: 70, r: 22 },
      { id: 'smoke', x: 158, y: 232, r: 28 },
      { id: 'lantern-lit', x: 160, y: 158, r: 24 },
      { id: 'lantern-colour', x: 260, y: 166, r: 24 },
      { id: 'shutters', x: 320, y: 429, r: 24 },
      { id: 'arrow', x: 228, y: 386, r: 30 },
      { id: 'cat', x: 436, y: 436, r: 26 },
      { id: 'wreath', x: 62, y: 478, r: 20 },
      { id: 'reflection', x: 268, y: 496, r: 30 },
    ],
    draw: drawLanternNight,
  },
];
