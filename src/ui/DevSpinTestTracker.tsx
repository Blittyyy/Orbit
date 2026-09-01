import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SHOW_DEV_CONTROLS } from '../config/dev';
import { getSpinProductionMultiplier } from '../game/spinCurve';

const TEST_DURATION_SECONDS = 60;

type TestPhase = 'idle' | 'running' | 'complete';

interface SpinTestStats {
  elapsedSeconds: number;
  currentMultiplier: number;
  averageMultiplier: number;
  peakMultiplier: number;
  above2Seconds: number;
  above3Seconds: number;
  above4Seconds: number;
}

function createEmptyStats(currentMultiplier = 1): SpinTestStats {
  return {
    elapsedSeconds: 0,
    currentMultiplier,
    averageMultiplier: currentMultiplier,
    peakMultiplier: currentMultiplier,
    above2Seconds: 0,
    above3Seconds: 0,
    above4Seconds: 0,
  };
}

interface DevSpinTestTrackerProps {
  spinRatio: number;
  embedded?: boolean;
}

/**
 * DEV-only timed spin calibration session.
 * Measures the live Energy spin production multiplier (time-weighted).
 */
export function DevSpinTestTracker({ spinRatio, embedded = false }: DevSpinTestTrackerProps) {
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [stats, setStats] = useState<SpinTestStats>(() => createEmptyStats());

  const spinRatioRef = useRef(spinRatio);
  const phaseRef = useRef<TestPhase>('idle');
  const accumRef = useRef({
    elapsed: 0,
    weightedSum: 0,
    peak: 1,
    above2: 0,
    above3: 0,
    above4: 0,
  });

  spinRatioRef.current = spinRatio;
  phaseRef.current = phase;

  useEffect(() => {
    if (phase !== 'running') {
      return;
    }

    let frameId = 0;
    let lastTimestamp = performance.now();
    let uiAccum = 0;

    const tick = (timestamp: number) => {
      if (phaseRef.current !== 'running') {
        return;
      }

      const accum = accumRef.current;
      const remaining = TEST_DURATION_SECONDS - accum.elapsed;
      if (remaining <= 0) {
        setPhase('complete');
        return;
      }

      const dtSeconds = Math.min(
        (timestamp - lastTimestamp) / 1000,
        0.1,
        remaining,
      );
      lastTimestamp = timestamp;

      if (dtSeconds <= 0) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      const multiplier = getSpinProductionMultiplier(spinRatioRef.current);

      accum.elapsed += dtSeconds;
      accum.weightedSum += multiplier * dtSeconds;
      accum.peak = Math.max(accum.peak, multiplier);

      if (multiplier >= 2) {
        accum.above2 += dtSeconds;
      }
      if (multiplier >= 3) {
        accum.above3 += dtSeconds;
      }
      if (multiplier >= 4) {
        accum.above4 += dtSeconds;
      }

      const finished = accum.elapsed >= TEST_DURATION_SECONDS - 1e-6;
      const average =
        accum.elapsed > 0 ? accum.weightedSum / accum.elapsed : 1;

      uiAccum += dtSeconds;
      if (uiAccum >= 0.1 || finished) {
        uiAccum = 0;
        setStats({
          elapsedSeconds: accum.elapsed,
          currentMultiplier: multiplier,
          averageMultiplier: average,
          peakMultiplier: accum.peak,
          above2Seconds: accum.above2,
          above3Seconds: accum.above3,
          above4Seconds: accum.above4,
        });
      }

      if (finished) {
        setPhase('complete');
        return;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [phase]);

  if (!__DEV__ || !SHOW_DEV_CONTROLS) {
    return null;
  }

  const startTest = () => {
    const current = getSpinProductionMultiplier(spinRatioRef.current);
    accumRef.current = {
      elapsed: 0,
      weightedSum: 0,
      peak: current,
      above2: 0,
      above3: 0,
      above4: 0,
    };
    setStats(createEmptyStats(current));
    setPhase('running');
  };

  const resetTest = () => {
    setPhase('idle');
    setStats(createEmptyStats(getSpinProductionMultiplier(spinRatioRef.current)));
    accumRef.current = {
      elapsed: 0,
      weightedSum: 0,
      peak: 1,
      above2: 0,
      above3: 0,
      above4: 0,
    };
  };

  const remaining = Math.max(
    0,
    Math.ceil(TEST_DURATION_SECONDS - stats.elapsedSeconds),
  );

  const percent = (seconds: number) => {
    const denom = Math.max(stats.elapsedSeconds, 1e-6);
    return `${((seconds / denom) * 100).toFixed(0)}%`;
  };

  return (
    <View style={embedded ? styles.embedded : styles.container}>
      {phase === 'idle' ? (
        <Pressable onPress={startTest} style={styles.button}>
          <Text style={styles.buttonText}>START SPIN TEST</Text>
        </Pressable>
      ) : null}

      {phase === 'running' ? (
        <View style={styles.panel}>
          <Text style={styles.title}>SPIN TEST: {remaining}s</Text>
          <Text style={styles.line}>
            CURRENT: {stats.currentMultiplier.toFixed(2)}x
          </Text>
          <Text style={styles.line}>
            AVERAGE: {stats.averageMultiplier.toFixed(2)}x
          </Text>
          <Text style={styles.line}>PEAK: {stats.peakMultiplier.toFixed(2)}x</Text>
          <Text style={styles.meta}>
            ≥2x {percent(stats.above2Seconds)} · ≥3x {percent(stats.above3Seconds)} · ≥4x{' '}
            {percent(stats.above4Seconds)}
          </Text>
        </View>
      ) : null}

      {phase === 'complete' ? (
        <View style={styles.panel}>
          <Text style={styles.title}>SPIN TEST COMPLETE</Text>
          <Text style={styles.line}>
            Average: {stats.averageMultiplier.toFixed(2)}x
          </Text>
          <Text style={styles.line}>Peak: {stats.peakMultiplier.toFixed(2)}x</Text>
          <Text style={styles.line}>Above 2x: {percent(stats.above2Seconds)}</Text>
          <Text style={styles.line}>Above 3x: {percent(stats.above3Seconds)}</Text>
          <Text style={styles.line}>Above 4x: {percent(stats.above4Seconds)}</Text>
          <Pressable onPress={resetTest} style={[styles.button, styles.resetButton]}>
            <Text style={styles.buttonText}>RESET</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 168,
    position: 'absolute',
    right: 12,
    top: 96,
    zIndex: 9,
  },
  embedded: {
    alignSelf: 'stretch',
  },
  button: {
    backgroundColor: 'rgba(30, 58, 138, 0.9)',
    borderColor: 'rgba(125, 211, 252, 0.45)',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  resetButton: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
  buttonText: {
    color: '#e0f2fe',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: 'rgba(8, 12, 28, 0.72)',
    borderColor: 'rgba(148, 163, 184, 0.28)',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  title: {
    color: '#fde68a',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  line: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginTop: 1,
  },
  meta: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginTop: 5,
  },
});
