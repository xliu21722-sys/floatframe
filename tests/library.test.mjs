import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { spring } from "remotion";
import {
  arcMotion,
  orbitMotion,
  cardsMotion,
  elastic,
  definitions,
} from "../docs/effects/shared/motion.js";
import { renderEffect } from "../docs/effects/shared/render.js";

test("title spring agrees with reference Remotion physics at 30 and 60 fps", () => {
  for (const fps of [30, 60])
    for (const t of [0, 1 / 30, 0.1, 0.2, 0.35, 0.7, 1.2]) {
      const expected = spring({
        frame: t * fps,
        fps,
        config: { damping: 15, stiffness: 170, mass: 0.7 },
      });
      assert.ok(
        Math.abs(elastic(t) - expected) < 0.002,
        `${fps} fps at ${t}: ${elastic(t)} vs ${expected}`,
      );
    }
});
test("arc has the same start pose, stagger and resting arc", () => {
  assert.deepEqual(arcMotion(-1), arcMotion(0));
  const a = arcMotion(0);
  assert.equal(a[0].y, 63);
  assert.equal(a[0].scale, 0.75);
  assert.equal(a[0].opacity, 0);
  assert.equal(a[0].rotate, -12);
  assert.ok(arcMotion(0.1)[0].scale > arcMotion(0.1)[3].scale);
  assert.ok(Math.abs(arcMotion(2)[0].y - 18) < 0.001);
  assert.equal(arcMotion(1, 1)[0].rotate, 0);
});
test("circle scale stops without drift; ring is deterministic and seekable", () => {
  assert.equal(orbitMotion(0).scale, 0.86);
  assert.equal(orbitMotion(0.3).scale, 1);
  assert.equal(orbitMotion(2).rotation, 14.4);
  assert.deepEqual(orbitMotion(2), orbitMotion(2));
  assert.equal(orbitMotion(2, { ringSpeed: 0 }).rotation, 0);
});
test("card states match edited-video timings and preserve inactive cards", () => {
  assert.deepEqual(
    cardsMotion(-1).map((m) => m.opacity),
    [0.2, 0.2, 0.2],
  );
  assert.deepEqual(
    cardsMotion(0).map((m) => m.active),
    [true, false, false],
  );
  assert.deepEqual(
    cardsMotion(2.2).map((m) => m.active),
    [false, true, false],
  );
  assert.deepEqual(
    cardsMotion(4.133333333333333).map((m) => m.active),
    [false, false, true],
  );
  assert.equal(cardsMotion(5)[2].x, 0);
  assert.equal(cardsMotion(2)[2].x, 35);
});
test("reject invalid values instead of poisoning generated SVG", () => {
  assert.throws(() => arcMotion(NaN));
  assert.throws(() => arcMotion(0, 7));
  assert.throws(() => arcMotion(0, 4, { stagger: -1 }));
  assert.throws(() => orbitMotion(1, { ringSpeed: Infinity }));
  assert.throws(() => cardsMotion(1, { distance: -5 }));
  assert.throws(() => renderEffect("missing", 0));
});
test("safe SVG inputs and deterministic rendering for seek and playback", () => {
  const s = renderEffect("arc-pop-title", 1, { title: "<img>" });
  assert.ok(!s.includes("<img>"));
  assert.ok(s.includes("&lt;"));
  for (const id of Object.keys(definitions))
    for (const t of [0, 0.1, 1, definitions[id].duration]) {
      const svg = renderEffect(id, t);
      assert.equal(svg, renderEffect(id, t));
      assert.ok(!/NaN|Infinity|undefined/.test(svg));
      assert.ok(svg.includes('viewBox="0 0 720 1280"'));
    }
});
test("public catalog has three unique effects with working page and code paths", () => {
  const data = JSON.parse(
    fs.readFileSync(new URL("../docs/effects/index.json", import.meta.url)),
  );
  assert.equal(data.effects.length, 3);
  assert.equal(new Set(data.effects.map((x) => x.id)).size, 3);
  for (const e of data.effects) {
    assert.equal(e.durationSeconds, definitions[e.id].duration);
    assert.ok(
      fs.existsSync(
        new URL(`../docs/${e.previewPath}index.html`, import.meta.url),
      ),
    );
    assert.ok(
      fs.existsSync(
        new URL(`../src/effects/${e.id}/index.tsx`, import.meta.url),
      ),
    );
  }
  const home = fs.readFileSync(
    new URL("../docs/index.html", import.meta.url),
    "utf8",
  );
  assert.ok(home.includes("<title>阿伟的镜头库"));
  assert.ok(home.includes('id="floatframe"'));
  assert.ok(home.includes('id="implementation"'));
});
