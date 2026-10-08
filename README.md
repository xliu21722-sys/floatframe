# 阿伟的镜头库

可交互、可暂停、可复用的 Remotion 镜头收藏。网站名称为「阿伟的镜头库」，仓库与网址仍沿用 `floatframe`，旧链接保持有效。

新增三个安全示例：

| 镜头         | 用途               | 在线预览                                                                          |
| ------------ | ------------------ | --------------------------------------------------------------------------------- |
| 弧形逐字弹入 | 开场标题、重点提示 | [交互预览](https://xliu21722-sys.github.io/floatframe/effects/arc-pop-title/)     |
| 圆形聚焦旋环 | 观点转折、圆形聚焦 | [交互预览](https://xliu21722-sys.github.io/floatframe/effects/spotlight-orbit/)   |
| 递进高亮卡片 | 分点讲解、步骤提示 | [交互预览](https://xliu21722-sys.github.io/floatframe/effects/progressive-cards/) |

## 新增镜头接入

保留相对路径复制 `src/effects/` 与 `docs/effects/shared/` 到你的 Remotion 工程。三个组件分别导出 `ArcPopTitle`、`SpotlightOrbit`、`ProgressiveCards`。它们共享纯计算和 SVG 渲染，因此网页与视频的时序一致。原始画布是 720×1280；可通过容器等比缩放。

```tsx
import { ArcPopTitle } from "./effects/arc-pop-title";

<ArcPopTitle settings={{ title: "重点来了", stagger: 1.7 / 30 }} />;
```

`SpotlightOrbit` 支持 `title` 和 `ringSpeed`（度/秒）；`ProgressiveCards` 支持 `title`、三个字符串组成的 `items` 和 `distance`（像素）。仅入场物体和时间轴可复用，公开示例刻意使用原创抽象图形代替原片人物。标题最多 6 字，卡片标题最多 13 字，以保留安全边距。

预览视频和海报位于每个 `docs/effects/<id>/` 中。`src/render.tsx` 提供三个可独立渲染的 Composition；需在有 Remotion CLI 的工程中运行。网页没有构建依赖；`node scripts/create-effect-pages.mjs` 可重新生成三页的统一外壳。

## 原有镜头：浮映 · FloatFrame

一张照片从轻微虚化中向上浮入，带着克制的透视倾斜，最后清晰停稳。
来自个人介绍视频的照片入场动效，整理为 **Remotion 组件 + 可交互的静态网页**。

## 本地预览

需要 Node.js 20 或更新版本。静态演示没有构建步骤，也不需要安装依赖：

```sh
npm run dev
```

打开 `http://127.0.0.1:4173`。支持重播 / 暂停、时间轴拖动、循环、时长 / 上浮 / 虚化 / 透视调节，以及复制当前参数代码。
选择的照片仅通过浏览器 Object URL 在本机预览，不上传、不写入仓库、不持久存储。刷新后恢复排版示例卡片。

## 在 Remotion 中使用

复制 `src/FloatFrame.tsx` 和 `docs/lib/motion.js` 到你工程的同一目录，把组件里的 import 改为 `./motion.js`。
组件使用 React 与 Remotion；本仓库锁定的验证版本为 React 19.2.3 / Remotion 4.0.533。

```tsx
import { Sequence, staticFile, useVideoConfig } from "remotion";
import { FloatFrame } from "./FloatFrame";

export const PortraitScene = () => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={4 * fps} durationInFrames={6 * fps} premountFor={fps}>
      <FloatFrame
        src={staticFile("photo.jpg")}
        style={{
          position: "absolute",
          left: 136,
          top: 90,
          width: 833,
          height: 885,
        }}
      />
    </Sequence>
  );
};
```

图片放入 Remotion 工程的 `public/`。组件使用 `objectFit: contain` 保持整张照片可见；外层画布也应为上浮和透视预留空间。组件不添加文字遮罩。
本库按秒定义时间，Remotion 通过 `frame / fps` 驱动，因此改变视频帧率不会改变动效的实际时长。

### 原版参数

| 参数                  | 默认值          | 说明                 |
| --------------------- | --------------- | -------------------- |
| duration              | 43 / 30 秒      | 上浮、缩放与透视归位 |
| focusDuration         | 27 / 30 秒      | 虚化归零             |
| fadeDuration          | 7 / 30 秒       | 透明度线性淡入       |
| rise                  | 90 px           | 初始向下位移         |
| blur                  | 12 px           | 初始虚化             |
| tiltX / tiltY / tiltZ | 7 / -5 / 0.6 度 | 初始三轴倾斜         |
| startScale            | 0.9             | 初始比例             |
| perspective           | 1800 px         | 透视距离             |

缓动曲线为 `cubic-bezier(0.16, 1, 0.3, 1)`。网页与组件复用 `docs/lib/motion.js`，不会出现两套参数各自漂移。
网页调整时长会同比例调整聚焦和淡入时长；组件允许分别配置。
网页尊重 `prefers-reduced-motion`：减少动态效果时不自动播放，仍可手动重播。

## 检查

```sh
npm test
npm ci
npm run typecheck
```

## 发布到 GitHub Pages

推送整个仓库到 `main`，在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
仓库内工作流会测试动效、打包 `docs/` 并发布静态网站。首次启用 Pages 后可手动运行 `Deploy FloatFrame demo`。
网站通常位于 `https://<你的用户名>.github.io/floatframe/`，实际地址以工作流产出为准。
公开仓库可以使用 GitHub Pages；私有仓库能否启用取决于账户计划，且网站访问权限需单独确认。

仓库仅包含通用动效代码和排版示例，不包含个人照片、原始视频、联系方式或凭据。
未附加开源许可证；公开仓库不等于授予开源使用许可。Remotion 的使用仍须遵守其自身许可。
