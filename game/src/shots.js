// shots.js — reads a "pose" from the page's URL so a screenshot can be taken of the
// game mid-hunt, the way the kit's starter does: serve the game, open it with
// ?shot=play&set=2&found=moon,star,smoke&clock=187 and the game starts on that set
// with those differences already found, the clock held at that many seconds and
// everything frozen steady for the camera. With no ?shot= the game just plays.

export function readShotPose() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('shot')) return null;
  const set = Number.parseInt(params.get('set') ?? '0', 10);
  const clock = params.get('clock');
  return {
    set: Number.isNaN(set) ? 0 : set,
    found: (params.get('found') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    secondsLeft: clock === null ? null : Number(clock),
  };
}
