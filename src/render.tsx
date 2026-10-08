import React from "react";
import { Composition, registerRoot } from "remotion";
import { ArcPopTitle } from "./effects/arc-pop-title";
import { SpotlightOrbit } from "./effects/spotlight-orbit";
import { ProgressiveCards } from "./effects/progressive-cards";
const Root = () => (
  <>
    <Composition
      id="arc-pop-title"
      component={ArcPopTitle}
      durationInFrames={81}
      fps={30}
      width={720}
      height={1280}
    />
    <Composition
      id="spotlight-orbit"
      component={SpotlightOrbit}
      durationInFrames={63}
      fps={30}
      width={720}
      height={1280}
    />
    <Composition
      id="progressive-cards"
      component={ProgressiveCards}
      durationInFrames={202}
      fps={30}
      width={720}
      height={1280}
    />
  </>
);
registerRoot(Root);
