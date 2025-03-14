import { DefaultTicker } from './Ticker/default-ticker';
import { defaultTimeline } from './timeline';

export const defaultTicker = new DefaultTicker();
defaultTicker.addTimeline(defaultTimeline);
const TICKER_FPS = 60;
defaultTicker.setFPS(TICKER_FPS);
