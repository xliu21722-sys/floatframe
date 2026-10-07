import test from "node:test";
import assert from "node:assert/strict";
import {
  defaults,
  easeOut,
  sampleMotion,
  motionStyle,
} from "../docs/lib/motion.js";

test("original starting pose is preserved", () => {
  const m = sampleMotion(0);
  assert.equal(m.y, 90);
  assert.equal(m.blur, 12);
  assert.equal(m.opacity, 0);
  assert.equal(m.scale, 0.9);
  assert.equal(m.rotateX, 7);
  assert.equal(m.rotateY, -5);
});
test("settles fully, clamps before and after animation", () => {
  assert.deepEqual(sampleMotion(-4), sampleMotion(0));
  const m = sampleMotion(defaults.duration);
  assert.equal(m.y, 0);
  assert.equal(m.blur, 0);
  assert.equal(m.scale, 1);
  assert.equal(m.opacity, 1);
  assert.deepEqual(sampleMotion(99), m);
});
test("focus and fade use original independent 27 / 7 frame timings", () => {
  assert.equal(sampleMotion(7 / 30).opacity, 1);
  assert.equal(sampleMotion(27 / 30).blur, 0);
  assert.ok(sampleMotion(27 / 30).y > 0);
});
test("easing is continuous and monotonic", () => {
  let previous = 0;
  for (let i = 0; i <= 1000; i++) {
    const value = easeOut(i / 1000);
    assert.ok(value >= previous && value <= 1);
    previous = value;
  }
  assert.ok(easeOut(0.5) > 0.95);
});
test("invalid durations and non-finite values reject intentionally", () => {
  assert.throws(() => sampleMotion(0, { duration: 0 }), RangeError);
  assert.throws(() => sampleMotion(NaN), TypeError);
  assert.throws(() => sampleMotion(0, { rise: Infinity }), TypeError);
});
test("style preserves reference transform order and whole image behavior", () => {
  const s = motionStyle(0);
  assert.equal(
    s.transform,
    "perspective(1800px) translateY(90px) scale(0.9) rotateX(7deg) rotateY(-5deg) rotateZ(0.6deg)",
  );
  assert.equal(s.filter, "blur(12px)");
  assert.equal(s.transformOrigin, "50% 50%");
});
