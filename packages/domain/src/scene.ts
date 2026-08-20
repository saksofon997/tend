/** Shared outdoor scene: linen page, one-sided sun, grass. Used by web and mobile. */

export const SCENE_WIDTH = 1200;
export const SCENE_HEIGHT = 800;
export const SCENE_VIEWBOX = `0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`;

/** Late-morning sun sits off the top-left so light travels across the page, not from the center. */
export const SCENE_SUN = {
  originX: 88,
  originY: -36,
  glowRadius: 320,
  coreRadius: 92,
} as const;

export interface SceneSunRay {
  d: string;
  opacity: number;
}

export interface SceneGrassBlade {
  d: string;
  strokeWidth: number;
  opacity: number;
}

const ROUND = (value: number) => Math.round(value * 10) / 10;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function sunRayPath(angleDegrees: number, length: number, halfWidthDegrees: number): string {
  const { originX, originY } = SCENE_SUN;
  const start = toRadians(angleDegrees - halfWidthDegrees);
  const end = toRadians(angleDegrees + halfWidthDegrees);

  return `M${ROUND(originX)} ${ROUND(originY)}L${ROUND(originX + Math.cos(start) * length)} ${ROUND(originY + Math.sin(start) * length)}L${ROUND(originX + Math.cos(end) * length)} ${ROUND(originY + Math.sin(end) * length)}Z`;
}

function grassBladePath(x: number, lean: number, height: number): string {
  const tipX = x + lean;
  const tipY = SCENE_HEIGHT - height;
  const control1X = x + lean * 0.14;
  const control1Y = SCENE_HEIGHT - height * 0.28;
  const control2X = x + lean * 0.68;
  const control2Y = SCENE_HEIGHT - height * 0.7;

  return `M${ROUND(x)} ${SCENE_HEIGHT}C${ROUND(control1X)} ${ROUND(control1Y)} ${ROUND(control2X)} ${ROUND(control2Y)} ${ROUND(tipX)} ${ROUND(tipY)}`;
}

/** Uneven wedges from one origin — not a repeating conic. Opacities stay low so linen still reads. */
const SUN_RAY_SPECS: Array<[angle: number, length: number, halfWidth: number, opacity: number]> = [
  [11, 640, 1.1, 0.028],
  [18, 1080, 2.4, 0.055],
  [24, 760, 1.3, 0.032],
  [31, 1240, 3.1, 0.07],
  [37, 890, 1.7, 0.038],
  [41, 510, 0.9, 0.024],
  [48, 1180, 2.8, 0.06],
  [54, 700, 1.4, 0.03],
  [59, 980, 2.1, 0.048],
  [66, 1320, 3.4, 0.064],
  [72, 820, 1.6, 0.036],
  [79, 560, 1.0, 0.026],
  [86, 1100, 2.6, 0.052],
  [94, 740, 1.5, 0.034],
  [102, 960, 2.2, 0.042],
];

export const SCENE_SUN_RAYS: SceneSunRay[] = SUN_RAY_SPECS.map(
  ([angle, length, halfWidth, opacity]) => ({
    d: sunRayPath(angle, length, halfWidth),
    opacity,
  }),
);

/** Clustered blades along the full width, mixed heights and leans — a quiet verge, not a cartoon lawn. */
const GRASS_SPECS: Array<
  [x: number, lean: number, height: number, strokeWidth: number, opacity: number]
> = [
  [14, -16, 78, 1.3, 0.3],
  [26, 9, 118, 1.9, 0.38],
  [38, -22, 96, 1.5, 0.32],
  [52, 18, 64, 1.2, 0.28],
  [68, -8, 142, 2.1, 0.4],
  [84, 24, 88, 1.4, 0.31],
  [102, -19, 54, 1.1, 0.26],
  [148, 12, 126, 1.8, 0.36],
  [162, -26, 90, 1.5, 0.3],
  [176, 7, 72, 1.2, 0.27],
  [194, -11, 154, 2.2, 0.4],
  [210, 21, 98, 1.6, 0.33],
  [228, -17, 60, 1.2, 0.26],
  [274, 8, 110, 1.7, 0.35],
  [288, -23, 136, 2.0, 0.39],
  [304, 16, 74, 1.3, 0.29],
  [318, -6, 92, 1.4, 0.31],
  [336, 28, 58, 1.1, 0.25],
  [392, -14, 148, 2.1, 0.4],
  [406, 19, 84, 1.5, 0.32],
  [422, -21, 112, 1.8, 0.36],
  [438, 6, 66, 1.2, 0.27],
  [456, -9, 128, 1.9, 0.37],
  [474, 23, 80, 1.4, 0.3],
  [522, -18, 70, 1.3, 0.28],
  [536, 11, 158, 2.2, 0.41],
  [552, -27, 94, 1.6, 0.33],
  [568, 15, 52, 1.1, 0.24],
  [586, -7, 120, 1.8, 0.36],
  [604, 20, 86, 1.4, 0.31],
  [648, -12, 102, 1.6, 0.34],
  [664, 25, 144, 2.1, 0.4],
  [680, -20, 76, 1.3, 0.29],
  [696, 8, 58, 1.2, 0.26],
  [714, -16, 132, 1.9, 0.38],
  [732, 18, 90, 1.5, 0.32],
  [778, -24, 64, 1.2, 0.27],
  [794, 10, 150, 2.2, 0.41],
  [810, -13, 108, 1.7, 0.35],
  [826, 22, 72, 1.3, 0.28],
  [844, -8, 96, 1.5, 0.32],
  [862, 16, 54, 1.1, 0.25],
  [908, -19, 124, 1.9, 0.37],
  [924, 27, 88, 1.4, 0.31],
  [940, -11, 156, 2.3, 0.42],
  [956, 9, 68, 1.2, 0.27],
  [974, -22, 100, 1.6, 0.34],
  [992, 14, 80, 1.3, 0.3],
  [1048, -15, 92, 1.5, 0.32],
  [1064, 21, 138, 2.0, 0.39],
  [1080, -26, 74, 1.3, 0.28],
  [1096, 7, 116, 1.8, 0.36],
  [1114, -10, 56, 1.1, 0.25],
  [1132, 18, 104, 1.6, 0.33],
  [1148, -17, 82, 1.4, 0.3],
  [1166, 12, 148, 2.1, 0.4],
  [1184, -8, 66, 1.2, 0.27],
];

export const SCENE_GRASS_BLADES: SceneGrassBlade[] = GRASS_SPECS.map(
  ([x, lean, height, strokeWidth, opacity]) => ({
    d: grassBladePath(x, lean, height),
    strokeWidth,
    opacity: ROUND(opacity * 0.72),
  }),
);

export function sceneSunOriginIsUpperLeft(): boolean {
  return SCENE_SUN.originX < SCENE_WIDTH * 0.25 && SCENE_SUN.originY < 40;
}
