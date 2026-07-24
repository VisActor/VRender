# Lynx Native RAF Backport Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `dev/0.22.x` Lynx environment prefer the global Lynx runtime's native animation-frame scheduler while retaining the existing timeout fallback.

**Architecture:** Select and bind one request/cancel scheduler pair during `LynxEnvContribution.configure()`. Cache the pair on the contribution so animation consumers receive stable functions, and use the existing `rafBasedSto` request/cancel functions atomically when either native API is unavailable.

**Tech Stack:** TypeScript 4.9, Jest 26, Rush

## Global Constraints

- Use only the existing global `lynx` object; do not add runtime injection or change the public `configure()` parameters.
- Use native `requestAnimationFrame` and `cancelAnimationFrame` only when both are functions.
- Bind both native methods to the global `lynx` object.
- Re-evaluate the scheduler pair on every successful Lynx `configure()` call.
- Keep capability detection and function binding out of the per-frame path.
- Preserve `rafBasedSto` behavior for incomplete native capability.
- Do not change non-Lynx environments, ticker semantics, canvas behavior, or event behavior.

## File Structure

- `packages/vrender/__tests__/lynx-raf.test.ts`: focused regression coverage using the Jest setup already owned by `@visactor/vrender`.
- `packages/vrender-kits/src/env/contributions/lynx-contribution.ts`: global Lynx capability typing, configure-time scheduler selection, cached request/cancel accessors.

---

### Task 1: Select the global Lynx animation-frame scheduler pair

**Files:**
- Create: `packages/vrender/__tests__/lynx-raf.test.ts`
- Modify: `packages/vrender-kits/src/env/contributions/lynx-contribution.ts`

**Interfaces:**
- Consumes: `LynxEnvContribution.configure(service, params)`, global `lynx.requestAnimationFrame`, global `lynx.cancelAnimationFrame`, `rafBasedSto.call(callback)`, and `rafBasedSto.clear(handle)`.
- Produces: `getRequestAnimationFrame(): (callback: FrameRequestCallback) => number` and `getCancelAnimationFrame(): (handle: number) => void`, backed by one pair selected during configuration.

- [ ] **Step 1: Write the focused regression tests**

Create `packages/vrender/__tests__/lynx-raf.test.ts`:

```ts
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
  jest.useRealTimers();
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
    jest.useFakeTimers();
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
    jest.runOnlyPendingTimers();

    expect(previousRequestCalls).toBe(0);
    expect(previousCancelCalls).toBe(0);
    expect(incompleteRequestCalls).toBe(0);
    expect(callbackCalls).toBe(0);
  });
});
```

The first test catches selection of the timeout fallback, loss of the Lynx receiver, or incorrect callback/handle forwarding. The second catches independently selected request/cancel functions and stale cached functions after repeated configuration.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
cd packages/vrender
rushx test -- --runInBand __tests__/lynx-raf.test.ts
```

Expected: the first test fails because the current contribution returns a `rafBasedSto` handle instead of literal host handle `17`. The scheduled fallback is cancelled before the assertion, so the run must not leave an open timer.

- [ ] **Step 3: Implement configure-time scheduler selection**

Extend the existing global `lynx` declaration:

```ts
declare const lynx: {
  getSystemInfoSync: () => { pixelRatio: number };
  createCanvas: (id: string) => any;
  createCanvasNG: (id: string) => any;
  createImage: (id: string) => any;
  createOffscreenCanvas: () => any;
  requestAnimationFrame?: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame?: (handle: number) => void;
};
```

Immediately after the existing `ng` capability initialization, add stable fallback functions:

```ts
const requestAnimationFrameBasedSTO = (callback: FrameRequestCallback): number => rafBasedSto.call(callback);
const cancelAnimationFrameBasedSTO = (handle: number): void => rafBasedSto.clear(handle);
```

Add cached fields after `canvasIdx`:

```ts
private requestAnimationFrame = requestAnimationFrameBasedSTO;
private cancelAnimationFrame = cancelAnimationFrameBasedSTO;
```

Inside the Lynx branch of `configure()`, immediately after the existing `makeUpCanvas(...)` call, select the pair atomically:

```ts
if (typeof lynx.requestAnimationFrame === 'function' && typeof lynx.cancelAnimationFrame === 'function') {
  this.requestAnimationFrame = lynx.requestAnimationFrame.bind(lynx);
  this.cancelAnimationFrame = lynx.cancelAnimationFrame.bind(lynx);
} else {
  this.requestAnimationFrame = requestAnimationFrameBasedSTO;
  this.cancelAnimationFrame = cancelAnimationFrameBasedSTO;
}
```

Replace the existing request/cancel getters:

```ts
getRequestAnimationFrame(): (callback: FrameRequestCallback) => number {
  return this.requestAnimationFrame;
}

getCancelAnimationFrame(): (handle: number) => void {
  return this.cancelAnimationFrame;
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
cd packages/vrender
rushx test -- --runInBand __tests__/lynx-raf.test.ts
```

Expected: both tests pass with zero failures, no open-handle warning, and no unexpected console output.

- [ ] **Step 5: Run impacted-package validation**

Run:

```bash
cd packages/vrender
rushx test -- --runInBand
rushx compile
./node_modules/.bin/eslint __tests__/lynx-raf.test.ts

cd ../vrender-kits
rushx compile
./node_modules/.bin/eslint src/env/contributions/lynx-contribution.ts

cd ../..
git diff --check
git status --short
```

Expected:

- The complete `@visactor/vrender` Jest suite reports zero failed suites and zero failed tests.
- Both TypeScript compile commands exit with status `0`.
- Both ESLint commands exit with status `0` and do not rewrite files.
- `git diff --check` emits no output.
- Git status lists only the implementation source and focused test.

- [ ] **Step 6: Review and commit the implementation**

Run:

```bash
git diff -- packages/vrender-kits/src/env/contributions/lynx-contribution.ts packages/vrender/__tests__/lynx-raf.test.ts
git add packages/vrender-kits/src/env/contributions/lynx-contribution.ts packages/vrender/__tests__/lynx-raf.test.ts
git diff --cached --check
git diff --cached --stat
git commit -m "fix(lynx): prefer native animation frames"
git status --short --branch
```

Expected: the commit contains only the Lynx scheduler implementation and its focused regression test; the worktree is clean and the branch is ahead of `origin/dev/0.22.x` by the design, plan, and implementation commits.
