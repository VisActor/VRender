declare const require: (id: string) => any;

describe('react-vrender util/debug', () => {
  test('__DEV__=true exposes log and throws error', () => {
    const debug = require('../../../src/util/debug');

    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined as any);
    debug.log('a', 1);
    expect(spy).toHaveBeenCalled();

    expect(() => debug.error('boom')).toThrow('boom');

    spy.mockRestore();
  });

  test('__DEV__=false becomes noop', () => {
    jest.resetModules();
    (globalThis as any).__DEV__ = false;

    const debug = require('../../../src/util/debug');

    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined as any);
    expect(() => debug.error('boom')).not.toThrow();
    debug.log('a', 1);
    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();

    // restore default for other suites
    (globalThis as any).__DEV__ = true;
  });
});
