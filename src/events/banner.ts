import { getSpaceEventDefinition } from './definitions';
import type { ActiveSpaceEvent } from './types';

export interface SpaceEventBannerContent {
  title: string;
  subtitle: string;
}

export function getSpaceEventBanner(
  event: ActiveSpaceEvent,
  now = Date.now(),
): SpaceEventBannerContent {
  const definition = getSpaceEventDefinition(event.definitionId);
  const title = definition?.displayName ?? 'Space Event';
  const secondsLeft = Math.max(0, Math.ceil((event.endsAt - now) / 1000));

  switch (event.definitionId) {
    case 'comet-pass':
      return { title: 'COMET PASS', subtitle: 'Tap the comet!' };
    case 'solar-flare':
      return { title: 'SOLAR FLARE', subtitle: `+50% Production\n${secondsLeft}s` };
    case 'meteor-shower':
      return { title: 'METEOR SHOWER', subtitle: `Tap meteors!\n${secondsLeft}s` };
    default:
      return { title, subtitle: `${secondsLeft}s` };
  }
}
