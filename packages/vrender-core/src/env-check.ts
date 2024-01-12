let _isBrowserEnv: boolean | undefined;
declare const tt: any;

function initIsBrowserEnv() {
  if (_isBrowserEnv != null) {
    return;
  }
  try {
    // @ts-ignore
    _isBrowserEnv = !!window;
  } catch (err: any) {
    _isBrowserEnv = false;
  }
}

export function isBrowserEnv(): boolean {
  initIsBrowserEnv();
  return _isBrowserEnv;
}

export function isNodeEnv() {
  initIsBrowserEnv();
  return !_isBrowserEnv;
}

export function getCurrentEnv(): 'browser' | 'node' {
  return isBrowserEnv() ? 'browser' : 'node';
}
