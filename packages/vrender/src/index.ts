import 'reflect-metadata';
import { DefaultTicker, defaultTimeline } from './animate';
import './modules';

export * from './core/global';
export * from './graphic';
export * from './modules';
export * from './create';
export * from './event';
export * from './interface';
export * from './render';
export * from './canvas';
export * from './core';
export * from './picker';
export * from './kits';
export * from './animate';
export * from './resource-loader/loader';

export const defaultTicker = new DefaultTicker();
defaultTicker.addTimeline(defaultTimeline);
const DEFAULT_TICKER_FPS = 60;
defaultTicker.setFPS(DEFAULT_TICKER_FPS);

/* export common */
export * from './common/text';
export * from './common/bezier-utils';
export * from './common/bounds-context';
export * from './common/seg-context';
export * from './common/custom-path2d';
export * from './common/segment';
export * from './common/canvas-utils';
export * from './common/contribution-provider';
export * from './common/generator';
export * from './common/utils';
export * from './common/shape/arc';
export * from './common/shape/rect';

export * from './common/path-svg';
export * from './common/render-curve';
export * from './common/render-area';
export * from './common/render-command-list';
export * from './common/sort';
export * from './common/morphing-utils';
export * from './common/split-path';
export * from './common/enums';
