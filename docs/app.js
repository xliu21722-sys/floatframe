import { defaults, sampleMotion, motionStyle } from "./lib/motion.js";

const $ = (id) => document.getElementById(id);
const settings = { ...defaults };
let time = defaults.duration,
  playing = false,
  raf = 0,
  started = 0,
  objectUrl;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const endTime = () => Math.max(2.3, settings.duration + 0.85);

function snippet() {
  return `import { FloatFrame } from './FloatFrame';\nimport { staticFile } from 'remotion';\n\n<FloatFrame\n  src={staticFile('photo.jpg')}\n  style={{ width: 833, height: 885 }}\n  settings={{\n    duration: ${+settings.duration.toFixed(6)}, rise: ${settings.rise}, blur: ${settings.blur},\n    focusDuration: ${+settings.focusDuration.toFixed(6)}, fadeDuration: ${+settings.fadeDuration.toFixed(6)},\n    tiltX: ${settings.tiltX}, tiltY: ${+settings.tiltY.toFixed(6)}, tiltZ: ${+settings.tiltZ.toFixed(6)}\n  }}\n/>`;
}

function draw() {
  Object.assign($("motion-card").style, motionStyle(time, settings));
  const m = sampleMotion(time, settings);
  $("timeline").value = time;
  $("time-output").textContent = `${time.toFixed(2)} s`;
  $("frame-count").textContent =
    `F ${String(Math.round(time * 30)).padStart(3, "0")} / 30 FPS`;
  $("live-y").innerHTML = `${m.y.toFixed(1)}<small>px</small>`;
  $("live-blur").innerHTML = `${m.blur.toFixed(1)}<small>px</small>`;
  $("live-scale").innerHTML = `${m.scale.toFixed(2)}<small>×</small>`;
  $("curve-dot").setAttribute(
    "cx",
    String(2 + Math.min(1, Math.max(0, time / settings.duration)) * 176),
  );
  $("curve-dot").setAttribute("cy", String(60 - m.arrival * 56));
}

function updateControls() {
  for (const [id, val, unit] of [
    ["duration", settings.duration, " s"],
    ["rise", settings.rise, " px"],
    ["blur", settings.blur, " px"],
    ["tilt", settings.tiltX, "°"],
  ]) {
    $(id).value = val;
    $(`${id}-value`).textContent =
      `${id === "duration" ? val.toFixed(2) : val}${unit}`;
  }
  $("timeline").max = endTime();
  $("duration-label").textContent = `${endTime().toFixed(2)} s`;
  $("code").textContent = snippet();
}

function pause() {
  playing = false;
  cancelAnimationFrame(raf);
  $("play").innerHTML = "▶ <span>重播</span>";
  $("play").setAttribute("aria-label", "重播动效");
  $("play-state").textContent = time >= settings.duration ? "已停稳" : "已暂停";
}

function tick(now) {
  if (!playing) return;
  time = Math.min(endTime(), (now - started) / 1000);
  draw();
  if (time >= endTime()) {
    if ($("loop").checked) {
      started = now;
      raf = requestAnimationFrame(tick);
    } else pause();
  } else raf = requestAnimationFrame(tick);
}

function play() {
  cancelAnimationFrame(raf);
  time = 0;
  playing = true;
  started = performance.now();
  $("play").innerHTML = "Ⅱ <span>暂停</span>";
  $("play").setAttribute("aria-label", "暂停动效");
  $("play-state").textContent = "播放中";
  draw();
  raf = requestAnimationFrame(tick);
}

$("play").addEventListener("click", () => (playing ? pause() : play()));
$("timeline").addEventListener("input", (e) => {
  time = Number(e.target.value);
  pause();
  draw();
});

function previewChange() {
  updateControls();
  if (reduced.matches) {
    pause();
    time = settings.duration;
    draw();
  } else play();
}

for (const id of ["duration", "rise", "blur", "tilt"]) {
  $(id).addEventListener("input", (e) => {
    const n = Number(e.target.value);
    if (id === "duration") {
      settings.duration = n;
      settings.focusDuration = (n * 27) / 43;
      settings.fadeDuration = (n * 7) / 43;
    } else if (id === "tilt") {
      settings.tiltX = n;
      settings.tiltY = (-5 * n) / 7;
      settings.tiltZ = (0.6 * n) / 7;
    } else settings[id] = n;
    previewChange();
  });
}
$("reset").addEventListener("click", () => {
  Object.assign(settings, defaults);
  previewChange();
});
$("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(snippet());
    $("status").textContent = "已复制当前参数的 Remotion 代码。";
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents($("code"));
    selection.removeAllRanges();
    selection.addRange(range);
    $("status").textContent = "代码已选中，请按 ⌘C / Ctrl+C 复制。";
  }
});

let imageRequest = 0;
$("image-input").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const request = ++imageRequest;
  if (
    !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
      file.type,
    ) ||
    file.size > 20 * 1024 * 1024
  ) {
    $("status").textContent =
      "请选择 20 MB 以内的 JPG、PNG、WebP 或 AVIF 图片。";
    event.target.value = "";
    return;
  }
  const nextUrl = URL.createObjectURL(file);
  const candidate = new Image();
  candidate.src = nextUrl;
  try {
    await candidate.decode();
    if (request !== imageRequest) {
      URL.revokeObjectURL(nextUrl);
      return;
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = nextUrl;
    $("photo").src = nextUrl;
    $("photo").hidden = false;
    $("sample-card").hidden = true;
    $("sample").hidden = false;
    $("status").textContent = "已载入照片，仅保留在当前浏览器页面。";
    previewChange();
  } catch {
    URL.revokeObjectURL(nextUrl);
    $("status").textContent = "图片无法读取，请换一张重试。";
  }
  event.target.value = "";
});
$("sample").addEventListener("click", () => {
  imageRequest++;
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = undefined;
  $("photo").removeAttribute("src");
  $("photo").hidden = true;
  $("sample-card").hidden = false;
  $("sample").hidden = true;
  $("status").textContent = "";
  previewChange();
});

new ResizeObserver(() => {
  const scale = Math.min(
    1,
    ($("stage").clientWidth - 24) / 720,
    $("stage").clientHeight / 480,
  );
  $("scene").style.setProperty("--scene-scale", String(scale));
}).observe($("stage"));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});
reduced.addEventListener("change", () => {
  if (reduced.matches) {
    pause();
    time = settings.duration;
    draw();
  }
});

// Optional WebMCP integration. No image/file information is exposed.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  try {
    Promise.resolve(
      document.modelContext.registerTool(
        {
          name: "seek_floatframe",
          title: "查看浮映的指定时刻",
          description:
            "Pause the visible preview and seek to a time in seconds; does not upload or publish anything.",
          inputSchema: {
            type: "object",
            properties: { time: { type: "number", minimum: 0, maximum: 3.85 } },
            required: ["time"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            if (
              !input ||
              Object.keys(input).some((k) => k !== "time") ||
              typeof input.time !== "number" ||
              !Number.isFinite(input.time) ||
              input.time < 0 ||
              input.time > endTime()
            )
              throw new Error(`time must be between 0 and ${endTime()}`);
            time = input.time;
            pause();
            draw();
            return { time, ...sampleMotion(time, settings) };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
  } catch {
    /* Preview remains usable in browsers with experimental APIs. */
  }
  window.addEventListener("pagehide", () => lifecycle.abort(), { once: true });
}
updateControls();
draw();
if (!reduced.matches) play();
