export const SCENE_ART_LANDSCAPE_SRC = "/scene/tend-scene-landscape.webp";
export const SCENE_ART_PORTRAIT_SRC = "/scene/tend-scene-portrait.webp";

/**
 * Meadow artwork stays in /public/scene and is not replaced here.
 * Rendering is off while the parchment palette is in place, so a later
 * background can be turned on without restyling cards or type.
 */
export const SCENE_ART_ENABLED = false;

/** Illustrated meadow scene. Landscape on wide screens, portrait on tall ones. Purely visual. */
export function TendSceneBackground() {
  return (
    <div className="tend-scene" aria-hidden="true">
      {SCENE_ART_ENABLED ? (
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
      ) : null}
    </div>
  );
}
