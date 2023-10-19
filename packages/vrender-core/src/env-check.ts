export function isBrowserEnv() {
  return new Function('try {return this===window;}catch(e){ return false;}')();
}

export function isNodeEnv() {
  return new Function('try {return this===global;}catch(e){return false;}')();
}

export function getCurrentEnv(): 'browser' | 'node' {
  return isBrowserEnv() ? 'browser' : 'node';
}
