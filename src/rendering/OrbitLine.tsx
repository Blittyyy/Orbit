import { Group, Path, Skia, vec } from '@shopify/react-native-skia';

interface OrbitLineProps {
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  color?: string;
  /** Visual axial tilt for tilted equatorial orbits (e.g. Uranus). */
  axialTiltRadians?: number;
}

export function OrbitLine({
  centerX,
  centerY,
  radiusX,
  radiusY,
  color = 'rgba(147, 197, 253, 0.12)',
  axialTiltRadians = 0,
}: OrbitLineProps) {
  const path = Skia.Path.Make();
  path.addOval({
    x: centerX - radiusX,
    y: centerY - radiusY,
    width: radiusX * 2,
    height: radiusY * 2,
  });

  const line = (
    <Path
      path={path}
      color={color}
      style="stroke"
      strokeWidth={0.9}
    />
  );

  if (!axialTiltRadians) {
    return line;
  }

  return (
    <Group transform={[{ rotate: axialTiltRadians }]} origin={vec(centerX, centerY)}>
      {line}
    </Group>
  );
}
