import { createContext, useContext, useMemo, type ReactNode } from 'react';

interface EffectsSettingsValue {
  reduceEffects: boolean;
}

const EffectsSettingsContext = createContext<EffectsSettingsValue>({
  reduceEffects: false,
});

export function EffectsSettingsProvider({
  reduceEffects,
  children,
}: {
  reduceEffects: boolean;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ reduceEffects }), [reduceEffects]);

  return (
    <EffectsSettingsContext.Provider value={value}>
      {children}
    </EffectsSettingsContext.Provider>
  );
}

export function useReduceEffects(): boolean {
  return useContext(EffectsSettingsContext).reduceEffects;
}
