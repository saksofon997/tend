export const SCENE_ART_LANDSCAPE_SRC = "/scene/tend-scene-landscape.webp";
export const SCENE_ART_PORTRAIT_SRC = "/scene/tend-scene-portrait.webp";

/** Illustrated meadow scene. Landscape on wide screens, portrait on tall ones. Purely visual. */
export function TendSceneBackground() {
  return (
    <div className="tend-scene" aria-hidden="true">
      <picture>
        <source media="(orientation: portrait)" srcSet={SCENE_ART_PORTRAIT_SRC} />
        <img
          alt=""
          className="tend-scene__art"
          decoding="async"
          draggable={false}
          src={SCENE_ART_LANDSCAPE_SRC}
        />
      </picture>
    </div>
  );
}
