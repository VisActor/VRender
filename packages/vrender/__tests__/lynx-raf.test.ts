import { LynxEnvContribution } from '../../vrender-kits/src/env/contributions/lynx-contribution';

type TestLynxRuntime = Partial<{
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (handle: number) => void;
}>;

const globalWithLynx = globalThis as typeof globalThis & { lynx?: TestLynxRuntime };
const hadOriginalLynx = Object.prototype.hasOwnProperty.call(globalWithLynx, 'lynx');
const originalLynx = globalWithLynx.lynx;

function configureLynx(env: LynxEnvContribution, runtime: TestLynxRuntime): void {
  globalWithLynx.lynx = runtime;
  env.configure(
    {
      env: 'lynx',
      setActiveEnvContribution: (): void => undefined
    } as any,
    {
      domref: { width: 0, height: 0 },
      canvasIdLists: [],
      freeCanvasIdx: 0,
      pixelRatio: 1
    }
  );
}

afterEach(() => {
  if (hadOriginalLynx) {
    globalWithLynx.lynx = originalLynx;
  } else {
    delete globalWithLynx.lynx;
  }
});

describe('lynx animation frame scheduler', () => {
  test('uses the complete native scheduler with the Lynx receiver and host handle', () => {
    const env = new LynxEnvContribution();
    let requestReceiver: unknown;
    let cancelReceiver: unknown;
    let scheduledCallback: FrameRequestCallback | undefined;
    let cancelledHandle: number | undefined;
    const runtime: TestLynxRuntime = {
      requestAnimationFrame(this: TestLynxRuntime, callback: FrameRequestCallback): number {
        requestReceiver = this;
        scheduledCallback = callback;
        return 17;
      },
      cancelAnimationFrame(this: TestLynxRuntime, handle: number): void {
        cancelReceiver = this;
        cancelledHandle = handle;
      }
    };
    const callback = (): void => undefined;

    configureLynx(env, runtime);

    const handle = env.getRequestAnimationFrame()(callback);
    env.getCancelAnimationFrame()(handle);

    expect(handle).toBe(17);
    expect(requestReceiver).toBe(runtime);
    expect(cancelReceiver).toBe(runtime);
    expect(scheduledCallback).toBe(callback);
    expect(cancelledHandle).toBe(17);
  });

  test('resets both schedulers to the timeout fallback when native capability becomes incomplete', () => {
    const env = new LynxEnvContribution();
    let previousRequestCalls = 0;
    let previousCancelCalls = 0;
    let incompleteRequestCalls = 0;
    let callbackCalls = 0;

    configureLynx(env, {
      requestAnimationFrame: (): number => {
        previousRequestCalls++;
        return 23;
      },
      cancelAnimationFrame: (): void => {
        previousCancelCalls++;
      }
    });
    configureLynx(env, {
      requestAnimationFrame: (): number => {
        incompleteRequestCalls++;
        return 17;
      }
    });

    const handle = env.getRequestAnimationFrame()(() => {
      callbackCalls++;
    });
    env.getCancelAnimationFrame()(handle);

    expect(previousRequestCalls).toBe(0);
    expect(previousCancelCalls).toBe(0);
    expect(incompleteRequestCalls).toBe(0);
    expect(callbackCalls).toBe(0);
  });
});
