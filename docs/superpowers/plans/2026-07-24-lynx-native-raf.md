# Lynx Native RAF Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Lynx environment prefer the host's native animation-frame scheduler while preserving the existing timeout-backed fallback.

**Architecture:** Select and bind one request/cancel scheduler pair during `LynxEnvContribution.configure()`. The animation hot path reads stable cached functions, and incomplete native capability falls back atomically to `rafBasedSto`.

**Tech Stack:** TypeScript 4.9, Jest 26, Rush

## Global Constraints

- Native `requestAnimationFrame` and `cancelAnimationFrame` must be used only when both are functions.
- Native methods must retain the Lynx runtime as their `this` receiver.
- Missing or incomplete native capability must preserve the existing `rafBasedSto` behavior.
- Do not change ticker semantics or non-Lynx environments.
- Capability selection must stay out of the per-frame animation path.

---

### Task 1: Select the Lynx animation-frame scheduler pair

**Files:**
- Modify: `packages/vrender-kits/__tests__/unit/lynx-window-event.test.ts`
- Modify: `packages/vrender-kits/src/env/contributions/lynx-contribution.ts`

**Interfaces:**
- Consumes: `LynxEnvContribution.configure(service, params)`, `rafBasedSto.call(callback)`, and `rafBasedSto.clear(handle)`.
- Produces: `getRequestAnimationFrame(): (callback: FrameRequestCallback) => number` and `getCancelAnimationFrame(): (handle: number) => void`, backed by one scheduler pair selected during configuration.

- [ ] **Step 1: Add focused scheduler tests**

Add tests inside the existing `describe('lynx window event contribution', ...)` block:

```ts
test('uses the complete native lynx animation frame scheduler pair', () => {
  const env = new LynxEnvContribution();
  const service = {
    env: 'lynx',
    setActiveEnvContribution: jest.fn()
  };
  let requestReceiver: unknown;
  let cancelReceiver: unknown;
  let scheduledCallback: FrameRequestCallback;
  let cancelledHandle: number;
  const runtime = {
    requestAnimationFrame(this: unknown, callback: FrameRequestCallback) {
      requestReceiver = this;
      scheduledCallback = callback;
      return 17;
    },
    cancelAnimationFrame(this: unknown, handle: number) {
      cancelReceiver = this;
      cancelledHandle = handle;
    }
  };
  const callback = jest.fn();

  env.configure(service as any, { lynx: runtime });

  expect(env.getRequestAnimationFrame()(callback)).toBe(17);
  env.getCancelAnimationFrame()(17);

  expect(requestReceiver).toBe(runtime);
  expect(cancelReceiver).toBe(runtime);
  expect(scheduledCallback).toBe(callback);
  expect(cancelledHandle).toBe(17);
});

test('falls back as a pair when the native lynx scheduler is incomplete', () => {
  jest.useFakeTimers();
  try {
    const env = new LynxEnvContribution();
    const service = {
      env: 'lynx',
      setActiveEnvContribution: jest.fn()
    };
    const nativeRequest = jest.fn(() => 17);
    const callback = jest.fn();

    env.configure(service as any, {
      lynx: {
        requestAnimationFrame: nativeRequest
      }
    });

    const handle = env.getRequestAnimationFrame()(callback);
    env.getCancelAnimationFrame()(handle);
    jest.runOnlyPendingTimers();

    expect(nativeRequest).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  } finally {
    jest.useRealTimers();
  }
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
cd packages/vrender-kits
rushx test -- --runInBand __tests__/unit/lynx-window-event.test.ts
```

Expected: the native scheduler test fails because `getRequestAnimationFrame()` still schedules through `rafBasedSto`; the incomplete-scheduler fallback test passes.

- [ ] **Step 3: Implement scheduler selection**

Extend `LynxRuntime`:

```ts
requestAnimationFrame: (callback: FrameRequestCallback) => number;
cancelAnimationFrame: (handle: number) => void;
```

Add stable fallback functions near the Lynx runtime helpers:

```ts
const requestAnimationFrameBasedSTO = (callback: FrameRequestCallback): number => rafBasedSto.call(callback);
const cancelAnimationFrameBasedSTO = (handle: number): void => rafBasedSto.clear(handle);
```

Cache them on `LynxEnvContribution`:

```ts
private requestAnimationFrame = requestAnimationFrameBasedSTO;
private cancelAnimationFrame = cancelAnimationFrameBasedSTO;
```

After resolving `this.lynxRuntime` in `configure()`, atomically select the pair:

```ts
if (
  typeof this.lynxRuntime?.requestAnimationFrame === 'function' &&
  typeof this.lynxRuntime?.cancelAnimationFrame === 'function'
) {
  this.requestAnimationFrame = this.lynxRuntime.requestAnimationFrame.bind(this.lynxRuntime);
  this.cancelAnimationFrame = this.lynxRuntime.cancelAnimationFrame.bind(this.lynxRuntime);
} else {
  this.requestAnimationFrame = requestAnimationFrameBasedSTO;
  this.cancelAnimationFrame = cancelAnimationFrameBasedSTO;
}
```

Replace the legacy copied miniapp implementation:

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
cd packages/vrender-kits
rushx test -- --runInBand __tests__/unit/lynx-window-event.test.ts
```

Expected: all tests in `lynx-window-event.test.ts` pass with no warnings or open handles.

- [ ] **Step 5: Run impacted-package and entry validation**

Run:

```bash
cd packages/vrender-kits
rushx test -- --runInBand
rushx compile
./node_modules/.bin/eslint src/env/contributions/lynx-contribution.ts __tests__/unit/lynx-window-event.test.ts
cd ../vrender
rushx test -- --runInBand __tests__/unit/entries.test.ts __tests__/unit/shared-app.test.ts
```

Expected: every command exits with status 0.

- [ ] **Step 6: Review and commit the implementation**

Run:

```bash
git diff --check
git diff -- packages/vrender-kits/src/env/contributions/lynx-contribution.ts packages/vrender-kits/__tests__/unit/lynx-window-event.test.ts
git status --short
git add packages/vrender-kits/src/env/contributions/lynx-contribution.ts packages/vrender-kits/__tests__/unit/lynx-window-event.test.ts
git diff --cached --check
git commit -m "fix(lynx): prefer native animation frames"
```

Expected: the commit contains only the Lynx scheduler implementation and its tests.
