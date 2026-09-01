import { useCallback, useEffect, useState } from 'react';
import {
  Canvas,
  Circle,
  LinearGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getPlanetVisualConfig } from '../config/celestial';
import { getPlanetGameConfig } from '../config/planets';
import { useGameSession } from '../context/GameSessionContext';
import { useFeedback } from '../feedback';
import { getPlanetPassiveEnergyPerSecond } from '../game/energyLogic';
import { getFrontierPlanetId } from '../game/frontierPlanet';
import { isPlanetUnlocked } from '../game/planetProgression';
import { useSolarSystemOrbit } from '../hooks/useSolarSystemOrbit';
import { formatNumber } from '../utils/formatNumber';
import { OrbitLine } from '../rendering/OrbitLine';
import {
  PlaceholderPlanetDot,
  PlaceholderSun,
} from '../rendering/placeholders/SolarSystemBodies';
import { getStarColor } from '../rendering/stars';
import { getVisibleStars } from '../visual/effects';
import { PlanetInfoPanel } from '../ui/PlanetInfoPanel';
import { SolarSystemMenuBar } from '../ui/SolarSystemMenuBar';
import { SolarSystemSceneTransition } from '../ui/transitions/SolarSystemSceneTransition';
import {
  SOLAR_EARTH_ORBIT_RX_FACTOR,
  SOLAR_EARTH_ORBIT_RY_FACTOR,
  SOLAR_JUPITER_ORBIT_RX_FACTOR,
  SOLAR_JUPITER_ORBIT_RY_FACTOR,
  SOLAR_MARS_ORBIT_RX_FACTOR,
  SOLAR_MARS_ORBIT_RY_FACTOR,
  SOLAR_MERCURY_ORBIT_RX_FACTOR,
  SOLAR_MERCURY_ORBIT_RY_FACTOR,
  SOLAR_NEPTUNE_ORBIT_RX_FACTOR,
  SOLAR_NEPTUNE_ORBIT_RY_FACTOR,
  SOLAR_SATURN_ORBIT_RX_FACTOR,
  SOLAR_SATURN_ORBIT_RY_FACTOR,
  SOLAR_URANUS_ORBIT_RX_FACTOR,
  SOLAR_URANUS_ORBIT_RY_FACTOR,
  SOLAR_VENUS_ORBIT_RX_FACTOR,
  SOLAR_VENUS_ORBIT_RY_FACTOR,
  getSolarOrbitFitScale,
} from '../visual/solarSystemOrbit';

const SPACE_COLORS = ['#06061a', '#0c0824', '#170a2e'] as const;

type SelectedBody =
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune';

export function SolarSystemScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {
    state,
    enterPlanet,
    goToEarth,
    navTransition,
    solarSystemSelectedPlanet,
    solarSystemOriginPlanet,
    setSolarSystemSelectedPlanet,
  } = useGameSession();
  const { feedback } = useFeedback();
  const [selectedBody, setSelectedBody] = useState<SelectedBody | null>(null);
  const frontierPlanetId = getFrontierPlanetId(state);
  const stars = getVisibleStars(state.settings.reduceEffects);

  const selectBody = useCallback(
    (body: SelectedBody) => {
      setSelectedBody(body);
      setSolarSystemSelectedPlanet(body);
    },
    [setSolarSystemSelectedPlanet],
  );

  const isEnteringPlanet = useCallback(
    (body: SelectedBody) =>
      navTransition.phase === 'out' &&
      navTransition.kind === 'solar-to-planet' &&
      navTransition.focusPlanetId === body,
    [navTransition],
  );

  const bodyDotProps = useCallback(
    (body: SelectedBody) => ({
      selected: selectedBody === body,
      frontier: frontierPlanetId === body,
      dimmed: selectedBody !== null && selectedBody !== body,
      enterEmphasis: isEnteringPlanet(body),
    }),
    [frontierPlanetId, isEnteringPlanet, selectedBody],
  );

  const centerX = width / 2;
  const centerY = height * 0.4;
  const orbitFitScale = getSolarOrbitFitScale(width, height, centerY, {
    horizontalPadding: 20,
    topPadding: insets.top + 12,
    bottomReserve: 190 + insets.bottom,
  });
  const scaledOrbit = (factor: number) => width * factor * orbitFitScale;
  const mercuryOrbitRadiusX = scaledOrbit(SOLAR_MERCURY_ORBIT_RX_FACTOR);
  const mercuryOrbitRadiusY = scaledOrbit(SOLAR_MERCURY_ORBIT_RY_FACTOR);
  const venusOrbitRadiusX = scaledOrbit(SOLAR_VENUS_ORBIT_RX_FACTOR);
  const venusOrbitRadiusY = scaledOrbit(SOLAR_VENUS_ORBIT_RY_FACTOR);
  const earthOrbitRadiusX = scaledOrbit(SOLAR_EARTH_ORBIT_RX_FACTOR);
  const earthOrbitRadiusY = scaledOrbit(SOLAR_EARTH_ORBIT_RY_FACTOR);
  const marsOrbitRadiusX = scaledOrbit(SOLAR_MARS_ORBIT_RX_FACTOR);
  const marsOrbitRadiusY = scaledOrbit(SOLAR_MARS_ORBIT_RY_FACTOR);
  const jupiterOrbitRadiusX = scaledOrbit(SOLAR_JUPITER_ORBIT_RX_FACTOR);
  const jupiterOrbitRadiusY = scaledOrbit(SOLAR_JUPITER_ORBIT_RY_FACTOR);
  const saturnOrbitRadiusX = scaledOrbit(SOLAR_SATURN_ORBIT_RX_FACTOR);
  const saturnOrbitRadiusY = scaledOrbit(SOLAR_SATURN_ORBIT_RY_FACTOR);
  const uranusOrbitRadiusX = scaledOrbit(SOLAR_URANUS_ORBIT_RX_FACTOR);
  const uranusOrbitRadiusY = scaledOrbit(SOLAR_URANUS_ORBIT_RY_FACTOR);
  const neptuneOrbitRadiusX = scaledOrbit(SOLAR_NEPTUNE_ORBIT_RX_FACTOR);
  const neptuneOrbitRadiusY = scaledOrbit(SOLAR_NEPTUNE_ORBIT_RY_FACTOR);
  const sunRadius = width * 0.048;
  const mercuryRadius = width * 0.015;
  const venusRadius = width * 0.021;
  const earthRadius = width * 0.023;
  const marsRadius = width * 0.02;
  const jupiterVisual = getPlanetVisualConfig('jupiter');
  const saturnVisual = getPlanetVisualConfig('saturn');
  const uranusVisual = getPlanetVisualConfig('uranus');
  const neptuneVisual = getPlanetVisualConfig('neptune');
  const jupiterRadius = width * 0.023 * (jupiterVisual.solarSystemSizeScale ?? 1.65);
  const saturnRadius = width * 0.023 * (saturnVisual.solarSystemSizeScale ?? 1.45);
  const uranusRadius = width * 0.023 * (uranusVisual.solarSystemSizeScale ?? 1.22);
  const neptuneRadius = width * 0.023 * (neptuneVisual.solarSystemSizeScale ?? 1.2);
  const hitRadius = 28;

  const orbits = useSolarSystemOrbit({
    centerX,
    centerY,
    mercuryOrbitRadiusX,
    mercuryOrbitRadiusY,
    venusOrbitRadiusX,
    venusOrbitRadiusY,
    earthOrbitRadiusX,
    earthOrbitRadiusY,
    marsOrbitRadiusX,
    marsOrbitRadiusY,
    jupiterOrbitRadiusX,
    jupiterOrbitRadiusY,
    saturnOrbitRadiusX,
    saturnOrbitRadiusY,
    uranusOrbitRadiusX,
    uranusOrbitRadiusY,
    neptuneOrbitRadiusX,
    neptuneOrbitRadiusY,
  });

  const marsUnlocked = isPlanetUnlocked(state, 'mars');
  const venusUnlocked = isPlanetUnlocked(state, 'venus');
  const mercuryUnlocked = isPlanetUnlocked(state, 'mercury');
  const jupiterUnlocked = isPlanetUnlocked(state, 'jupiter');
  const saturnUnlocked = isPlanetUnlocked(state, 'saturn');
  const uranusUnlocked = isPlanetUnlocked(state, 'uranus');
  const neptuneUnlocked = isPlanetUnlocked(state, 'neptune');
  const earthPassive = getPlanetPassiveEnergyPerSecond(state, 'earth');
  const marsPassive = marsUnlocked
    ? getPlanetPassiveEnergyPerSecond(state, 'mars')
    : 0;
  const venusPassive = venusUnlocked
    ? getPlanetPassiveEnergyPerSecond(state, 'venus')
    : 0;
  const mercuryPassive = mercuryUnlocked
    ? getPlanetPassiveEnergyPerSecond(state, 'mercury')
    : 0;
  const jupiterPassive = jupiterUnlocked
    ? getPlanetPassiveEnergyPerSecond(state, 'jupiter')
    : 0;
  const saturnPassive = saturnUnlocked
    ? getPlanetPassiveEnergyPerSecond(state, 'saturn')
    : 0;
  const uranusPassive = uranusUnlocked
    ? getPlanetPassiveEnergyPerSecond(state, 'uranus')
    : 0;
  const neptunePassive = neptuneUnlocked
    ? getPlanetPassiveEnergyPerSecond(state, 'neptune')
    : 0;

  useEffect(() => {
    if (solarSystemSelectedPlanet) {
      setSelectedBody(solarSystemSelectedPlanet);
    }
  }, [solarSystemSelectedPlanet]);

  const originPlanetName = getPlanetGameConfig(solarSystemOriginPlanet).name;

  const panelProps = (body: SelectedBody) => ({
    selected: selectedBody === body,
    frontier: frontierPlanetId === body,
  });

  const renderPanel = () => {
    if (selectedBody === 'mercury') {
      if (!mercuryUnlocked) {
        return (
          <PlanetInfoPanel
            title="MERCURY"
            subtitle={getPlanetGameConfig('mercury').unlockRequirementLabel ?? 'Locked'}
            locked
            {...panelProps('mercury')}
          />
        );
      }

      return (
        <PlanetInfoPanel
          title="MERCURY"
          subtitle="Unlocked"
          productionLabel="Current Energy Production"
          productionPerSecond={mercuryPassive}
          showEnter
          onEnter={() => enterPlanet('mercury')}
          {...panelProps('mercury')}
        />
      );
    }

    if (selectedBody === 'venus') {
      if (!venusUnlocked) {
        return (
          <PlanetInfoPanel
            title="VENUS"
            subtitle={getPlanetGameConfig('venus').unlockRequirementLabel ?? 'Locked'}
            locked
            {...panelProps('venus')}
          />
        );
      }

      return (
        <PlanetInfoPanel
          title="VENUS"
          subtitle="Unlocked"
          productionLabel="Current Energy Production"
          productionPerSecond={venusPassive}
          showEnter
          onEnter={() => enterPlanet('venus')}
          {...panelProps('venus')}
        />
      );
    }

    if (selectedBody === 'earth') {
      return (
        <PlanetInfoPanel
          title="EARTH"
          productionLabel="Current Energy Production"
          productionPerSecond={earthPassive}
          showEnter
          onEnter={() => enterPlanet('earth')}
          {...panelProps('earth')}
        />
      );
    }

    if (selectedBody === 'mars') {
      if (!marsUnlocked) {
        return (
          <PlanetInfoPanel
            title="MARS"
            subtitle={getPlanetGameConfig('mars').unlockRequirementLabel ?? 'Locked'}
            locked
            {...panelProps('mars')}
          />
        );
      }

      return (
        <PlanetInfoPanel
          title="MARS"
          subtitle="Unlocked"
          productionLabel="Current Energy Production"
          productionPerSecond={marsPassive}
          showEnter
          onEnter={() => enterPlanet('mars')}
          {...panelProps('mars')}
        />
      );
    }

    if (selectedBody === 'jupiter') {
      if (!jupiterUnlocked) {
        return (
          <PlanetInfoPanel
            title="JUPITER"
            subtitle={getPlanetGameConfig('jupiter').unlockRequirementLabel ?? 'Locked'}
            locked
            {...panelProps('jupiter')}
          />
        );
      }

      return (
        <PlanetInfoPanel
          title="JUPITER"
          subtitle="Unlocked"
          productionLabel="Current Energy Production"
          productionPerSecond={jupiterPassive}
          showEnter
          onEnter={() => enterPlanet('jupiter')}
          {...panelProps('jupiter')}
        />
      );
    }

    if (selectedBody === 'saturn') {
      if (!saturnUnlocked) {
        return (
          <PlanetInfoPanel
            title="SATURN"
            subtitle={getPlanetGameConfig('saturn').unlockRequirementLabel ?? 'Locked'}
            locked
            {...panelProps('saturn')}
          />
        );
      }

      return (
        <PlanetInfoPanel
          title="SATURN"
          subtitle="Unlocked"
          productionLabel="Current Energy Production"
          productionPerSecond={saturnPassive}
          showEnter
          onEnter={() => enterPlanet('saturn')}
          {...panelProps('saturn')}
        />
      );
    }

    if (selectedBody === 'uranus') {
      if (!uranusUnlocked) {
        return (
          <PlanetInfoPanel
            title="URANUS"
            subtitle={getPlanetGameConfig('uranus').unlockRequirementLabel ?? 'Locked'}
            locked
            {...panelProps('uranus')}
          />
        );
      }

      return (
        <PlanetInfoPanel
          title="URANUS"
          subtitle="Unlocked"
          productionLabel="Current Energy Production"
          productionPerSecond={uranusPassive}
          showEnter
          onEnter={() => enterPlanet('uranus')}
          {...panelProps('uranus')}
        />
      );
    }

    if (selectedBody === 'neptune') {
      if (!neptuneUnlocked) {
        return (
          <PlanetInfoPanel
            title="NEPTUNE"
            subtitle={getPlanetGameConfig('neptune').unlockRequirementLabel ?? 'Locked'}
            locked
            {...panelProps('neptune')}
          />
        );
      }

      return (
        <PlanetInfoPanel
          title="NEPTUNE"
          subtitle="Unlocked"
          productionLabel="Current Energy Production"
          productionPerSecond={neptunePassive}
          showEnter
          onEnter={() => enterPlanet('neptune')}
          {...panelProps('neptune')}
        />
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <SolarSystemSceneTransition
        map={
          <Canvas style={styles.canvas}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width * 0.15, height)}
            colors={[...SPACE_COLORS]}
          />
        </Rect>

        {stars.map((star, index) => (
          <Circle
            key={index}
            cx={star.x * width}
            cy={star.y * height}
            r={star.radius}
            color={getStarColor(star)}
          />
        ))}

        <OrbitLine
          centerX={centerX}
          centerY={centerY}
          radiusX={mercuryOrbitRadiusX}
          radiusY={mercuryOrbitRadiusY}
          color="rgba(156, 163, 175, 0.1)"
        />
        <OrbitLine
          centerX={centerX}
          centerY={centerY}
          radiusX={venusOrbitRadiusX}
          radiusY={venusOrbitRadiusY}
          color="rgba(251, 191, 36, 0.12)"
        />
        <OrbitLine
          centerX={centerX}
          centerY={centerY}
          radiusX={earthOrbitRadiusX}
          radiusY={earthOrbitRadiusY}
        />
        <OrbitLine
          centerX={centerX}
          centerY={centerY}
          radiusX={marsOrbitRadiusX}
          radiusY={marsOrbitRadiusY}
          color="rgba(248, 113, 113, 0.1)"
        />
        <OrbitLine
          centerX={centerX}
          centerY={centerY}
          radiusX={jupiterOrbitRadiusX}
          radiusY={jupiterOrbitRadiusY}
          color="rgba(251, 146, 60, 0.12)"
        />
        <OrbitLine
          centerX={centerX}
          centerY={centerY}
          radiusX={saturnOrbitRadiusX}
          radiusY={saturnOrbitRadiusY}
          color="rgba(251, 191, 36, 0.14)"
        />
        <OrbitLine
          centerX={centerX}
          centerY={centerY}
          radiusX={uranusOrbitRadiusX}
          radiusY={uranusOrbitRadiusY}
          color="rgba(34, 211, 238, 0.14)"
        />
        <OrbitLine
          centerX={centerX}
          centerY={centerY}
          radiusX={neptuneOrbitRadiusX}
          radiusY={neptuneOrbitRadiusY}
          color="rgba(37, 99, 235, 0.14)"
        />

        <PlaceholderSun x={centerX} y={centerY} radius={sunRadius} />
        <PlaceholderPlanetDot
          config={getPlanetVisualConfig('mercury')}
          x={orbits.mercury.x}
          y={orbits.mercury.y}
          radius={mercuryRadius}
          locked={!mercuryUnlocked}
          {...bodyDotProps('mercury')}
        />
        <PlaceholderPlanetDot
          config={getPlanetVisualConfig('venus')}
          x={orbits.venus.x}
          y={orbits.venus.y}
          radius={venusRadius}
          locked={!venusUnlocked}
          {...bodyDotProps('venus')}
        />
        <PlaceholderPlanetDot
          config={getPlanetVisualConfig('earth')}
          x={orbits.earth.x}
          y={orbits.earth.y}
          radius={earthRadius}
          {...bodyDotProps('earth')}
        />
        <PlaceholderPlanetDot
          config={getPlanetVisualConfig('mars')}
          x={orbits.mars.x}
          y={orbits.mars.y}
          radius={marsRadius}
          locked={!marsUnlocked}
          {...bodyDotProps('mars')}
        />
        <PlaceholderPlanetDot
          config={jupiterVisual}
          x={orbits.jupiter.x}
          y={orbits.jupiter.y}
          radius={jupiterRadius}
          locked={!jupiterUnlocked}
          {...bodyDotProps('jupiter')}
        />
        <PlaceholderPlanetDot
          config={saturnVisual}
          x={orbits.saturn.x}
          y={orbits.saturn.y}
          radius={saturnRadius}
          locked={!saturnUnlocked}
          {...bodyDotProps('saturn')}
        />
        <PlaceholderPlanetDot
          config={uranusVisual}
          x={orbits.uranus.x}
          y={orbits.uranus.y}
          radius={uranusRadius}
          locked={!uranusUnlocked}
          {...bodyDotProps('uranus')}
        />
        <PlaceholderPlanetDot
          config={neptuneVisual}
          x={orbits.neptune.x}
          y={orbits.neptune.y}
          radius={neptuneRadius}
          locked={!neptuneUnlocked}
          {...bodyDotProps('neptune')}
        />
          </Canvas>
        }
        chrome={
          <>
      <Pressable
        style={[
          styles.hitTarget,
          {
            left: orbits.mercury.x - hitRadius,
            top: orbits.mercury.y - hitRadius,
            width: hitRadius * 2,
            height: hitRadius * 2,
          },
        ]}
        onPress={() => selectBody('mercury')}
      />
      <Pressable
        style={[
          styles.hitTarget,
          {
            left: orbits.venus.x - hitRadius,
            top: orbits.venus.y - hitRadius,
            width: hitRadius * 2,
            height: hitRadius * 2,
          },
        ]}
        onPress={() => selectBody('venus')}
      />
      <Pressable
        style={[
          styles.hitTarget,
          {
            left: orbits.earth.x - hitRadius,
            top: orbits.earth.y - hitRadius,
            width: hitRadius * 2,
            height: hitRadius * 2,
          },
        ]}
        onPress={() => selectBody('earth')}
      />
      <Pressable
        style={[
          styles.hitTarget,
          {
            left: orbits.mars.x - hitRadius,
            top: orbits.mars.y - hitRadius,
            width: hitRadius * 2,
            height: hitRadius * 2,
          },
        ]}
        onPress={() => selectBody('mars')}
      />
      <Pressable
        style={[
          styles.hitTarget,
          {
            left: orbits.jupiter.x - hitRadius,
            top: orbits.jupiter.y - hitRadius,
            width: hitRadius * 2,
            height: hitRadius * 2,
          },
        ]}
        onPress={() => selectBody('jupiter')}
      />
      <Pressable
        style={[
          styles.hitTarget,
          {
            left: orbits.saturn.x - hitRadius,
            top: orbits.saturn.y - hitRadius,
            width: hitRadius * 2,
            height: hitRadius * 2,
          },
        ]}
        onPress={() => selectBody('saturn')}
      />
      <Pressable
        style={[
          styles.hitTarget,
          {
            left: orbits.uranus.x - hitRadius,
            top: orbits.uranus.y - hitRadius,
            width: hitRadius * 2,
            height: hitRadius * 2,
          },
        ]}
        onPress={() => selectBody('uranus')}
      />
      <Pressable
        style={[
          styles.hitTarget,
          {
            left: orbits.neptune.x - hitRadius,
            top: orbits.neptune.y - hitRadius,
            width: hitRadius * 2,
            height: hitRadius * 2,
          },
        ]}
        onPress={() => selectBody('neptune')}
      />

      {!mercuryUnlocked && (
        <Text
          style={[
            styles.lockIcon,
            { left: orbits.mercury.x - 8, top: orbits.mercury.y - 26 },
          ]}
        >
          🔒
        </Text>
      )}
      {!venusUnlocked && (
        <Text
          style={[
            styles.lockIcon,
            { left: orbits.venus.x - 8, top: orbits.venus.y - 28 },
          ]}
        >
          🔒
        </Text>
      )}
      {!marsUnlocked && (
        <Text
          style={[
            styles.lockIcon,
            { left: orbits.mars.x - 8, top: orbits.mars.y - 28 },
          ]}
        >
          🔒
        </Text>
      )}
      {!jupiterUnlocked && (
        <Text
          style={[
            styles.lockIcon,
            { left: orbits.jupiter.x - 8, top: orbits.jupiter.y - 30 },
          ]}
        >
          🔒
        </Text>
      )}
      {!saturnUnlocked && (
        <Text
          style={[
            styles.lockIcon,
            { left: orbits.saturn.x - 8, top: orbits.saturn.y - 30 },
          ]}
        >
          🔒
        </Text>
      )}
      {!uranusUnlocked && (
        <Text
          style={[
            styles.lockIcon,
            { left: orbits.uranus.x - 8, top: orbits.uranus.y - 30 },
          ]}
        >
          🔒
        </Text>
      )}
      {!neptuneUnlocked && (
        <Text
          style={[
            styles.lockIcon,
            { left: orbits.neptune.x - 8, top: orbits.neptune.y - 30 },
          ]}
        >
          🔒
        </Text>
      )}

      {frontierPlanetId === 'mercury' && (
        <Text
          style={[
            styles.frontierLabel,
            { left: orbits.mercury.x - 24, top: orbits.mercury.y + mercuryRadius + 8 },
          ]}
        >
          FRONTIER
        </Text>
      )}
      {frontierPlanetId === 'venus' && (
        <Text
          style={[
            styles.frontierLabel,
            { left: orbits.venus.x - 24, top: orbits.venus.y + venusRadius + 8 },
          ]}
        >
          FRONTIER
        </Text>
      )}
      {frontierPlanetId === 'earth' && (
        <Text
          style={[
            styles.frontierLabel,
            { left: orbits.earth.x - 24, top: orbits.earth.y + earthRadius + 8 },
          ]}
        >
          FRONTIER
        </Text>
      )}
      {frontierPlanetId === 'mars' && (
        <Text
          style={[
            styles.frontierLabel,
            { left: orbits.mars.x - 24, top: orbits.mars.y + marsRadius + 8 },
          ]}
        >
          FRONTIER
        </Text>
      )}
      {frontierPlanetId === 'jupiter' && (
        <Text
          style={[
            styles.frontierLabel,
            { left: orbits.jupiter.x - 24, top: orbits.jupiter.y + jupiterRadius + 8 },
          ]}
        >
          FRONTIER
        </Text>
      )}
      {frontierPlanetId === 'saturn' && (
        <Text
          style={[
            styles.frontierLabel,
            { left: orbits.saturn.x - 24, top: orbits.saturn.y + saturnRadius + 8 },
          ]}
        >
          FRONTIER
        </Text>
      )}
      {frontierPlanetId === 'uranus' && (
        <Text
          style={[
            styles.frontierLabel,
            { left: orbits.uranus.x - 24, top: orbits.uranus.y + uranusRadius + 8 },
          ]}
        >
          FRONTIER
        </Text>
      )}
      {frontierPlanetId === 'neptune' && (
        <Text
          style={[
            styles.frontierLabel,
            { left: orbits.neptune.x - 24, top: orbits.neptune.y + neptuneRadius + 8 },
          ]}
        >
          FRONTIER
        </Text>
      )}

      <Pressable
        style={[styles.backButton, { top: insets.top + 8 }]}
        onPress={() => {
          feedback.onUiButton();
          goToEarth();
        }}
      >
        <Text style={styles.backText}>← {originPlanetName}</Text>
      </Pressable>

      <View style={[styles.stardustBadge, { top: insets.top + 8 }]}>
        <Text style={styles.stardustText}>
          {formatNumber(state.stardust)} Stardust
        </Text>
      </View>

      <SolarSystemMenuBar />
          </>
        }
        panel={
          <View style={[styles.panelContainer, { paddingBottom: insets.bottom + 16 }]}>
            {renderPanel()}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPACE_COLORS[0],
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
  hitTarget: {
    position: 'absolute',
    borderRadius: 999,
  },
  lockIcon: {
    position: 'absolute',
    fontSize: 14,
    opacity: 0.9,
  },
  frontierLabel: {
    color: '#fde68a',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    position: 'absolute',
  },
  backButton: {
    left: 12,
    position: 'absolute',
    zIndex: 10,
  },
  backText: {
    color: '#bfdbfe',
    fontSize: 13,
    fontWeight: '600',
  },
  stardustBadge: {
    position: 'absolute',
    right: 12,
    zIndex: 10,
  },
  stardustText: {
    color: '#fde68a',
    fontSize: 14,
    fontWeight: '700',
  },
  panelContainer: {
    left: 0,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
