# 浮映 · FloatFrame

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
