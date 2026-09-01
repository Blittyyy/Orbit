import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export type HapticStyle = 'light' | 'medium' | 'success';

function isHapticsAvailable(): boolean {
  return Platform.OS !== 'web';
}

export async function triggerHaptic(
  style: HapticStyle,
  enabled: boolean,
): Promise<void> {
  if (!enabled || !isHapticsAvailable()) {
    return;
  }

  try {
    switch (style) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
    }
  } catch {
    // Haptics are best-effort — ignore unsupported devices.
  }
}

export async function triggerSelectionHaptic(enabled: boolean): Promise<void> {
  if (!enabled || !isHapticsAvailable()) {
    return;
  }

  try {
    await Haptics.selectionAsync();
  } catch {
    // Haptics are best-effort — ignore unsupported devices.
  }
}
