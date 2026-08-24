/** Decorative linen, a quiet sun from the top-left, and grass. Purely visual. */
export function TendSceneBackground() {
  return (
    <div className="tend-scene" aria-hidden="true">
      <div className="tend-scene__linen" />
      <div className="tend-scene__sun" />
      <svg
        className="tend-scene__sunrays"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMinYMin slice"
        focusable="false"
        role="img"
        aria-hidden="true"
      >
        <title>Decorative sunrays</title>
        <g fill="currentColor">
          <path d="M0 0 L54 6 L48 12 Z" opacity="0.18" />
          <path d="M0 0 L64 18 L56 22 Z" opacity="0.14" />
          <path d="M0 0 L72 34 L62 36 Z" opacity="0.11" />
          <path d="M0 0 L58 48 L50 46 Z" opacity="0.13" />
          <path d="M0 0 L38 58 L34 50 Z" opacity="0.1" />
          <path d="M0 0 L22 62 L20 52 Z" opacity="0.12" />
        </g>
      </svg>
      <svg
        className="tend-scene__grass"
        viewBox="0 0 1200 160"
        preserveAspectRatio="xMidYMax meet"
        focusable="false"
        role="img"
        aria-hidden="true"
      >
        <title>Decorative grass</title>
        <path
          d="M86 160c8-46 4-92-18-148M104 160c2-40 14-86 42-128M118 160c-6-38-22-78-12-132M312 160c10-42 2-96-22-142M328 160c4-48 18-90 48-126M538 160c-8-50 6-98 28-140M556 160c8-44-6-88-28-132M572 160c2-52 16-94 44-130M864 160c-10-46 4-94 26-138M882 160c6-40-8-86-24-128M1088 160c8-48-4-96-26-140M1106 160c4-42 16-88 40-124M1120 160c-6-38-18-82-8-126"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
