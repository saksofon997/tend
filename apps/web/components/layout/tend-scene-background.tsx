import { SCENE_GRASS_BLADES, SCENE_SUN, SCENE_SUN_RAYS, SCENE_VIEWBOX } from "@tend/domain";

const SUN_GLOW_ID = "tend-scene-sun-glow";

/** Decorative linen, one-sided sun, and grass. Purely visual — ignore for accessibility. */
export function TendSceneBackground() {
  return (
    <div className="tend-scene" aria-hidden="true">
      <div className="tend-scene__linen" />
      <svg
        className="tend-scene__art"
        viewBox={SCENE_VIEWBOX}
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
        role="img"
        aria-hidden="true"
      >
        <title>Decorative sun and grass</title>
        <defs>
          <radialGradient
            id={SUN_GLOW_ID}
            cx={SCENE_SUN.originX}
            cy={SCENE_SUN.originY + 40}
            r={SCENE_SUN.glowRadius}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="var(--tend-sun)" stopOpacity="1" />
            <stop offset="42%" stopColor="var(--tend-sun-soft)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--tend-sun-soft)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1200" height="800" fill={`url(#${SUN_GLOW_ID})`} />
        <circle
          cx={SCENE_SUN.originX + 18}
          cy={SCENE_SUN.originY + 48}
          r={SCENE_SUN.coreRadius}
          fill="var(--tend-sun)"
          opacity="0.35"
        />
        <g fill="var(--tend-sun-ray)">
          {SCENE_SUN_RAYS.map((ray) => (
            <path key={ray.d} d={ray.d} opacity={ray.opacity} />
          ))}
        </g>
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          {SCENE_GRASS_BLADES.map((blade) => (
            <path
              key={blade.d}
              d={blade.d}
              strokeWidth={blade.strokeWidth}
              opacity={blade.opacity}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
