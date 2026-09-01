import { useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SHOW_DEV_CONTROLS } from '../config/dev';

interface DevPanelProps {
  children: ReactNode;
  /** Overlay sits on gameplay; inline lives in a scroll screen. */
  variant?: 'overlay' | 'inline';
}

export function DevPanel({ children, variant = 'overlay' }: DevPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  if (!__DEV__ || !SHOW_DEV_CONTROLS) {
    return null;
  }

  const maxPanelHeight = Math.max(160, Math.min(320, height * 0.42));

  return (
    <View
      pointerEvents="box-none"
      style={variant === 'overlay' ? [styles.overlay, { top: insets.top + 44 }] : styles.inline}
    >
      <Pressable
        onPress={() => setExpanded((open) => !open)}
        style={[styles.toggle, expanded && styles.toggleOpen]}
      >
        <Text style={styles.toggleText}>DEV{expanded ? ' ▲' : ''}</Text>
      </Pressable>
      {expanded ? (
        <ScrollView
          nestedScrollEnabled
          style={[styles.panel, { maxHeight: maxPanelHeight }]}
          contentContainerStyle={styles.panelContent}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    left: 12,
    position: 'absolute',
    width: 188,
    zIndex: 20,
  },
  inline: {
    marginTop: 16,
  },
  toggle: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderColor: 'rgba(148, 163, 184, 0.55)',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  toggleOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  toggleText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  panel: {
    backgroundColor: 'rgba(8, 12, 28, 0.94)',
    borderColor: 'rgba(148, 163, 184, 0.4)',
    borderRadius: 10,
    borderTopLeftRadius: 0,
    borderWidth: 1,
  },
  panelContent: {
    gap: 6,
    padding: 8,
  },
});
