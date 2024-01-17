import { application } from './application';

let _isBrowserEnv: boolean | undefined;

/**
 * 仅能判断是否是浏览器环境和NodeJS环境，其他环境不一定判断出来
 * @returns
 */
function initIsBrowserEnv() {
  if (_isBrowserEnv != null) {
    return;
  }
  try {
    // @ts-ignore
    _isBrowserEnv = globalThis === window;
    if (_isBrowserEnv) {
      _isBrowserEnv = !!document.createElement;
    }
  } catch (err: any) {
    _isBrowserEnv = false;
  }
}

export function isBrowserEnv(): boolean {
  initIsBrowserEnv();
  const env = application.global && application.global.env;
  return env ? env === 'browser' : _isBrowserEnv;
}

export function isNodeEnv() {
  initIsBrowserEnv();
  const env = application.global && application.global.env;
  return env ? env === 'node' : !_isBrowserEnv;
}

export function getCurrentEnv(): 'browser' | 'node' {
  return isBrowserEnv() ? 'browser' : 'node';
}
