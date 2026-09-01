import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Canvas,
  Circle,
  LinearGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia';
import { Animated, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getPlanetVisualConfig,
  getSatelliteConfig,
  getStationConfig,
} from '../config/celestial';
import {
  findPlanetUpgradeByVisualType,
  getPlanetGameConfig,
  getPlanetUpgradeTracks,
  type PlanetId,
} from '../config/planets';
import { useGameSession } from '../context/GameSessionContext';
import { getSpaceEventBanner, getEventProductionMultiplier, getSpaceEventDefinition } from '../events';
import { useFeedback, useSpinSoundIntensity } from '../feedback';
import {
  getActivePlanetEnergyPerSecond,
  getCombinedEnergyPerSecond,
} from '../game/energyLogic';
import { isPlanetUnlocked } from '../game/planetProgression';
import {
  getUpgradeLevel,
  isUpgradeUnlocked,
} from '../game/planetUpgrades';
import { getPlanetProgress } from '../game/types';
import { useEarthRotation } from '../hooks/useEarthRotation';
import { usePlanetSpaceEvents } from '../hooks/usePlanetSpaceEvents';
import { usePlanetUnlockCelebration } from '../hooks/usePlanetUnlockCelebration';
import { useMoonOrbit } from '../hooks/useMoonOrbit';
import { useSatelliteOrbit } from '../hooks/useSatelliteOrbit';
import { EarthTouchTarget } from '../rendering/EarthTouchTarget';
import { CometPassVisual } from '../rendering/events/CometPassVisual';
import { MeteorShowerVisual } from '../rendering/events/MeteorShowerVisual';
import { SolarFlareVisual } from '../rendering/events/SolarFlareVisual';
import { MoonView } from '../rendering/MoonView';
import { OrbitLine } from '../rendering/OrbitLine';
import { PlanetView } from '../rendering/PlanetView';
import { SatelliteView } from '../rendering/SatelliteView';
import { StationView } from '../rendering/StationView';
import { PlaceholderPlanetRings, getRingEnhancementTier } from '../rendering/placeholders/PlaceholderPlanetRings';
import { getMoonCosmeticTier } from '../rendering/placeholders/PlaceholderMoon';
import { getStarColor, STARS } from '../rendering/stars';
import { DevPlanetControls } from '../ui/DevPlanetControls';
import { AchievementClaimPop } from '../ui/AchievementClaimPop';
import { DevSpinReadout } from '../ui/DevSpinReadout';
import { DevSpinTestTracker } from '../ui/DevSpinTestTracker';
import { EnergyDisplay } from '../ui/EnergyDisplay';
import { OfflineEarningsModal } from '../ui/OfflineEarningsModal';
import { OrbitUpgradeCard } from '../ui/OrbitUpgradeCard';
import { OrbitUpgradeLockedCard } from '../ui/OrbitUpgradeLockedCard';
import { PlanetLabel } from '../ui/PlanetLabel';
import { RotationSpeedUpgradeCard } from '../ui/RotationSpeedUpgradeCard';
import { SolarSystemButton } from '../ui/SolarSystemButton';
import { SpaceEventBanner } from '../ui/SpaceEventBanner';
import { PlanetUnlockCelebration } from '../ui/celebration/PlanetUnlockCelebration';
import { VisualUnlockMilestone } from '../ui/celebration/VisualUnlockMilestone';
import { PlanetSceneTransition } from '../ui/transitions/PlanetSceneTransition';
import { UnlockToast } from '../ui/UnlockToast';
import { computeGameLayout } from '../ui/layout';
import { applyAxialTilt } from '../visual/axialTilt';
import {
  MOON_ORBIT_RADIUS_X_FACTOR,
  MOON_ORBIT_RADIUS_Y_FACTOR,
} from '../visual/moonOrbit';
import {
  SATELLITE_ORBIT_RADIUS_X_FACTOR,
  SATELLITE_ORBIT_RADIUS_Y_FACTOR,
  STATION_ORBIT_ANGULAR_SPEED,
  STATION_ORBIT_RADIUS_X_FACTOR,
  STATION_ORBIT_RADIUS_Y_FACTOR,
} from '../visual/satelliteOrbit';

const SPACE_COLORS = ['#06061a', '#0c0824', '#170a2e'] as const;
const UNLOCK_TOAST_DURATION_MS = 2200;
/** Matches PlanetUnlockCelebration auto-dismiss timing. */
const PLANET_UNLOCK_CELEBRATION_MS = 2400;

interface PlanetGameScreenProps {
  planetId: PlanetId;
}

export function PlanetGameScreen({ planetId }: PlanetGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const previousUpgradeUnlocked = useRef<Record<string, boolean | null>>({});
  const previousNeptuneUnlocked = useRef<boolean | null>(null);
  const unlockToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlockToastChainTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [justUnlockedIds, setJustUnlockedIds] = useState<Record<string, boolean>>({});
  const [moonUnlockFlash, setMoonUnlockFlash] = useState(0);
  const [satelliteUnlockFlash, setSatelliteUnlockFlash] = useState(0);
  const [stationUnlockFlash, setStationUnlockFlash] = useState(0);
  const [unlockToastMessage, setUnlockToastMessage] = useState<string | null>(null);
  const [visualMilestoneLabel, setVisualMilestoneLabel] = useState<string | null>(null);
  const [devEventRequest, setDevEventRequest] = useState<{
    id: 'comet-pass' | 'solar-flare' | 'meteor-shower';
    nonce: number;
  } | null>(null);
  const moonUnlockFlashAnim = useRef(new Animated.Value(0)).current;
  const satelliteUnlockFlashAnim = useRef(new Animated.Value(0)).current;
  const stationUnlockFlashAnim = useRef(new Animated.Value(0)).current;

  const showUnlockToast = useCallback((message: string) => {
    if (unlockToastTimeoutRef.current) {
      clearTimeout(unlockToastTimeoutRef.current);
    }

    setUnlockToastMessage(message);
    unlockToastTimeoutRef.current = setTimeout(() => {
      setUnlockToastMessage(null);
      unlockToastTimeoutRef.current = null;
    }, UNLOCK_TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (unlockToastTimeoutRef.current) {
        clearTimeout(unlockToastTimeoutRef.current);
      }
      if (unlockToastChainTimeoutRef.current) {
        clearTimeout(unlockToastChainTimeoutRef.current);
      }
    };
  }, []);

  const layout = computeGameLayout(
    width,
    height,
    insets.top,
    insets.bottom,
    getPlanetVisualConfig(planetId).gameplaySizeScale ?? 1,
  );
  const { centerX, centerY, earthRadius, earthDiameter, labelTop, hudTop } = layout;

  const {
    state,
    route,
    isNavigating,
    spinSpeedSource,
    rotationSpeedSource,
    offlineEarnings,
    purchaseRotationSpeedUpgrade,
    purchaseUpgrade,
    dismissOfflineEarnings,
    creditEnergy,
    setPlanetEventEffect,
    devLevelUp,
    devLevelUpSatellite,
    devUnlockMars,
    devUnlockVenus,
    devUnlockMercury,
    devUnlockJupiter,
    devUnlockSaturn,
    devUnlockUranus,
    devUnlockNeptune,
    devReadyPrestige,
    devAddStardust,
    devResetSave,
    devSimulateOfflineHour,
    openSolarSystem,
  } = useGameSession();

  const { feedback, settings } = useFeedback();
  const { celebration, dismissCelebration } = usePlanetUnlockCelebration(state);

  const {
    activeEvent,
    now: eventNow,
    rewardPop,
    setLayoutSize,
    handleCometTap,
    handleMeteorTap,
  } = usePlanetSpaceEvents({
    planetId,
    state,
    route,
    isNavigating,
    celebrationActive: celebration !== null,
    offlineModalOpen: offlineEarnings !== null,
    creditEnergy,
    setPlanetEventEffect,
    onEventReward: feedback.onEventReward,
    devEventRequest,
  });

  const eventProductionMultiplier = activeEvent
    ? getEventProductionMultiplier(getSpaceEventDefinition(activeEvent.definitionId))
    : 1;
  const eventBanner = activeEvent
    ? getSpaceEventBanner(activeEvent, eventNow)
    : null;
  const cometProgress =
    activeEvent?.definitionId === 'comet-pass'
      ? (eventNow - activeEvent.startedAt) /
        Math.max(1, activeEvent.endsAt - activeEvent.startedAt)
      : 0;

  const triggerDevEvent = useCallback(
    (id: 'comet-pass' | 'solar-flare' | 'meteor-shower') => {
      setDevEventRequest({ id, nonce: Date.now() });
    },
    [],
  );

  const celebrationPlanetName = celebration
    ? getPlanetGameConfig(celebration.planetId).name
    : '';

  const handleViewUnlockedPlanetInSolarSystem = useCallback(() => {
    if (!celebration) {
      return;
    }

    const unlockedPlanetId = celebration.planetId;
    dismissCelebration();
    feedback.onUiButton();
    openSolarSystem({ selectPlanet: unlockedPlanetId });
  }, [celebration, dismissCelebration, feedback, openSolarSystem]);

  useEffect(() => {
    if (!celebration) {
      return;
    }

    feedback.onPlanetUnlock();
  }, [celebration, feedback]);

  const progress = getPlanetProgress(state, planetId);
  const planetVisual = getPlanetVisualConfig(planetId);
  const upgradeTracks = getPlanetUpgradeTracks(planetId);
  const planetName = getPlanetGameConfig(planetId).name;
  const neptuneUnlocked = isPlanetUnlocked(state, 'neptune');

  const moonTrack = findPlanetUpgradeByVisualType(planetId, 'moon');
  const stationTrack = findPlanetUpgradeByVisualType(planetId, 'station');
  const satelliteTrack = findPlanetUpgradeByVisualType(planetId, 'satellite');
  const ringTrack = findPlanetUpgradeByVisualType(planetId, 'ring');
  const axialTiltRadians = planetVisual.axialTiltRadians ?? 0;

  const moonUnlocked = moonTrack
    ? isUpgradeUnlocked(progress, moonTrack.id)
    : false;
  const stationUnlocked = stationTrack
    ? isUpgradeUnlocked(progress, stationTrack.id)
    : false;
  const satelliteUnlocked = satelliteTrack
    ? isUpgradeUnlocked(progress, satelliteTrack.id)
    : false;
  const moonLevel = moonTrack ? getUpgradeLevel(progress, moonTrack.id) : 0;
  const stationLevel = stationTrack
    ? getUpgradeLevel(progress, stationTrack.id)
    : 0;
  const satelliteLevel = satelliteTrack
    ? getUpgradeLevel(progress, satelliteTrack.id)
    : 0;
  const ringUnlocked = ringTrack
    ? isUpgradeUnlocked(progress, ringTrack.id)
    : false;
  const ringLevel = ringTrack ? getUpgradeLevel(progress, ringTrack.id) : 0;
  const ringEnhancementTier = getRingEnhancementTier(
    ringUnlocked ? ringLevel : 0,
  );
  const moonCosmeticTier = getMoonCosmeticTier(moonUnlocked ? moonLevel : 0);

  const moonConfigs = planetVisual.moons;
  const stationConfig = stationTrack?.visualId
    ? getStationConfig(planetId, stationTrack.visualId)
    : undefined;
  const satelliteConfig = satelliteTrack?.visualId
    ? getSatelliteConfig(planetId, satelliteTrack.visualId)
    : undefined;

  const { surfaceOffset, spinRatio, isDragging, panGesture } = useEarthRotation({
    planetDiameter: earthDiameter,
    spinSpeedSource,
    rotationSpeedSource,
    rotationSpeedLevel: progress.rotationSpeedLevel,
    onManualSpinStart: feedback.onManualSpinAcceleration,
  });

  useSpinSoundIntensity({
    spinRatio,
    isDragging,
    soundEnabled: settings.soundEnabled,
  });
  const moonOrbits = useMoonOrbit({
    centerX,
    centerY,
    earthRadius,
    enabled: moonUnlocked,
    moonLevel,
    visibleCountThresholds: moonTrack?.visibleCountThresholds,
  });
  const stationOrbits = useSatelliteOrbit({
    centerX,
    centerY,
    earthRadius,
    satelliteLevel: stationLevel,
    enabled: stationUnlocked,
    visibleCountThresholds: stationTrack?.visibleCountThresholds,
    radiusXFactor: STATION_ORBIT_RADIUS_X_FACTOR,
    radiusYFactor: STATION_ORBIT_RADIUS_Y_FACTOR,
    angularSpeed: STATION_ORBIT_ANGULAR_SPEED,
  });
  const satelliteOrbits = useSatelliteOrbit({
    centerX,
    centerY,
    earthRadius,
    satelliteLevel,
    enabled: satelliteUnlocked,
    visibleCountThresholds: satelliteTrack?.visibleCountThresholds,
  });

  const planetEnergyPerSecond = getActivePlanetEnergyPerSecond(
    state,
    planetId,
    spinRatio,
    eventProductionMultiplier,
  );
  const systemEnergyPerSecond = getCombinedEnergyPerSecond(
    state,
    planetId,
    spinRatio,
    eventProductionMultiplier,
  );

  const primaryUnlocked = useMemo(() => {
    const primary = upgradeTracks[0];
    return primary ? isUpgradeUnlocked(progress, primary.id) : false;
  }, [progress, upgradeTracks]);

  useEffect(() => {
    const next: Record<string, boolean | null> = {};
    for (const track of upgradeTracks) {
      next[track.id] = isUpgradeUnlocked(progress, track.id);
    }
    previousUpgradeUnlocked.current = next;
    setJustUnlockedIds({});
    setUnlockToastMessage(null);
    if (unlockToastTimeoutRef.current) {
      clearTimeout(unlockToastTimeoutRef.current);
      unlockToastTimeoutRef.current = null;
    }
  }, [planetId]);

  useEffect(() => {
    for (const track of upgradeTracks) {
      const unlocked = isUpgradeUnlocked(progress, track.id);
      const previous = previousUpgradeUnlocked.current[track.id];

      if (previous === undefined || previous === null) {
        previousUpgradeUnlocked.current[track.id] = unlocked;
        continue;
      }

      if (!previous && unlocked) {
        feedback.onUpgradeTrackUnlock();
        setJustUnlockedIds((current) => ({ ...current, [track.id]: true }));
        showUnlockToast(`${track.displayName} unlocked!`);

        if (
          track.visualType === 'moon' ||
          track.visualType === 'satellite' ||
          track.visualType === 'station' ||
          track.visualType === 'ring'
        ) {
          setVisualMilestoneLabel(`${track.displayName.toUpperCase()} UNLOCKED`);
        }

        if (track.visualType === 'moon') {
          moonUnlockFlashAnim.setValue(1);
          setMoonUnlockFlash(1);
          Animated.timing(moonUnlockFlashAnim, {
            toValue: 0,
            duration: 900,
            useNativeDriver: false,
          }).start(({ finished }) => {
            if (finished) {
              setMoonUnlockFlash(0);
            }
          });
        }

        if (track.visualType === 'station') {
          stationUnlockFlashAnim.setValue(1);
          setStationUnlockFlash(1);
          Animated.timing(stationUnlockFlashAnim, {
            toValue: 0,
            duration: 900,
            useNativeDriver: false,
          }).start(({ finished }) => {
            if (finished) {
              setStationUnlockFlash(0);
            }
          });
        }

        if (track.visualType === 'satellite') {
          satelliteUnlockFlashAnim.setValue(1);
          setSatelliteUnlockFlash(1);
          Animated.timing(satelliteUnlockFlashAnim, {
            toValue: 0,
            duration: 900,
            useNativeDriver: false,
          }).start(({ finished }) => {
            if (finished) {
              setSatelliteUnlockFlash(0);
            }
          });
        }
      }

      previousUpgradeUnlocked.current[track.id] = unlocked;
    }
  }, [
    progress.upgrades,
    upgradeTracks,
    moonUnlockFlashAnim,
    satelliteUnlockFlashAnim,
    stationUnlockFlashAnim,
    showUnlockToast,
    feedback,
  ]);

  useEffect(() => {
    if (previousNeptuneUnlocked.current === null) {
      previousNeptuneUnlocked.current = neptuneUnlocked;
      return;
    }

    if (!previousNeptuneUnlocked.current && neptuneUnlocked) {
      if (unlockToastChainTimeoutRef.current) {
        clearTimeout(unlockToastChainTimeoutRef.current);
      }
      // Follow the full-screen Neptune celebration — no duplicate planet toast.
      unlockToastChainTimeoutRef.current = setTimeout(() => {
        unlockToastChainTimeoutRef.current = null;
        showUnlockToast('SOLAR SYSTEM COMPLETE');
      }, PLANET_UNLOCK_CELEBRATION_MS);
    }

    previousNeptuneUnlocked.current = neptuneUnlocked;
  }, [neptuneUnlocked, showUnlockToast]);

  useEffect(() => {
    const activeIds = Object.keys(justUnlockedIds).filter((id) => justUnlockedIds[id]);

    if (activeIds.length === 0) {
      return;
    }

    const timeout = setTimeout(() => {
      setJustUnlockedIds({});
    }, UNLOCK_TOAST_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [justUnlockedIds]);

  const moonsBehind = moonOrbits.filter((orbit) => orbit.isBehindEarth);
  const moonsInFront = moonOrbits.filter((orbit) => !orbit.isBehindEarth);
  const stationsBehind = stationOrbits.filter((orbit) => orbit.isBehindEarth);
  const stationsInFront = stationOrbits.filter((orbit) => !orbit.isBehindEarth);
  const satellitesBehind = satelliteOrbits.filter((orbit) => orbit.isBehindEarth);
  const satellitesInFront = satelliteOrbits.filter((orbit) => !orbit.isBehindEarth);
  const orbitAccent =
    planetId === 'mars'
      ? 'rgba(251, 146, 60, 0.12)'
      : planetId === 'venus'
        ? 'rgba(251, 191, 36, 0.14)'
        : planetId === 'mercury'
          ? 'rgba(148, 163, 184, 0.14)'
          : planetId === 'jupiter'
            ? 'rgba(251, 146, 60, 0.16)'
            : planetId === 'saturn'
              ? 'rgba(251, 191, 36, 0.16)'
              : planetId === 'uranus'
                ? 'rgba(34, 211, 238, 0.16)'
                : planetId === 'neptune'
                  ? 'rgba(37, 99, 235, 0.16)'
                  : 'rgba(125, 211, 252, 0.1)';
  const moonOrbitColor =
    planetId === 'mars'
      ? 'rgba(251, 146, 60, 0.14)'
      : planetId === 'venus'
        ? 'rgba(251, 191, 36, 0.16)'
        : planetId === 'mercury'
          ? 'rgba(251, 191, 36, 0.1)'
          : planetId === 'jupiter'
            ? 'rgba(253, 186, 116, 0.16)'
            : planetId === 'saturn'
              ? 'rgba(253, 230, 138, 0.16)'
              : planetId === 'uranus'
                ? 'rgba(165, 243, 252, 0.16)'
                : planetId === 'neptune'
                  ? 'rgba(96, 165, 250, 0.16)'
                  : 'rgba(147, 197, 253, 0.12)';
  const moonUsesCosmeticTier =
    planetId === 'saturn' || planetId === 'neptune';

  const tiltOrbitPoint = (x: number, y: number) =>
    applyAxialTilt(x, y, centerX, centerY, axialTiltRadians);
  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        setLayoutSize({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height,
        });
      }}
    >
      <PlanetSceneTransition
        planetId={planetId}
        scene={
          <>
      <Canvas style={styles.canvas}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width * 0.15, height)}
            colors={[...SPACE_COLORS]}
          />
        </Rect>

        {STARS.map((star, index) => (
          <Circle
            key={index}
            cx={star.x * width}
            cy={star.y * height}
            r={star.radius}
            color={getStarColor(star)}
          />
        ))}

        {moonUnlocked && (
          <OrbitLine
            centerX={centerX}
            centerY={centerY}
            radiusX={earthRadius * MOON_ORBIT_RADIUS_X_FACTOR}
            radiusY={earthRadius * MOON_ORBIT_RADIUS_Y_FACTOR}
            color={moonOrbitColor}
            axialTiltRadians={axialTiltRadians}
          />
        )}

        {stationUnlocked && (
          <OrbitLine
            centerX={centerX}
            centerY={centerY}
            radiusX={earthRadius * STATION_ORBIT_RADIUS_X_FACTOR}
            radiusY={earthRadius * STATION_ORBIT_RADIUS_Y_FACTOR}
            color={moonOrbitColor}
            axialTiltRadians={axialTiltRadians}
          />
        )}

        {satelliteUnlocked && (
          <OrbitLine
            centerX={centerX}
            centerY={centerY}
            radiusX={earthRadius * SATELLITE_ORBIT_RADIUS_X_FACTOR}
            radiusY={earthRadius * SATELLITE_ORBIT_RADIUS_Y_FACTOR}
            color={orbitAccent}
            axialTiltRadians={axialTiltRadians}
          />
        )}

        {moonUnlocked && moonsBehind.map((orbit, index) => {
          const moonConfig = moonConfigs[index] ?? moonConfigs[0];
          if (!moonConfig) {
            return null;
          }

          const tilted = tiltOrbitPoint(orbit.x, orbit.y);

          return (
            <MoonView
              key={`moon-back-${moonConfig.id}-${index}`}
              x={tilted.x}
              y={tilted.y}
              earthRadius={earthRadius}
              unlockFlash={moonUnlockFlash}
              moonConfig={moonConfig}
              cosmeticTier={moonUsesCosmeticTier ? moonCosmeticTier : undefined}
            />
          );
        })}

        {stationsBehind.map((orbit, index) => {
          if (!stationConfig) {
            return null;
          }

          const tilted = tiltOrbitPoint(orbit.x, orbit.y);

          return (
            <StationView
              key={`station-back-${index}`}
              x={tilted.x}
              y={tilted.y}
              earthRadius={earthRadius}
              unlockFlash={stationUnlockFlash}
              stationConfig={stationConfig}
            />
          );
        })}

        {satellitesBehind.map((orbit, index) => {
          const tilted = tiltOrbitPoint(orbit.x, orbit.y);

          return (
            <SatelliteView
              key={`sat-back-${index}`}
              x={tilted.x}
              y={tilted.y}
              earthRadius={earthRadius}
              unlockFlash={satelliteUnlockFlash}
              satelliteConfig={satelliteConfig}
            />
          );
        })}

        {planetVisual.ringSystem ? (
          <PlaceholderPlanetRings
            centerX={centerX}
            centerY={centerY}
            planetRadius={earthRadius}
            ringSystem={planetVisual.ringSystem}
            enhancementTier={ringEnhancementTier}
            layer="back"
            axialTiltRadians={axialTiltRadians}
          />
        ) : null}

        <PlanetView
          planetId={planetId}
          config={planetVisual}
          centerX={centerX}
          centerY={centerY}
          radius={earthRadius}
          surfaceOffset={surfaceOffset}
          spinRatio={spinRatio}
        />

        {planetVisual.ringSystem ? (
          <PlaceholderPlanetRings
            centerX={centerX}
            centerY={centerY}
            planetRadius={earthRadius}
            ringSystem={planetVisual.ringSystem}
            enhancementTier={ringEnhancementTier}
            layer="front"
            axialTiltRadians={axialTiltRadians}
          />
        ) : null}

        {moonUnlocked && moonsInFront.map((orbit, index) => {
          const moonConfig = moonConfigs[index] ?? moonConfigs[0];
          if (!moonConfig) {
            return null;
          }

          const tilted = tiltOrbitPoint(orbit.x, orbit.y);

          return (
            <MoonView
              key={`moon-front-${moonConfig.id}-${index}`}
              x={tilted.x}
              y={tilted.y}
              earthRadius={earthRadius}
              unlockFlash={moonUnlockFlash}
              moonConfig={moonConfig}
              cosmeticTier={moonUsesCosmeticTier ? moonCosmeticTier : undefined}
            />
          );
        })}

        {stationsInFront.map((orbit, index) => {
          if (!stationConfig) {
            return null;
          }

          const tilted = tiltOrbitPoint(orbit.x, orbit.y);

          return (
            <StationView
              key={`station-front-${index}`}
              x={tilted.x}
              y={tilted.y}
              earthRadius={earthRadius}
              unlockFlash={stationUnlockFlash}
              stationConfig={stationConfig}
            />
          );
        })}

        {satellitesInFront.map((orbit, index) => {
          const tilted = tiltOrbitPoint(orbit.x, orbit.y);

          return (
            <SatelliteView
              key={`sat-front-${index}`}
              x={tilted.x}
              y={tilted.y}
              earthRadius={earthRadius}
              unlockFlash={satelliteUnlockFlash}
              satelliteConfig={satelliteConfig}
            />
          );
        })}
      </Canvas>

      <EarthTouchTarget
        centerX={centerX}
        centerY={centerY}
        radius={earthRadius}
        panGesture={panGesture}
      />

      <SolarFlareVisual
        centerX={centerX}
        centerY={centerY}
        planetRadius={earthRadius}
        visible={activeEvent?.definitionId === 'solar-flare'}
      />

      <CometPassVisual
        width={width}
        height={height}
        progress={cometProgress}
        visible={
          activeEvent?.definitionId === 'comet-pass' &&
          !activeEvent.comet?.caught
        }
        onTap={handleCometTap}
      />

      <MeteorShowerVisual
        meteors={activeEvent?.meteors ?? []}
        now={eventNow}
        visible={activeEvent?.definitionId === 'meteor-shower'}
        onTapMeteor={handleMeteorTap}
      />
          </>
        }
        chrome={
          <>
      {eventBanner ? (
        <SpaceEventBanner
          title={eventBanner.title}
          subtitle={eventBanner.subtitle}
          top={Math.max(insets.top + 44, labelTop + 18)}
        />
      ) : null}

      <AchievementClaimPop
        label={rewardPop ?? ''}
        visible={rewardPop !== null}
      />

      <View style={celebration ? styles.dimmedUi : undefined} pointerEvents="none">
        <PlanetLabel top={labelTop} name={planetName} />
      </View>

      <View style={celebration ? styles.dimmedUi : undefined}>
        <SolarSystemButton
          onPress={() => {
            feedback.onUiButton();
            openSolarSystem();
          }}
        />
      </View>

      <DevPlanetControls
        planetId={planetId}
        primaryUpgradeUnlocked={primaryUnlocked}
        onLevelUp={() => devLevelUp(planetId)}
        onLevelUpSatellite={() => devLevelUpSatellite(planetId)}
        onResetSave={devResetSave}
        onSimulateOffline={devSimulateOfflineHour}
        onUnlockMars={planetId === 'earth' ? devUnlockMars : undefined}
        onUnlockVenus={planetId === 'mars' ? devUnlockVenus : undefined}
        onUnlockMercury={planetId === 'venus' ? devUnlockMercury : undefined}
        onUnlockJupiter={planetId === 'mercury' ? devUnlockJupiter : undefined}
        onUnlockSaturn={planetId === 'jupiter' ? devUnlockSaturn : undefined}
        onUnlockUranus={planetId === 'saturn' ? devUnlockUranus : undefined}
        onUnlockNeptune={planetId === 'uranus' ? devUnlockNeptune : undefined}
        onReadyPrestige={devReadyPrestige}
        onAddStardust={devAddStardust}
        onTriggerComet={() => triggerDevEvent('comet-pass')}
        onTriggerSolarFlare={() => triggerDevEvent('solar-flare')}
        onTriggerMeteorShower={() => triggerDevEvent('meteor-shower')}
      />

      <DevSpinReadout spinRatio={spinRatio} />
      <DevSpinTestTracker spinRatio={spinRatio} />
          </>
        }
        hud={
      <View
        pointerEvents="box-none"
        style={[
          styles.hudContainer,
          {
            top: hudTop,
            paddingBottom: insets.bottom + 8,
            opacity: celebration ? 0.28 : 1,
          },
        ]}
      >
        <View style={styles.hudContent}>
          <EnergyDisplay
            energy={state.energy}
            planetEnergyPerSecond={planetEnergyPerSecond}
            systemEnergyPerSecond={systemEnergyPerSecond}
          />
          <ScrollView
            style={styles.upgradeScroll}
            contentContainerStyle={styles.upgradeScrollContent}
            showsVerticalScrollIndicator={false}
            bounces
          >
            <RotationSpeedUpgradeCard
              energy={state.energy}
              level={progress.rotationSpeedLevel}
              planetId={planetId}
              gameState={state}
              onUpgrade={() => purchaseRotationSpeedUpgrade(planetId)}
            />
            {upgradeTracks.map((track) =>
              isUpgradeUnlocked(progress, track.id) ? (
                <OrbitUpgradeCard
                  key={track.id}
                  energy={state.energy}
                  planetId={planetId}
                  progress={progress}
                  track={track}
                  gameState={state}
                  justUnlocked={Boolean(justUnlockedIds[track.id])}
                  onUpgrade={() => purchaseUpgrade(track.id, planetId)}
                />
              ) : (
                <OrbitUpgradeLockedCard
                  key={track.id}
                  planetId={planetId}
                  track={track}
                />
              ),
            )}
          </ScrollView>
        </View>
      </View>
        }
      />

      <UnlockToast
        message={unlockToastMessage ?? ''}
        visible={unlockToastMessage !== null}
      />

      <PlanetUnlockCelebration
        visible={celebration !== null}
        planetId={celebration?.planetId ?? 'mars'}
        planetName={celebrationPlanetName}
        centerX={centerX}
        centerY={centerY}
        planetRadius={earthRadius}
        onViewSolarSystem={handleViewUnlockedPlanetInSolarSystem}
        onDismiss={dismissCelebration}
      />

      <VisualUnlockMilestone
        label={visualMilestoneLabel ?? ''}
        visible={visualMilestoneLabel !== null}
        onComplete={() => setVisualMilestoneLabel(null)}
      />

      <OfflineEarningsModal
        result={offlineEarnings}
        onCollect={dismissOfflineEarnings}
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
  hudContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  hudContent: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 16,
  },
  upgradeScroll: {
    alignSelf: 'stretch',
    flex: 1,
  },
  upgradeScrollContent: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  dimmedUi: {
    opacity: 0.28,
  },
});
