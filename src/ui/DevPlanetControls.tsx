import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SHOW_DEV_CONTROLS } from '../config/dev';
import {
  getPlanetGameConfig,
  getPlanetUpgradeTracks,
  type PlanetId,
} from '../config/planets';

interface DevPlanetControlsProps {
  planetId: PlanetId;
  primaryUpgradeUnlocked: boolean;
  onLevelUp: () => void;
  onLevelUpSatellite: () => void;
  onResetSave: () => void;
  onSimulateOffline: () => void;
  onUnlockMars?: () => void;
  onUnlockVenus?: () => void;
  onUnlockMercury?: () => void;
  onUnlockJupiter?: () => void;
  onUnlockSaturn?: () => void;
  onUnlockUranus?: () => void;
  onUnlockNeptune?: () => void;
  onReadyPrestige?: () => void;
  onAddStardust?: () => void;
  onTriggerComet?: () => void;
  onTriggerSolarFlare?: () => void;
  onTriggerMeteorShower?: () => void;
}

export function DevPlanetControls({
  planetId,
  primaryUpgradeUnlocked,
  onLevelUp,
  onLevelUpSatellite,
  onResetSave,
  onSimulateOffline,
  onUnlockMars,
  onUnlockVenus,
  onUnlockMercury,
  onUnlockJupiter,
  onUnlockSaturn,
  onUnlockUranus,
  onUnlockNeptune,
  onReadyPrestige,
  onAddStardust,
  onTriggerComet,
  onTriggerSolarFlare,
  onTriggerMeteorShower,
}: DevPlanetControlsProps) {
  const [expanded, setExpanded] = useState(false);

  if (!__DEV__ || !SHOW_DEV_CONTROLS) {
    return null;
  }

  const tracks = getPlanetUpgradeTracks(planetId);
  const primary = tracks[0];
  const secondary = tracks[1];
  const planetName = getPlanetGameConfig(planetId).name;
  const rotationLabel =
    planetId === 'earth' ? 'DEV +1 Rotation' : `DEV +1 ${planetName} Rotation`;
  const primaryLabel =
    primaryUpgradeUnlocked && primary
      ? `DEV +1 ${primary.displayName}`
      : rotationLabel;
  const secondaryLabel = secondary
    ? `DEV +1 ${secondary.displayName}`
    : 'DEV +1 Orbital';

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable
        onPress={() => setExpanded((open) => !open)}
        style={[styles.button, styles.toggle]}
      >
        <Text style={styles.toggleText}>DEV {expanded ? '▲' : '▼'}</Text>
      </Pressable>
      {expanded ? (
        <>
      <Pressable onPress={onLevelUp} style={[styles.button, styles.red]}>
        <Text style={styles.redText}>{primaryLabel}</Text>
      </Pressable>
      <Pressable onPress={onResetSave} style={[styles.button, styles.purple]}>
        <Text style={styles.purpleText}>DEV Reset Save</Text>
      </Pressable>
      <Pressable onPress={onSimulateOffline} style={[styles.button, styles.blue]}>
        <Text style={styles.blueText}>DEV +1 Hour Offline</Text>
      </Pressable>
      <Pressable onPress={onLevelUpSatellite} style={[styles.button, styles.cyan]}>
        <Text style={styles.cyanText}>{secondaryLabel}</Text>
      </Pressable>
      {planetId === 'earth' && onUnlockMars ? (
        <Pressable onPress={onUnlockMars} style={[styles.button, styles.red]}>
          <Text style={styles.redText}>DEV Unlock Mars</Text>
        </Pressable>
      ) : null}
      {planetId === 'mars' && onUnlockVenus ? (
        <Pressable onPress={onUnlockVenus} style={[styles.button, styles.amber]}>
          <Text style={styles.amberText}>DEV Unlock Venus</Text>
        </Pressable>
      ) : null}
      {planetId === 'venus' && onUnlockMercury ? (
        <Pressable onPress={onUnlockMercury} style={[styles.button, styles.gray]}>
          <Text style={styles.grayText}>DEV Unlock Mercury</Text>
        </Pressable>
      ) : null}
      {planetId === 'mercury' && onUnlockJupiter ? (
        <Pressable onPress={onUnlockJupiter} style={[styles.button, styles.amber]}>
          <Text style={styles.amberText}>DEV Unlock Jupiter</Text>
        </Pressable>
      ) : null}
      {planetId === 'jupiter' && onUnlockSaturn ? (
        <Pressable onPress={onUnlockSaturn} style={[styles.button, styles.amber]}>
          <Text style={styles.amberText}>DEV Unlock Saturn</Text>
        </Pressable>
      ) : null}
      {planetId === 'saturn' && onUnlockUranus ? (
        <Pressable onPress={onUnlockUranus} style={[styles.button, styles.cyan]}>
          <Text style={styles.cyanText}>DEV Unlock Uranus</Text>
        </Pressable>
      ) : null}
      {planetId === 'uranus' && onUnlockNeptune ? (
        <Pressable onPress={onUnlockNeptune} style={[styles.button, styles.blue]}>
          <Text style={styles.blueText}>DEV Unlock Neptune</Text>
        </Pressable>
      ) : null}
      {onReadyPrestige ? (
        <Pressable onPress={onReadyPrestige} style={[styles.button, styles.purple]}>
          <Text style={styles.purpleText}>DEV Ready Prestige</Text>
        </Pressable>
      ) : null}
      {onAddStardust ? (
        <Pressable onPress={onAddStardust} style={[styles.button, styles.amber]}>
          <Text style={styles.amberText}>DEV +10 Stardust</Text>
        </Pressable>
      ) : null}
      {onTriggerComet ? (
        <Pressable onPress={onTriggerComet} style={[styles.button, styles.cyan]}>
          <Text style={styles.cyanText}>DEV Trigger Comet</Text>
        </Pressable>
      ) : null}
      {onTriggerSolarFlare ? (
        <Pressable onPress={onTriggerSolarFlare} style={[styles.button, styles.amber]}>
          <Text style={styles.amberText}>DEV Trigger Solar Flare</Text>
        </Pressable>
      ) : null}
      {onTriggerMeteorShower ? (
        <Pressable onPress={onTriggerMeteorShower} style={[styles.button, styles.blue]}>
          <Text style={styles.blueText}>DEV Trigger Meteor Shower</Text>
        </Pressable>
      ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    left: 12,
    position: 'absolute',
    top: 52,
    zIndex: 10,
  },
  button: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  toggle: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderColor: 'rgba(148, 163, 184, 0.55)',
  },
  toggleText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
  },
  red: {
    backgroundColor: 'rgba(127, 29, 29, 0.85)',
    borderColor: 'rgba(248, 113, 113, 0.5)',
  },
  redText: {
    color: '#fecaca',
    fontSize: 12,
    fontWeight: '600',
  },
  purple: {
    backgroundColor: 'rgba(76, 29, 149, 0.85)',
    borderColor: 'rgba(196, 181, 253, 0.5)',
  },
  purpleText: {
    color: '#ddd6fe',
    fontSize: 12,
    fontWeight: '600',
  },
  blue: {
    backgroundColor: 'rgba(30, 58, 138, 0.88)',
    borderColor: 'rgba(125, 211, 252, 0.5)',
  },
  blueText: {
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: '600',
  },
  cyan: {
    backgroundColor: 'rgba(8, 47, 73, 0.9)',
    borderColor: 'rgba(56, 189, 248, 0.5)',
  },
  cyanText: {
    color: '#bae6fd',
    fontSize: 12,
    fontWeight: '600',
  },
  amber: {
    backgroundColor: 'rgba(120, 53, 15, 0.9)',
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
  amberText: {
    color: '#fde68a',
    fontSize: 12,
    fontWeight: '600',
  },
  gray: {
    backgroundColor: 'rgba(55, 65, 81, 0.92)',
    borderColor: 'rgba(156, 163, 175, 0.5)',
  },
  grayText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '600',
  },
});
