/** Rotate a point around a center by axial tilt (visual-only). */
export function applyAxialTilt(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  axialTiltRadians: number,
): { x: number; y: number } {
  if (!axialTiltRadians) {
    return { x, y };
  }

  const dx = x - centerX;
  const dy = y - centerY;
  const cos = Math.cos(axialTiltRadians);
  const sin = Math.sin(axialTiltRadians);

  return {
    x: centerX + dx * cos - dy * sin,
    y: centerY + dx * sin + dy * cos,
  };
}
