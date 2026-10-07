import React from "react";
import { CanvasImage, useCurrentFrame, useVideoConfig } from "remotion";
import { motionStyle } from "../docs/lib/motion.js";

export type FloatFrameSettings = {
  duration?: number;
  focusDuration?: number;
  fadeDuration?: number;
  rise?: number;
  blur?: number;
  tiltX?: number;
  tiltY?: number;
  tiltZ?: number;
  startScale?: number;
  perspective?: number;
};
export type FloatFrameProps = {
  src: string;
  settings?: FloatFrameSettings;
  style?: React.CSSProperties;
};

/** Position/size via style. Animation uses the local Sequence frame, never CSS timers. */
export const FloatFrame: React.FC<FloatFrameProps> = ({
  src,
  settings,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: "relative",
        overflow: "visible",
        ...style,
        ...motionStyle(frame / fps, settings),
      }}
    >
      <CanvasImage
        src={src}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
};
