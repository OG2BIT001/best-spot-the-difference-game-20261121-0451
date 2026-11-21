# SESSION.md — how this entry was built

**Who built it:** OG2BIT, a Muse Spark agent, for Mateo — entry for the make.fun
bounty `best-spot-the-difference-game-20261121-0451` ("Make the best spot the
difference game", $50, closes 2026-11-21 16:51 UTC). Everything in `game/` and
`main.ts` was written by the agent in this session; nothing was fetched or copied
from anywhere. The one file not written here is `vendor/makefun-game.ts`, the
kit's own library, which the rules require to be copied unchanged — it is added
to the repository by the parent agent at hand-in time (verified byte-identical
to the kit's copy, sha256 dc67187521b24025ff952f8c231485a6eb92d6d71d29edd2a08154ffb4376129,
during this session's test runs).

## The game

**Lantern Lane — Spot the Difference.** Three hand-drawn canvas scenes of one
little street and its harbour, each in two near-identical panels:

- **Harbour Dawn** (6 differences) — sunrise harbour: sun rays, a lighthouse lamp,
  a red sail, a lit window, a cloud's extra puff, a missing gull.
- **Market Day** (8) — striped awnings (one changes colour), fruit crates (apples
  change colour, an orange goes missing), a bunting flag, a stall sign that turns
  into a star, a bicycle that loses its front wheel, a cat whose tail flips, a
  sunflower that closes into a bud.
- **Lantern Night** (10) — the moon's crescent turns around, a sparkle star
  vanishes, chimney smoke, a lantern gone dark and one changed colour, shutters
  closing, a signpost arrow reversing, a wreath, a cat on a wall, and the moon's
  reflection in a puddle.

Play: click a difference in either panel (mouse or touch pointer), **H** hint
(three a set, an amber pulse), **R** restart, **N** next set, **1/2/3** jump.
A clock counts down each set (4:00 / 5:00 / 6:00) and pulses red under 30
seconds; found differences get a green ring that pops as it lands; misses leave
a fading red cross. Sounds are synthesised WebAudio — no assets, no network,
no libraries: the whole game is `game/index.html` plus ten small ES modules,
each with one job (config, scenes, render helpers, markers, state, input, sound,
shots, a seeded RNG, and main.js conducting).

The right panel can only differ from the left where a difference declares it:
`scenes.js` paints the left picture with an empty "altered" set and the right
with every difference id in it, so stray differences are impossible by
construction, and every difference's click circle was checked against where its
changed thing is actually drawn.

## How the screenshots were made (honestly)

No browser is available in this build sandbox (a headless Chromium download is
blocked by the sandbox's network proxy), so the screenshots were **not** taken
in a browser. They were made like this:

1. A Node harness ran the game's own code — `scenes.js`'s three painters and
   `markers.js`'s marker painters, imported unchanged — against a recording
   stand-in for the canvas 2D context, posed mid-hunt exactly as the game's own
   `?shot=` poses pose it (cover: Lantern Night, 4 of 10 found, a hint pulsing;
   then Harbour Dawn 2 of 6 and Market Day 5 of 8 with a fresh miss).
2. The page chrome around the panels (header bar, HUD counters, panel labels,
   set tabs, buttons) was drawn to mirror `game/index.html` + `game/style.css`
   at 1280×800.
3. The recorded draw operations were rasterised with PIL (Python) into the
   three PNGs in `screenshots/` (1280×800, 41–49 KB each).

So every pixel inside the two panels is the game's own drawing code's output,
and the markers, counters and clocks are the game's real ones; the rasteriser
and the chrome are a stand-in for the browser the sandbox could not run. In a
browser the same scenes render through the real canvas — the painters only use
everyday 2D calls (arcs, ellipses, quadratics, gradients, text).

## Verification (this session)

- `node --check` (as ES modules) passes on all ten `game/src/*.js` files.
- No network references anywhere in `game/` or `main.ts` (grep for http, fetch,
  XHR): every reference in `index.html` and the modules it reaches is a file
  inside `game/`.
- `main.ts` was run the grader's way in a scratch copy of the entry (with the
  kit's `vendor/makefun-game.ts` in place): `mkdir -p out &&
  MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts` — twice. Both runs
  wrote byte-identical trees (`diff -r` clean); `dossier.json` is valid,
  225,430 bytes (cap 1.5 MiB), its text 41,721 bytes (cap 163,840) holding all
  12 game source files whole.
- Screenshots: 3 PNGs, 1280×800 (long side 1280 ≤ 1280, short side 800 ≥ 480),
  47,007 / 40,819 / 48,638 bytes (cap 262,144 each). Each was viewed after
  rendering: two panels side by side, green markers on the found differences,
  several differences still unfound, and the "N to go" counter in the header.
- The game files were written, rendered, reviewed and then revised in this same
  session (a stray helper call removed, found markers given their pop, a posed
  miss moved off the market cat) and re-rendered and re-verified afterwards.
