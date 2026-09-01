import { PlanetGameScreen } from './PlanetGameScreen';

/** Earth entry point — thin wrapper over the shared planet gameplay screen. */
export function GameScreen() {
  return <PlanetGameScreen planetId="earth" />;
}
