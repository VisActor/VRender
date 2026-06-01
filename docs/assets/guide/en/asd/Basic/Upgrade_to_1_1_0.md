# VRender 1.1.0 Upgrade Guide

VRender 1.1.0 is a stable release for the state system, animation semantics, and app-scoped multi-environment runtime. The main contract is that state styles, animation frames, and static graphic attributes are now clearly separated.

This guide is for users upgrading from 1.0.x or a 1.1.0 alpha version, especially projects that use VRender through VChart, VTable, or custom rendering integrations.

## Install

After the release is published:

```bash
npm install @visactor/vrender@1.1.0
```

If you depend on individual VRender packages, keep `@visactor/vrender-core`, `@visactor/vrender-animate`, `@visactor/vrender-components`, and `@visactor/vrender-kits` on the same version.

## Highlights

### State System

The static truth model is:

```text
baseAttributes + resolvedStatePatch -> attribute
```

Key changes:

- `sharedStateDefinitions` is the recommended surface for shared state definitions.
- `graphic.setStates(states, { animate, animateSameStatePatchChange })` supports same-state refresh and same-state patch change animation.
- Dynamic resolvers receive a valid `StateResolveContext.graphic`.
- `graphic.states` is the local graphic state-definition surface. Shared states should use `sharedStateDefinitions`.
- Dynamic state styles should be written as `StateDefinition.resolver`; `graphic.stateProxy` has been removed.

### Animation

Key changes:

- Animation frames are not the static truth source.
- For appear/fade animations, set the final static attributes first, then use `animate().from(...)` for the start frame.
- `animate().to(...)` should not be used as the API that commits endpoints to `baseAttributes`.
- Sibling update animation configs no longer pre-commit attributes owned by another update item.
- Built-in `TagPointsUpdate` can read target `points/segments` from the standard update target source.
- `scaleIn` now supports `fromScale`, `fromScaleX`, and `fromScaleY`.

### App-Scoped Runtime

Recommended app creators:

- `createBrowserVRenderApp()`
- `createNodeVRenderApp()`
- `createWxVRenderApp()`
- `createLynxVRenderApp()`
- `createHarmonyVRenderApp()`

Create concrete views with `app.createStage()`. The old root-level `createStage()` remains as a compatibility surface, but new code should use app-scoped entries.

## Recommended Setup

### Browser

```ts
import { createBrowserVRenderApp } from '@visactor/vrender';

const app = createBrowserVRenderApp();

const stage = app.createStage({
  container: document.getElementById('container'),
  width: 800,
  height: 600,
  autoRender: true
});
```

Release:

```ts
stage.release();
app.release();
```

### Node

Pass the node-canvas compatible package through `envParams`:

```ts
import { createNodeVRenderApp } from '@visactor/vrender';
import * as CanvasPkg from 'canvas';

const app = createNodeVRenderApp({
  envParams: CanvasPkg
});

const stage = app.createStage({
  width: 800,
  height: 600
});
```

The 1.1.0 release verification uses Node `20.19.6`. Make sure your Node version matches the native ABI required by your installed `canvas` package.

### Miniapp, Lynx, and Harmony

```ts
import { createWxVRenderApp, createLynxVRenderApp, createHarmonyVRenderApp } from '@visactor/vrender';
```

Guidelines:

- Put only app-scoped environment capabilities in `envParams`, such as host runtime, a reusable `canvasFactory`, or `pixelRatio`.
- Put concrete canvas id/name/object, width, height, and dpr in `app.createStage()`.
- Do not recreate and release the App for ordinary data updates or scene switches.

Example:

```ts
const app = createLynxVRenderApp({
  envParams: {
    lynx,
    canvasFactory
  }
});

const stage = app.createStage({
  canvas: 'main-canvas',
  width,
  height,
  dpr: pixelRatio
});
```

## Shared App

When multiple upper-layer products share VRender in the same page or host container, use a shared app:

```ts
import { acquireSharedVRenderApp } from '@visactor/vrender';

const handle = acquireSharedVRenderApp({
  env: 'browser',
  key: 'dashboard-main'
});

const stage = handle.app.createStage({
  container,
  width,
  height
});
```

Release:

```ts
stage.release();
handle.release();
```

The same `env + key` reuses the same App. `handle.release()` is reference-counted and releases the underlying App only after the last handle is released.

## State Migration

### Shared State Definitions

```ts
const group = createGroup({});

group.sharedStateDefinitions = {
  hover: {
    patch: {
      fillOpacity: 0.2
    }
  },
  highlight: {
    resolver({ graphic, baseAttributes }) {
      return {
        lineWidth: graphic.context?.selected ? 3 : baseAttributes.lineWidth
      };
    },
    declaredAffectedKeys: ['lineWidth']
  }
};
```

Resolvers can read `graphic`, `baseAttributes`, `activeStates`, `effectiveStates`, and the current `resolvedPatch`. If a resolver depends on external inputs, declare `declaredAffectedKeys` so VRender can diff and animate the patch correctly.

### Refresh States

Recommended:

```ts
graphic.setStates(['custom1'], {
  animate: true,
  animateSameStatePatchChange: true
});
```

Do not call `clearStates()` before `setStates()` just to refresh the same state. That loses the previous resolved patch and can make the graphic flash back to normal attributes before animating into the state attributes again.

The old signature is still supported:

```ts
graphic.setStates(['hover'], true);
```

For new code, prefer the options form.

## Animation Migration

### Appear and Fade

Recommended:

```ts
graphic.setAttribute({
  opacity: 1
});

graphic.animate().from(
  {
    opacity: 0
  },
  300,
  'linear'
);
```

Do not rely on the following pattern to commit static truth:

```ts
graphic.setAttribute({ opacity: 0 });
graphic.animate().to({ opacity: 1 }, 300, 'linear');
```

`to()` describes an animation endpoint, not a `baseAttributes` commit API.

### scaleIn Start Scale

`scaleIn` supports explicit start scales:

```ts
{
  type: 'scaleIn',
  options: {
    fromScale: 0
  }
}
```

If the final attributes are:

```ts
{
  scaleX: 2,
  scaleY: 3
}
```

the animation runs from `0 -> 2` and `0 -> 3`. Without `fromScale`, the default behavior is unchanged: VRender infers the start from the current `attribute.scaleX/scaleY ?? 0`.

Axis-specific options are also supported:

```ts
{
  type: 'scaleIn',
  options: {
    fromScaleX: 0,
    fromScaleY: 0.5
  }
}
```

## Environment Matrix

Stable default environments in 1.1.0:

| Environment | Status |
| --- | --- |
| Browser | Stable |
| Node | Stable |
| wx miniapp | Stable |
| Lynx | Stable |
| Harmony | Stable |

Public entries that still require project-level real-host smoke before Tier 1 claims:

| Environment | Recommendation |
| --- | --- |
| Taro | Entry retained, verify on real host before stable claims |
| Feishu | Entry retained, verify on real host before stable claims |
| TT | Entry retained, verify on real host before stable claims |

`native` is not part of the 1.1.0 stable default contract.

## Glyph Boundary

`Glyph` remains a special surface. VRender 1.1.0 does not merge `glyphStates`, `glyphStateProxy`, or `subAttributes` into the shared-state main path.

Current behavior remains:

- State attributes apply to the glyph itself.
- Sub-graphic ownership is not redefined by the D3 shared-state model.
- If your business logic depends on glyph sub-graphic states, keep using glyph-specific APIs or upper-layer conventions.

## Migration Checklist

1. Search old runtime entries:

```bash
rg "createStage\\("
rg "initAllEnv|initBrowserEnv|loadBrowserEnv|loadNodeEnv|loadAllEnv"
```

Move new code to environment-specific `create*VRenderApp()` and `app.createStage()`.

2. Search old state patterns:

```bash
rg "clearStates\\("
rg "normalAttrs"
rg "stateProxy"
rg "graphic\\.states|\\.states\\s*="
```

Avoid `clearStates()` before same-state refresh. Do not use `normalAttrs` as a snapshot or restore source. Replace `stateProxy` with `states` + `StateDefinition.resolver` or `sharedStateDefinitions`.

If you maintain VChart, VTable, or another upper-layer integration, also check the D3 removal log for deleted pre-release APIs and old call chains:

- [D3_REMOVED_API_AND_CALL_CHAIN_LOG.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_REMOVED_API_AND_CALL_CHAIN_LOG.md)

3. Check appear/fade animations:

- Set final static attributes first.
- Use `animate().from(...)` for the start frame.
- Do not rely on `animate().to(...)` to write `baseAttributes`.

4. Check `scaleIn`:

- If the business expectation is to scale in from invisible, pass `options.fromScale: 0`.
- Do not encode the animation start by writing final style `scaleX: 0` or `scaleY: 0`.

5. Check environments:

- Keep Browser and Node smoke tests.
- If wx, Lynx, or Harmony are used, verify rendering, animation, event picking, and release in the real host.
- Do not expand stable claims for Taro, Feishu, or TT before real-host smoke.

## Troubleshooting

### A graphic flashes back to normal attributes after update

This usually means the caller clears states before setting the same states again. Use:

```ts
graphic.setStates(nextStates, {
  animate: true,
  animateSameStatePatchChange: true
});
```

### Same-state patch changes do not animate

Make sure both flags are enabled:

```ts
{
  animate: true,
  animateSameStatePatchChange: true
}
```

Also make sure shared definitions or resolver inputs are actually invalidated and recomputed.

### A fade appear graphic disappears after animation

Set the final static attributes first, then use `animate().from(...)` for the start frame.

### scaleIn has no visible scale animation

If final attrs already include `scaleX/scaleY`, the default inferred start can equal the final scale. Pass:

```ts
{
  type: 'scaleIn',
  options: { fromScale: 0 }
}
```

### Node image export fails

Check:

- Node version matches the native ABI of the installed `canvas` package.
- The node-canvas package is passed through `createNodeVRenderApp({ envParams })`.
- Stage has explicit `width` and `height`.

## Not Included in the 1.1.0 Stable Contract

- Tier 1 claims for Taro, Feishu, or TT.
- Full multi-environment isolation inside one JS runtime.
- Fine-grained on-demand assembly as an equivalent replacement for root package defaults.
- Moving glyph sub-graphic state into the shared-state main path.
- Additional memory or constructor representation optimizations.
