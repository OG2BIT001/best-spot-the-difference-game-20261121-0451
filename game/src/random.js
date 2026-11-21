// random.js — a tiny seeded random number generator (mulberry32). The scenes use it for
// things like the night sky's stars so the left and right pictures always agree with
// each other: same seed, same sky, and only the deliberate differences differ.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// scatterPoints(seed, count, width, height, margin) returns `count` steady points in a box.
export function scatterPoints(seed, count, width, height, margin) {
  const next = mulberry32(seed);
  const points = [];
  for (let i = 0; i < count; i += 1) {
    points.push({
      x: margin + next() * (width - margin * 2),
      y: margin + next() * (height - margin * 2),
      r: 0.8 + next() * 1.6,
    });
  }
  return points;
}
