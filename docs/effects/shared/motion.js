/** All times are seconds. Shared verbatim by the browser and Remotion. */
export const clamp = (x) => Math.max(0, Math.min(1, x));
export const cubic = (t) => 1 - (1 - clamp(t)) ** 3;
function number(n, label) {
  if (!Number.isFinite(n)) throw new TypeError(`${label} must be finite`);
  return n;
}
export function elastic(t) {
  number(t, "time");
  if (t <= 0) return 0;
  // Physical spring from the reference: damping=15, stiffness=170, mass=.7.
  const w0 = Math.sqrt(170 / 0.7),
    z = 15 / (2 * Math.sqrt(170 * 0.7));
  const w = w0 * Math.sqrt(1 - z * z);
  return (
    1 -
    Math.exp(-z * w0 * t) * (Math.cos(w * t) + ((z * w0) / w) * Math.sin(w * t))
  );
}
export function arcMotion(time, count = 4, settings = {}) {
  number(time, "time");
  if (!Number.isInteger(count) || count < 1 || count > 6)
    throw new RangeError("Use 1–6 characters");
  const stagger = number(settings.stagger ?? 1.7 / 30, "stagger");
  if (stagger < 0 || stagger > 0.2)
    throw new RangeError("stagger must be 0–0.2 seconds");
  return Array.from({ length: count }, (_, i) => {
    const p = elastic(Math.max(0, time - i * stagger)),
      distance = i - (count - 1) / 2;
    return {
      y: distance * distance * 8 + (1 - p) * 45,
      rotate: distance * 8,
      scale: 0.75 + 0.25 * p,
      opacity: clamp(time / (4 / 30)),
    };
  });
}
export function orbitMotion(time, settings = {}) {
  number(time, "time");
  const ringSpeed = number(settings.ringSpeed ?? 7.2, "ringSpeed");
  if (ringSpeed < 0 || ringSpeed > 60)
    throw new RangeError("ringSpeed must be 0–60 deg/s");
  return {
    scale: 0.86 + 0.14 * cubic(time / 0.3),
    rotation: Math.max(0, time) * ringSpeed,
  };
}
export const cardStarts = Object.freeze([0, 2.2, 4.133333333333333]);
export function cardsMotion(time, settings = {}) {
  number(time, "time");
  const rise = number(settings.distance ?? 35, "distance");
  if (rise < 0 || rise > 100) throw new RangeError("distance must be 0–100 px");
  return cardStarts.map((at, i) => ({
    x: (1 - cubic((time - at) / 0.3)) * rise,
    opacity: time < at ? 0.2 : 1,
    active: time >= at && (i === 2 || time < cardStarts[i + 1]),
  }));
}
export const definitions = Object.freeze({
  "arc-pop-title": {
    name: "弧形逐字弹入",
    duration: 2.7,
    posterTime: 1.2,
    parameter: "stagger",
    label: "逐字间隔",
    unit: "s",
    value: 1.7 / 30,
    min: 0,
    max: 0.15,
    step: "any",
    summary: "文字依次上浮、轻弹，沿弧线停稳。适合口播开场与重点提示。",
  },
  "spotlight-orbit": {
    name: "圆形聚焦旋环",
    duration: 2.1,
    posterTime: 1.1,
    parameter: "ringSpeed",
    label: "圆环转速",
    unit: "°/s",
    value: 7.2,
    min: 0,
    max: 30,
    step: 0.1,
    summary: "圆形窗口轻推入场，外围虚线匀速旋转。适合观点转折与人物聚焦。",
  },
  "progressive-cards": {
    name: "递进高亮卡片",
    duration: 6.733333333333333,
    posterTime: 5.3,
    parameter: "distance",
    label: "入场位移",
    unit: "px",
    value: 35,
    min: 0,
    max: 80,
    step: 1,
    summary: "三张卡片依次归位、逐项高亮，让分点讲解始终有视觉重心。",
  },
});
