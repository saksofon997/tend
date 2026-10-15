export const SCENE_ART_LANDSCAPE_SRC = "/scene/tend-scene-landscape.webp";
export const SCENE_ART_PORTRAIT_SRC = "/scene/tend-scene-portrait.webp";

/** Parchment landscape on wide screens, portrait when the viewport is taller. Purely visual. */
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
