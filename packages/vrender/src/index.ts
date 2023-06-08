import 'reflect-metadata';
import { DefaultTicker, defaultTimeline } from './animate';
import './modules';

export * from './core/global';
export * from './graphic';
export * from './modules';
export * from './create';
export * from './event';
export * from './common';
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
const DEFAULT_FPS = 60;
defaultTicker.setFPS(DEFAULT_FPS);
