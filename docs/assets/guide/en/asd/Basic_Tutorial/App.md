# App Capabilities and Usage

The VRender `App` is the application-level runtime object. It installs and owns renderers, pickers, plugins, environment contributions, and host capabilities. A `Stage` owns the concrete canvas, view size, layers, scenegraph, events, and rendering lifecycle.

In most scenarios, reuse the `App` and create one or more `Stage` instances for concrete canvases or business views. Do not frequently create and release the `App` during ordinary data updates, tab switches, chart-type switches, component-page switches, or scene switches.

## What App Owns

`App` owns application-level capabilities:

- Registers and holds renderers, pickers, graphic modules, and plugins.
- Binds browser, Node, mini-app, Lynx, Harmony, and other environment contributions.
- Stores app-scoped `envParams`, such as a host runtime, global `canvasFactory`, node-canvas package, or pixel ratio.
- Creates concrete stages through `app.createStage()`.
- Releases application-level resources through `app.release()`.

`Stage` owns concrete views:

- The concrete `canvas` name/id/object.
- The concrete `width`, `height`, and `dpr`.
- Layers, graphics, components, animations, events, and picking.
- `stage.release()` releases one view without requiring the whole `App` to be released.

## Creating an App

Use the environment-specific entry point:

```ts
import { createBrowserVRenderApp } from '@visactor/vrender';

const app = createBrowserVRenderApp();

const stage = app.createStage({
  container: document.getElementById('container'),
  width: 600,
  height: 400,
  autoRender: true
});
```

Available multi-platform entries include:

- `createBrowserVRenderApp()`
- `createNodeVRenderApp()`
- `createTaroVRenderApp()`
- `createFeishuVRenderApp()`
- `createTTVRenderApp()`
- `createWxVRenderApp()`
- `createLynxVRenderApp()`
- `createHarmonyVRenderApp()`

These entries perform app-level environment initialization. Upper-level libraries should prefer these entries or the shared App helpers instead of maintaining duplicated environment registration logic.

## Reuse App, Create Stage Per View

If the same page, container scope, host canvas management scope, or service process repeatedly creates VRender views, reuse the same `App`:

```ts
const chartStage = app.createStage({
  canvas: 'chart-canvas',
  width: 360,
  height: 240,
  dpr: pixelRatio
});

const tableStage = app.createStage({
  canvas: 'table-canvas',
  width: 360,
  height: 320,
  dpr: pixelRatio
});
```

Each consumer manages only its own `Stage`. When a chart or table is destroyed, release that `Stage`:

```ts
chartStage.release();
```

Release the `App` only when the whole page, container, host runtime, or service process ends:

```ts
app.release();
```

## Do Not Recreate App for Ordinary Updates

The following operations usually do not need a new `App`:

- Data updates.
- Graphic attribute updates.
- Chart type switches.
- Theme switches.
- Tab or scene switches.
- Component panel switches.
- Animation start/stop.

Prefer updating the existing scenegraph, or clearing old graphics and rebuilding them:

```ts
stage.defaultLayer.removeAllChild(true);
// rebuild or update scenegraph
stage.render();
```

If a canvas or view must be replaced, release the old `Stage` and create a new `Stage` from the same `App`:

```ts
stage.release();

const nextStage = app.createStage({
  canvas: 'next-canvas',
  width: 480,
  height: 320,
  dpr: pixelRatio
});
```

Release and recreate the `App` only when app-level environment capabilities change, or when the host page, component, or runtime lifecycle ends.

## Shared App

When multiple upper-level libraries on the same page use VRender, such as one VChart chart and one VTable table, the host or integration layer can use `acquireSharedVRenderApp()`:

```ts
import { acquireSharedVRenderApp } from '@visactor/vrender';

const handle = acquireSharedVRenderApp({
  env: 'harmony',
  key: 'page-main',
  envParams: {
    pixelRatio,
    canvasFactory
  }
});

const stage = handle.app.createStage({
  canvas: 'chart-canvas',
  width: 360,
  height: 240,
  dpr: pixelRatio
});
```

`env + key` is the shared identity. The same `env + key` reuses the same `App`; different keys create different apps.

On disposal, each acquirer releases its own `Stage`, then releases its handle:

```ts
stage.release();
handle.release();
```

`handle.release()` is reference-counted: the underlying `App` is released only after the last handle is released.

If the host needs to force release a shared `App`, use:

```ts
import { releaseSharedVRenderApp } from '@visactor/vrender';

releaseSharedVRenderApp('harmony', 'page-main');
```

If the host only needs to query whether a shared `App` exists, use:

```ts
import { getSharedVRenderApp } from '@visactor/vrender';

const app = getSharedVRenderApp('harmony', 'page-main');
```

## envParams Boundaries

`envParams` are app-level parameters. They should only contain environment capabilities that are valid for the whole `App`.

Good `envParams` contents:

- Environment-level defaults such as `pixelRatio`.
- The node-canvas package in Node.
- Lynx, Harmony, or other host runtimes.
- A `canvasFactory` that can create Canvas objects for any Stage under the same app.
- Mini-app host context that is valid for the whole app or page component.

Do not put the following into `envParams`:

- A concrete chart canvas id.
- The width/height of one concrete view.
- A dpr override for one concrete Stage.
- Event state private to one component instance.
- A Canvas object that is valid for only one Stage.

Concrete view parameters belong to `app.createStage()`:

```ts
const stage = app.createStage({
  canvas: 'chart-canvas',
  width: 360,
  height: 240,
  dpr: pixelRatio
});
```

If a capability is placed on the `App`, the integration layer must guarantee it is valid for every VRender consumer using the same shared key. VRender does not merge or validate later `envParams` for the same key; the first creator decides the environment capabilities of the shared `App`.

If two consumers require different app-level environment capabilities, use different shared keys.

## Platform Notes

### Browser

Browser integrations should also reuse the `App`. Multiple visual views on the same page can share one browser app and create their own stages. Ordinary data updates or in-route tab switches should not recreate the `App`.

### Node

In Node, `envParams` are usually the node-canvas package capability. Reuse the `App` in long-running services, batch rendering jobs, or worker processes. One-off scripts can release the `Stage` and `App` at the end of the task.

### Mini-App / Taro / Feishu / TT / Wx

Mini-app host canvas capabilities are usually tied to the page component lifecycle. Reuse the `App` by page or component instance, and create a separate `Stage` for each canvas view. If the host needs a canvas pool, that pool is an environment capability and must be valid for all consumers sharing the same `App`.

### Lynx

In Lynx, prefer a page-level or host-view-level shared `App`. An old smoke path once coupled app recreation, Canvas view binding, scenegraph cleanup, and redraw, which caused visible stutter during repeated switches. The current recommendation is to reuse the `App`, switch the scenegraph for ordinary page changes, and recreate the `Stage` only on low-frequency lifecycle boundaries.

### Harmony

In Harmony, use `createHarmonyVRenderApp()` or `acquireSharedVRenderApp({ env: 'harmony' })`. A `canvasFactory` can be app-scoped only if it can return a drawable host Canvas-like object for any `id/width/height/dpr` passed by a Stage. Concrete Canvas ids and dimensions still belong to `Stage`.

## Recommended Lifecycle

When the page or host container initializes:

```ts
const handle = acquireSharedVRenderApp({
  env: 'browser',
  key: 'page-main'
});
```

When creating one visualization view:

```ts
const stage = handle.app.createStage({
  container,
  width,
  height,
  autoRender: true
});
```

During business updates:

```ts
// update attributes, data, states, animations, or scenegraph
stage.render();
```

When one view is destroyed:

```ts
stage.release();
handle.release();
```

When the page is fully unmounted or the host wants to force cleanup:

```ts
releaseSharedVRenderApp('browser', 'page-main');
```
