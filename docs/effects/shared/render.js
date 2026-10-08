import { arcMotion, orbitMotion, cardsMotion, definitions } from "./motion.js";
const esc = (v) =>
  String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
const yellow = "#ffe16b",
  ink = "#171d1b";
const text = (s, x, y, size, fill = "#f9f3e9", extra = "") =>
  `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" ${extra}>${esc(s)}</text>`;
const center = 'text-anchor="middle" font-weight="800"';
function arc(title, time, top = 205, settings = {}) {
  const chars = Array.from(title).slice(0, 6),
    size = chars.length > 4 ? 64 : 78,
    spacing = size + 2;
  return arcMotion(time, chars.length, settings)
    .map((m, i) => {
      const x = 360 + (i - (chars.length - 1) / 2) * spacing;
      const tr = `translate(${x} ${top + m.y}) rotate(${m.rotate}) scale(${m.scale})`;
      return `<g transform="${tr}" opacity="${m.opacity}">${text(chars[i], 0, 6, size, "#554135", center)}${text(chars[i], 0, 0, size, yellow, center + ' stroke="#352c26" stroke-width="1" paint-order="stroke"')}</g>`;
    })
    .join("");
}
function avatar() {
  return '<rect x="160" y="395" width="402" height="402" fill="#e7c8a3"/><circle cx="360" cy="561" r="88" fill="#b77d58"/><path d="M263 555Q240 443 358 459Q465 434 465 563L425 519Q351 555 290 512Z" fill="#343e37"/><path d="M191 820Q188 655 360 657Q533 655 533 820" fill="#596e56"/><path d="M333 651L360 686L387 651" fill="#e5b68c"/>';
}
/** Generates only escaped SVG from local options; no reference media or audio. */
export function renderEffect(id, time, options = {}) {
  if (!definitions[id]) throw new RangeError("Unknown effect");
  if (!Number.isFinite(time)) throw new TypeError("time must be finite");
  const title = String(
    options.title ||
      (id === "arc-pop-title"
        ? "重点来了"
        : id === "spotlight-orbit"
          ? "请记住"
          : "让观点，一步步讲清楚"),
  ).slice(0, id === "progressive-cards" ? 16 : 6);
  let content = "";
  if (id === "arc-pop-title")
    content = `${arc(title, time, 215, options)}
    <rect x="192" y="336" width="336" height="55" rx="28" fill="#ffffff12"/>${text("开场 / 强调 / 提醒", 360, 371, 24, "#d8ddcc", center)}
    <rect x="168" y="507" width="384" height="420" rx="34" fill="#c9d6bb"/>
    ${text("Aa", 360, 729, 130, ink, center)}${text("把重点说清楚", 360, 843, 34, ink, center)}
    ${text("逐字错峰 · 轻弹归位", 360, 1050, 32, yellow, center)}`;
  if (id === "spotlight-orbit") {
    const m = orbitMotion(time, options);
    content = `${arc(title, time, 237)}<circle cx="360" cy="596" r="219" fill="none" stroke="#eaf0db" stroke-opacity=".7" stroke-width="3" stroke-dasharray="6 7" transform="rotate(${m.rotation} 360 596)"/>
    <g transform="translate(360 596) scale(${m.scale}) translate(-360 -596)" clip-path="url(#portrait-circle)">${avatar()}</g>
    ${text("把视线留给核心观点", 360, 893, 28, "#b3bcae", center)}${text("请记住这一点", 360, 1040, 45, yellow, center)}`;
  }
  if (id === "progressive-cards") {
    const titles =
      Array.isArray(options.items) && options.items.length === 3
        ? options.items
        : ["先说结论", "再给具体例子", "最后明确下一步"];
    const subtitles = [
      "建立这一段的重点",
      "让抽象观点变得可感知",
      "给观众一个清晰的行动",
    ];
    content =
      text(title, 360, 157, 43, yellow, center) +
      text("三个层次 · 一个清晰观点", 44, 221, 22, "#b3bcae");
    content += cardsMotion(time, options)
      .map(
        (m, i) =>
          `<g transform="translate(${44 + m.x} ${276 + i * 177})" opacity="${m.opacity}"><rect width="632" height="150" rx="23" fill="${m.active ? yellow : "#f9f3e9"}"/>${text("0" + (i + 1), 24, 85, 36, "#92988c", 'font-weight="700"')}${text(String(titles[i]).slice(0, 13), 100, 62, 33, ink, 'font-weight="800"')}${text(subtitles[i], 100, 105, 20, "#62695e")}</g>`,
      )
      .join("");
    content +=
      text("一次只强调一件事", 360, 991, 38, yellow, center) +
      text("清楚，比堆满更重要。", 360, 1056, 25, "#bec7b6", center);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1280" width="720" height="1280" role="img" aria-label="${esc(definitions[id].name)}" style="font-family:'PingFang SC','Microsoft YaHei',sans-serif"><defs><radialGradient id="back"><stop stop-color="#344438"/><stop offset="1" stop-color="#131a16"/></radialGradient><clipPath id="portrait-circle"><circle cx="360" cy="596" r="201"/></clipPath></defs><rect width="720" height="1280" fill="url(#back)"/>${content}<path d="M44 1164H676" stroke="#ffffff24"/>${text("阿伟的镜头库", 44, 1212, 20, "#97a68f")}${text("安全示例 / 9:16", 676, 1212, 18, "#97a68f", 'text-anchor="end"')}</svg>`;
}
