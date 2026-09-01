import { useCallback, useEffect, useRef, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import type { RotationSpeedSource } from '../game/rotationSpeedSource';
import {
  DRAG_VELOCITY_SCALE,
  DRAG_VELOCITY_TRACKING,
  FLICK_VELOCITY_SCALE,
  GESTURE_VELOCITY_SMOOTHING,
} from '../visual/constants';
import {
  applyBaseVelocityChange,
  applyDragOffset,
  clampSpinVelocity,
  createInitialEarthRotationState,
  mergeReleaseVelocity,
  smoothGestureVelocity,
  stepEarthRotation,
  trackVelocityToward,
} from '../visual/earthRotation';
import {
  getBaseAngularVelocity,
  type MutableSpinSpeedSource,
} from '../visual/spinSpeed';

interface UseEarthRotationOptions {
  planetDiameter: number;
  spinSpeedSource: MutableSpinSpeedSource;
  rotationSpeedSource: RotationSpeedSource;
  rotationSpeedLevel: number;
  onManualSpinStart?: () => void;
}

export function useEarthRotation({
  planetDiameter,
  spinSpeedSource,
  rotationSpeedSource,
  rotationSpeedLevel,
  onManualSpinStart,
}: UseEarthRotationOptions) {
  const baseVelocityRef = useRef(getBaseAngularVelocity(rotationSpeedSource));
  const stateRef = useRef(
    createInitialEarthRotationState(baseVelocityRef.current),
  );
  const dragStartOffsetRef = useRef(0);
  /** Angular velocity at drag start — gesture layers on top for stacking. */
  const dragStartVelocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const smoothedGestureVelXRef = useRef(0);
  const lastDragSampleTimeRef = useRef(0);

  const [surfaceOffset, setSurfaceOffset] = useState(0);
  const [spinRatio, setSpinRatio] = useState(() => spinSpeedSource.getSpinRatio());
  const [isDragging, setIsDragging] = useState(false);

  const publishSpinSpeed = useCallback(
    (angularVelocity: number) => {
      spinSpeedSource.setAngularVelocity(angularVelocity);
      setSpinRatio(spinSpeedSource.getSpinRatio());
    },
    [spinSpeedSource],
  );

  const syncSurfaceOffset = useCallback((offset: number) => {
    setSurfaceOffset(offset);
  }, []);

  useEffect(() => {
    const previousBaseVelocity = baseVelocityRef.current;
    const nextBaseVelocity = getBaseAngularVelocity(rotationSpeedSource);

    if (previousBaseVelocity !== nextBaseVelocity) {
      stateRef.current = applyBaseVelocityChange(
        stateRef.current,
        previousBaseVelocity,
        nextBaseVelocity,
      );
      baseVelocityRef.current = nextBaseVelocity;
      publishSpinSpeed(stateRef.current.velocity);
    }
  }, [rotationSpeedLevel, rotationSpeedSource, publishSpinSpeed]);

  useEffect(() => {
    let frameId = 0;
    let lastTimestamp = performance.now();

    const tick = (timestamp: number) => {
      const dtSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = timestamp;

      if (!isDraggingRef.current) {
        const baseVelocity = baseVelocityRef.current;
        stateRef.current = stepEarthRotation(
          stateRef.current,
          dtSeconds,
          baseVelocity,
        );
        publishSpinSpeed(stateRef.current.velocity);
        setSurfaceOffset(stateRef.current.offset);
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [publishSpinSpeed]);

  const onDragStart = useCallback(() => {
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartOffsetRef.current = stateRef.current.offset;
    dragStartVelocityRef.current = stateRef.current.velocity;
    smoothedGestureVelXRef.current = 0;
    lastDragSampleTimeRef.current = performance.now();
    onManualSpinStart?.();
  }, [onManualSpinStart]);

  const onDragUpdate = useCallback(
    (translationX: number, velocityX: number) => {
      if (planetDiameter <= 0) {
        return;
      }

      const now = performance.now();
      const dtSeconds = Math.min(
        Math.max((now - lastDragSampleTimeRef.current) / 1000, 1 / 240),
        0.05,
      );
      lastDragSampleTimeRef.current = now;

      const baseVelocity = baseVelocityRef.current;

      stateRef.current = applyDragOffset(
        stateRef.current,
        dragStartOffsetRef.current,
        translationX,
        planetDiameter,
      );

      smoothedGestureVelXRef.current = smoothGestureVelocity(
        smoothedGestureVelXRef.current,
        velocityX,
        dtSeconds,
        GESTURE_VELOCITY_SMOOTHING,
      );

      // Layer smoothed drag onto coast-at-touch so prior momentum stacks.
      const gestureTarget = clampSpinVelocity(
        dragStartVelocityRef.current +
          (smoothedGestureVelXRef.current / planetDiameter) *
            DRAG_VELOCITY_SCALE,
        baseVelocity,
      );

      stateRef.current = {
        ...stateRef.current,
        velocity: trackVelocityToward(
          stateRef.current.velocity,
          gestureTarget,
          dtSeconds,
          DRAG_VELOCITY_TRACKING,
          baseVelocity,
        ),
      };

      syncSurfaceOffset(stateRef.current.offset);
      publishSpinSpeed(stateRef.current.velocity);
    },
    [planetDiameter, publishSpinSpeed, syncSurfaceOffset],
  );

  const onDragEnd = useCallback(
    (velocityX: number) => {
      isDraggingRef.current = false;
      setIsDragging(false);

      if (planetDiameter <= 0) {
        publishSpinSpeed(stateRef.current.velocity);
        return;
      }

      const now = performance.now();
      const dtSeconds = Math.min(
        Math.max((now - lastDragSampleTimeRef.current) / 1000, 1 / 120),
        0.05,
      );
      const baseVelocity = baseVelocityRef.current;

      // Bias toward the release sample — RNGH's end velocity is the flick.
      smoothedGestureVelXRef.current = smoothGestureVelocity(
        smoothedGestureVelXRef.current,
        velocityX,
        dtSeconds,
        GESTURE_VELOCITY_SMOOTHING * 2.5,
      );
      const releaseVelX =
        velocityX * 0.7 + smoothedGestureVelXRef.current * 0.3;

      // Stack onto coast-at-touch; never let a weak lift erase spin already
      // built while the finger was moving (real-globe momentum).
      const releaseVelocity = clampSpinVelocity(
        dragStartVelocityRef.current +
          (releaseVelX / planetDiameter) * FLICK_VELOCITY_SCALE,
        baseVelocity,
      );

      stateRef.current = {
        ...stateRef.current,
        velocity: mergeReleaseVelocity(
          stateRef.current.velocity,
          releaseVelocity,
          baseVelocity,
        ),
      };

      publishSpinSpeed(stateRef.current.velocity);
      smoothedGestureVelXRef.current = 0;
    },
    [planetDiameter, publishSpinSpeed],
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      runOnJS(onDragUpdate)(event.translationX, event.velocityX);
    })
    .onEnd((event) => {
      runOnJS(onDragEnd)(event.velocityX);
    });

  return {
    surfaceOffset,
    spinRatio,
    isDragging,
    panGesture,
  };
}
