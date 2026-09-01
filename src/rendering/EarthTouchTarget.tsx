import { StyleSheet, View } from 'react-native';
import { GestureDetector, type PanGesture } from 'react-native-gesture-handler';

interface EarthTouchTargetProps {
  centerX: number;
  centerY: number;
  radius: number;
  panGesture: PanGesture;
}

export function EarthTouchTarget({
  centerX,
  centerY,
  radius,
  panGesture,
}: EarthTouchTargetProps) {
  const diameter = radius * 2;

  return (
    <GestureDetector gesture={panGesture}>
      <View
        style={[
          styles.touchTarget,
          {
            left: centerX - radius,
            top: centerY - radius,
            width: diameter,
            height: diameter,
            borderRadius: radius,
          },
        ]}
      />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  touchTarget: {
    position: 'absolute',
  },
});
