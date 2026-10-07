/** Original portrait settings: 43 / 27 / 7 frames at 30 fps. */
export const defaults = Object.freeze({
  duration: 43 / 30,
  focusDuration: 27 / 30,
  fadeDuration: 7 / 30,
  rise: 90,
  blur: 12,
  tiltX: 7,
  tiltY: -5,
  tiltZ: 0.6,
  startScale: 0.9,
  perspective: 1800,
});

const clamp = (n) => Math.min(1, Math.max(0, n));
const bezier = (t, a, b) =>
  3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;

/** CSS / Remotion cubic-bezier(0.16, 1, 0.3, 1), including x-axis inversion. */
export function easeOut(progress) {
  const x = clamp(progress);
  if (x === 0 || x === 1) return x;
  let lo = 0,
    hi = 1;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    if (bezier(mid, 0.16, 0.3) < x) lo = mid;
    else hi = mid;
  }
  return bezier((lo + hi) / 2, 1, 1);
}

/** Pure, seekable animation. Time is in seconds, dimensions in CSS pixels. */
export function sampleMotion(time, settings = {}) {
  const p = { ...defaults, ...settings };
  for (const [key, value] of Object.entries(p)) {
    if (!Number.isFinite(value)) throw new TypeError(`${key} must be finite`);
  }
  if (!Number.isFinite(time)) throw new TypeError("time must be finite");
  if (
    p.duration <= 0 ||
    p.focusDuration <= 0 ||
    p.fadeDuration <= 0 ||
    p.perspective <= 0 ||
    p.startScale <= 0 ||
    p.blur < 0
  ) {
    throw new RangeError(
      "Durations, scale and perspective must be positive; blur cannot be negative",
    );
  }
  const arrival = easeOut(time / p.duration);
  const focus = easeOut(time / p.focusDuration);
  return {
    arrival,
    focus,
    opacity: clamp(time / p.fadeDuration),
    y: p.rise * (1 - arrival),
    scale: p.startScale + (1 - p.startScale) * arrival,
    rotateX: p.tiltX * (1 - arrival),
    rotateY: p.tiltY * (1 - arrival),
    rotateZ: p.tiltZ * (1 - arrival),
    blur: p.blur * (1 - focus),
    perspective: p.perspective,
  };
}

export function motionStyle(time, settings = {}) {
  const m = sampleMotion(time, settings);
  return {
    opacity: m.opacity,
    transform: `perspective(${m.perspective}px) translateY(${m.y}px) scale(${m.scale}) rotateX(${m.rotateX}deg) rotateY(${m.rotateY}deg) rotateZ(${m.rotateZ}deg)`,
    transformOrigin: "50% 50%",
    filter: `blur(${m.blur}px)`,
  };
}
