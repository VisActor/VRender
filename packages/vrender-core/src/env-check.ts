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
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // TODO 历史逻辑，这里有时候会被拿来判断小程序，所以先用很多类型来进行深入的判定
    _isBrowserEnv = !!(
      window &&
      !!canvas.getBoundingClientRect &&
      !!requestAnimationFrame &&
      !!window.devicePixelRatio &&
      ctx &&
      !!ctx.isPointInPath &&
      !!ctx.isPointInStroke
    );
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
