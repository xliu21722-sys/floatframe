import { definitions } from "./motion.js";
import { renderEffect } from "./render.js";
const id = document.body.dataset.effect,
  def = definitions[id],
  $ = (id) => document.getElementById(id);
if (!def) throw Error("Unknown effect page");
const names = {
  "arc-pop-title": "ArcPopTitle",
  "spotlight-orbit": "SpotlightOrbit",
  "progressive-cards": "ProgressiveCards",
};
const title =
  id === "arc-pop-title"
    ? "重点来了"
    : id === "spotlight-orbit"
      ? "请记住"
      : "让观点，一步步讲清楚";
const options = { title, [def.parameter]: def.value };
let time = def.posterTime,
  playing = false,
  raf = 0,
  started = 0,
  offset = 0;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
$("effect-name").textContent = def.name;
$("summary").textContent = def.summary;
$("text-input").value = title;
$("text-input").maxLength = id === "progressive-cards" ? 16 : 6;
$("parameter-label").textContent = def.label;
Object.assign($("parameter"), {
  min: def.min,
  max: def.max,
  step: def.step,
  value: def.value,
});
$("timeline").max = def.duration;
$("end-time").textContent = def.duration.toFixed(2) + " s";
$("source").href =
  `https://github.com/xliu21722-sys/floatframe/tree/main/src/effects/${id}`;
function draw() {
  $("effect-scene").innerHTML = renderEffect(id, time, options);
  $("effect-scene").dataset.time = time.toFixed(4);
  $("timeline").value = time;
  $("time").textContent = time.toFixed(2) + " s";
  $("parameter-value").textContent =
    Number(options[def.parameter].toFixed(3)) + " " + def.unit;
  $("code").textContent =
    `import { ${names[id]} } from './effects/${id}';\n\n<${names[id]}\n  settings={${JSON.stringify(options, null, 2)}}\n/>`;
}
function pause() {
  playing = false;
  cancelAnimationFrame(raf);
  $("play").textContent = "播放";
  $("play").setAttribute("aria-label", "播放动效");
  $("state").textContent = time >= def.duration ? "播放完毕" : "已暂停";
}
function tick(now) {
  if (!playing) return;
  time = Math.min(def.duration, offset + (now - started) / 1000);
  draw();
  if (time >= def.duration) {
    if ($("loop").checked) {
      offset = 0;
      started = now;
      raf = requestAnimationFrame(tick);
    } else pause();
  } else raf = requestAnimationFrame(tick);
}
function play() {
  cancelAnimationFrame(raf);
  if (time >= def.duration) time = 0;
  offset = time;
  started = performance.now();
  playing = true;
  $("play").textContent = "暂停";
  $("play").setAttribute("aria-label", "暂停动效");
  $("state").textContent = "播放中";
  raf = requestAnimationFrame(tick);
}
function replay() {
  time = 0;
  draw();
  play();
}
$("play").addEventListener("click", () => (playing ? pause() : play()));
$("replay").addEventListener("click", replay);
$("timeline").addEventListener("input", (e) => {
  time = Number(e.target.value);
  pause();
  draw();
});
$("text-input").addEventListener("input", (e) => {
  options.title = e.target.value || title;
  draw();
});
$("parameter").addEventListener("input", (e) => {
  options[def.parameter] = Number(e.target.value);
  pause();
  draw();
});
$("reset").addEventListener("click", () => {
  options.title = title;
  options[def.parameter] = def.value;
  $("parameter").value = def.value;
  $("text-input").value = title;
  time = def.posterTime;
  pause();
  draw();
});
$("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("code").textContent);
    $("copy-status").textContent = "已复制";
  } catch {
    $("copy-status").textContent = "请选中下方代码手动复制";
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});
reduced.addEventListener("change", () => {
  if (reduced.matches) {
    time = def.posterTime;
    pause();
    draw();
  }
});
const modelContext = document.modelContext ?? navigator.modelContext;
if (modelContext?.registerTool) {
  const life = new AbortController();
  try {
    Promise.resolve(
      modelContext.registerTool(
        {
          name: "seek_library_motion",
          title: "查看镜头库动效的指定时刻",
          description:
            "Pause the local visual preview and seek in seconds. No upload or publishing.",
          inputSchema: {
            type: "object",
            properties: {
              time: { type: "number", minimum: 0, maximum: def.duration },
            },
            required: ["time"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            if (
              !Number.isFinite(input?.time) ||
              input.time < 0 ||
              input.time > def.duration
            )
              throw Error("Time outside the composition");
            time = input.time;
            pause();
            draw();
            return { id, time };
          },
        },
        { signal: life.signal },
      ),
    ).catch(() => {});
  } catch {
    /* Optional API; standard controls remain available. */
  }
  window.addEventListener("pagehide", () => life.abort(), { once: true });
}
draw();
if (!reduced.matches) replay();
