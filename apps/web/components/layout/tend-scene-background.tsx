/** Decorative linen, sun, and grass. Purely visual — ignore for accessibility. */
export function TendSceneBackground() {
  return (
    <div className="tend-scene" aria-hidden="true">
      <div className="tend-scene__linen" />
      <div className="tend-scene__sun" />
      <svg
        className="tend-scene__grass"
        viewBox="0 0 1200 160"
        preserveAspectRatio="xMidYMax meet"
        focusable="false"
        role="img"
        aria-hidden="true"
      >
        <title>Decorative grass</title>
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M86 160c8-46 4-92-18-148" strokeWidth="2.2" />
          <path d="M104 160c2-40 14-86 42-128" strokeWidth="1.8" />
          <path d="M118 160c-6-38-22-78-12-132" strokeWidth="1.6" />
          <path d="M312 160c10-42 2-96-22-142" strokeWidth="2" />
          <path d="M328 160c4-48 18-90 48-126" strokeWidth="1.7" />
          <path d="M538 160c-8-50 6-98 28-140" strokeWidth="2.1" />
          <path d="M556 160c8-44-6-88-28-132" strokeWidth="1.6" />
          <path d="M572 160c2-52 16-94 44-130" strokeWidth="1.8" />
          <path d="M864 160c-10-46 4-94 26-138" strokeWidth="2" />
          <path d="M882 160c6-40-8-86-24-128" strokeWidth="1.7" />
          <path d="M1088 160c8-48-4-96-26-140" strokeWidth="2.2" />
          <path d="M1106 160c4-42 16-88 40-124" strokeWidth="1.6" />
          <path d="M1120 160c-6-38-18-82-8-126" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}
