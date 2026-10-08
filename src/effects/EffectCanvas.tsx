import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { renderEffect } from "../../docs/effects/shared/render.js";
export type EffectOptions = {
  title?: string;
  stagger?: number;
  ringSpeed?: number;
  distance?: number;
  items?: string[];
};
export type EffectProps = {
  settings?: EffectOptions;
  style?: React.CSSProperties;
};
export const EffectCanvas: React.FC<EffectProps & { id: string }> = ({
  id,
  settings = {},
  style,
}) => {
  const frame = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <div
      style={{ width: "100%", height: "100%", ...style }}
      dangerouslySetInnerHTML={{
        __html: renderEffect(id, frame / fps, settings).replace(
          'width="720" height="1280" role=',
          'width="100%" height="100%" role=',
        ),
      }}
    />
  );
};
