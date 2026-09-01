/** Target Earth width as a fraction of screen width (~13% smaller than the prior 0.52 value). */
export const EARTH_DIAMETER_SCREEN_RATIO = 0.45;

/** Vertical anchor within the usable screen (0 = top, 1 = bottom). */
export const EARTH_VERTICAL_ANCHOR = 0.28;

/** Estimated HUD height for Energy plus the visible upgrade-card window. */
const HUD_CONTENT_HEIGHT = 248;

const LABEL_SPACE = 28;
const EARTH_TO_HUD_GAP = 6;

export interface GameLayout {
  centerX: number;
  centerY: number;
  earthRadius: number;
  earthDiameter: number;
  labelTop: number;
  hudTop: number;
}

export function computeGameLayout(
  width: number,
  height: number,
  topInset: number,
  bottomInset: number,
  sizeScale = 1,
): GameLayout {
  const usableHeight = height - topInset - bottomInset;
  const centerX = width / 2;
  const clampedScale = Math.max(0.5, Math.min(sizeScale, 1.45));

  const spaceBelowAnchor =
    usableHeight * (1 - EARTH_VERTICAL_ANCHOR) - EARTH_TO_HUD_GAP - HUD_CONTENT_HEIGHT;
  const maxRadiusFromHeight = Math.max(0, spaceBelowAnchor);
  const maxRadiusFromWidth = (width * EARTH_DIAMETER_SCREEN_RATIO * clampedScale) / 2;
  const earthRadius = Math.min(maxRadiusFromWidth, maxRadiusFromHeight);
  const earthDiameter = earthRadius * 2;

  const centerY = topInset + usableHeight * EARTH_VERTICAL_ANCHOR;
  const labelTop = Math.max(topInset + 4, centerY - earthRadius - LABEL_SPACE);
  const hudTop = centerY + earthRadius + EARTH_TO_HUD_GAP;

  return {
    centerX,
    centerY,
    earthRadius,
    earthDiameter,
    labelTop,
    hudTop,
  };
}

/** Layout verification helper for common iPhone sizes. */
export function estimateHudBottom(hudTop: number, bottomInset: number): number {
  return hudTop + HUD_CONTENT_HEIGHT + bottomInset;
}
