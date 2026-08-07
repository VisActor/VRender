# Lynx Native RAF Design

## Context

`LynxEnvContribution` currently implements VRender's animation-frame API with
`rafBasedSto`, which is backed by `setTimeout`. Modern Lynx runtimes expose
`requestAnimationFrame` and `cancelAnimationFrame`, so the current default does
not align animation ticks with the host's VSYNC.

## Goal

Use the Lynx runtime's native animation-frame scheduler by default while
preserving compatibility with hosts that do not expose the complete native
scheduler pair.

## Non-goals

- Change ticker or timeline semantics in `@visactor/vrender-animate`.
- Change animation scheduling for browser, Node, Harmony, Feishu, TT, WX, or
  Taro environments.
- Add a new public scheduler option to Lynx environment parameters.

## Design

Extend the internal `LynxRuntime` type with `requestAnimationFrame` and
`cancelAnimationFrame`.

`LynxEnvContribution.configure()` selects the scheduler once:

- If both native methods are functions, bind both methods to the selected Lynx
  runtime and cache them.
- If either method is unavailable, cache the existing `rafBasedSto` request and
  cancel functions as a pair.

`getRequestAnimationFrame()` and `getCancelAnimationFrame()` return the cached
functions without repeated capability checks or wrapper allocation in the
animation scheduling path.

Treating request and cancel as an atomic pair prevents a native RAF handle from
being passed to `clearTimeout`, or a timeout handle from being passed to the
native Lynx cancellation API.

## Compatibility and lifecycle

The existing `rafBasedSto` behavior remains the fallback, so older or restricted
Lynx hosts retain their current animation behavior. Scheduler selection follows
the existing environment lifecycle: a later `configure()` call re-evaluates the
runtime and replaces the cached pair.

Native methods are bound to the runtime object because a host implementation may
depend on its receiver.

## Tests

Add focused unit coverage in the existing Lynx environment test file:

- A complete native scheduler pair is preferred, returns the host handle, calls
  both host methods with the Lynx runtime as `this`, and forwards the callback.
- A runtime with an incomplete native scheduler pair uses `rafBasedSto` for both
  request and cancellation.

The new native-scheduler test must fail before the implementation is added.

## Validation

Run:

- The focused Lynx environment unit test.
- The full `@visactor/vrender-kits` unit test suite.
- `rushx compile` in `packages/vrender-kits`.
- ESLint for the changed source and test files without automatic fixes.

No benchmark is required because the change removes timer adaptation from the
default Lynx path and performs capability selection only during environment
configuration, not per animation frame.
