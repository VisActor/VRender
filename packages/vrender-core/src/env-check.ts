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
  // 字节小程序有window，判断环境中是否有tt，有tt就不是浏览器环境
  if (_isBrowserEnv) {
    try {
      // @ts-ignore
      _isBrowserEnv = !tt;
    } catch (err: any) {
      _isBrowserEnv = true;
    }
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
