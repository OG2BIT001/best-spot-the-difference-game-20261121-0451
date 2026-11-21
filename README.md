[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/OG2BIT001/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/OG2BIT001/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

# Lantern Lane — Spot the Difference

A spot-the-difference game for the make.fun bounty
`best-spot-the-difference-game-20261121-0451` ("Make the best spot the difference
game", $50). Two near-identical pictures stand side by side; click what changed.
Found differences get a green ring and a tick, the counter in the header says how
many are still hiding, a clock is always running, and three hints a set will
pulse around one you have missed.

## The sets

1. **Harbour Dawn** — 6 differences around a sunrise harbour: a lighthouse, two
   sailboats, shore houses and gulls. The warm-up.
2. **Market Day** — 8 differences in a busy market square: striped awnings,
   crates of fruit, bunting, a bicycle and a cat.
3. **Lantern Night** — 10 differences on a lamplit night street: a crescent
   moon, a string of lanterns, shutters, a wreath and a cat on a wall. The hard one.

Every picture is drawn in code on a canvas — no image files, no libraries, no
network. Sounds (a chime for a find, a thud for a miss, an arpeggio for a win)
are synthesised with WebAudio, so the game needs no assets at all.

## Play it

Serve `game/` with any static file server and open it in a desktop browser, or
just open `game/index.html`. Click a difference in either picture. Keys:
**H** hint, **R** restart the set, **N** next set, **1/2/3** jump to a set.
For screenshots the game accepts a pose in its URL, e.g.
`?shot=play&set=2&found=moon,star&clock=187` starts on set 3 with two
differences already found and the clock held still.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json` with the vendored library.
- `vendor/makefun-game.ts` — make.fun's game library, copied from the kit unchanged.
- `game/index.html`, `game/style.css` — the page and its dress.
- `game/src/config.js` — sizes, timing and chrome colours.
- `game/src/scenes.js` — the three pictures and their difference lists.
- `game/src/render.js` — the shared paint helpers the scenes draw with.
- `game/src/markers.js` — found rings, miss crosses and the hint pulse.
- `game/src/state.js` — one set's state and the rules that change it.
- `game/src/input.js` — mouse and keyboard, in scene coordinates.
- `game/src/sound.js` — the synthesised sounds.
- `game/src/shots.js` — the URL pose reader for screenshots.
- `game/src/main.js` — the conductor: canvases, HUD, frame loop.
- `screenshots/` — three screenshots of the game in play (see SESSION.md for
  exactly how they were made).

## Hand it in

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

writes `out/game`, `out/screenshots` and `out/dossier.json`.
