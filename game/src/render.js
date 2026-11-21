// render.js — the paint box: small drawing helpers every scene shares, so a scene reads
// as a list of things ("a red sail here, a lit window there") instead of raw canvas calls.
// Each helper takes the 2D context first. Colours are CSS colour strings; `alpha` is
// optional on the helpers that layer light (glows, shadows).

export function skyGradient(ctx, width, height, stops) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  for (const [offset, colour] of stops) gradient.addColorStop(offset, colour);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export function rect(ctx, x, y, w, h, colour, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1;
}

export function circle(ctx, cx, cy, r, colour, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function ellipse(ctx, cx, cy, rx, ry, colour, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function poly(ctx, points, colour, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function line(ctx, x1, y1, x2, y2, colour, width, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

// curve draws a smooth open stroke through three points (a quadratic bend).
export function curve(ctx, x1, y1, cx, cy, x2, y2, colour, width, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function ring(ctx, cx, cy, r, colour, width, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function roundRect(ctx, x, y, w, h, r, colour, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function text(ctx, value, x, y, size, colour, options = {}) {
  const { align = 'center', bold = false, alpha = 1 } = options;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = colour;
  ctx.font = `${bold ? '700 ' : ''}${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
  ctx.globalAlpha = 1;
}

// glow draws a soft pool of light: three widening, fading circles of one colour.
export function glow(ctx, cx, cy, r, colour) {
  circle(ctx, cx, cy, r, colour, 0.1);
  circle(ctx, cx, cy, r * 0.66, colour, 0.14);
  circle(ctx, cx, cy, r * 0.4, colour, 0.2);
}
