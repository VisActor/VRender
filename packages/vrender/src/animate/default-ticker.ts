import { DefaultTicker } from './Ticker/default-ticker';
import { defaultTimeline } from './timeline';

export const defaultTicker = new DefaultTicker();
defaultTicker.addTimeline(defaultTimeline);
const DEFAULT_TICKER_FPS = 60;
defaultTicker.setFPS(DEFAULT_TICKER_FPS);
