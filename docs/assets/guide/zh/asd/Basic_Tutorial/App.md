# App 能力与使用建议

VRender 的 `App` 是应用级运行时对象。它负责安装和持有渲染器、拾取器、插件、环境贡献和跨端宿主能力；`Stage` 则负责具体画布、视图尺寸、图层、场景树、事件和渲染生命周期。

在绝大多数场景下，都建议复用 `App`，再按具体画布或业务视图创建一个或多个 `Stage`。不要在普通数据更新、页签切换、图表类型切换、组件页切换或场景切换中频繁创建和释放 `App`。

## App 负责什么

`App` 主要负责应用级能力：

- 注册和持有 renderer、picker、graphic modules、plugin 等渲染基础设施。
- 绑定 browser、node、小程序、Lynx、Harmony 等环境贡献。
- 保存 app-scoped `envParams`，例如全局 runtime、全局 `canvasFactory`、node-canvas 包、像素比等环境能力。
- 通过 `app.createStage()` 创建具体 `Stage`。
- 在 `app.release()` 时释放应用级资源。

`Stage` 主要负责具体视图：

- 具体 `canvas` name/id/对象。
- 具体 `width`、`height`、`dpr`。
- 图层、图元、组件、动画、事件和拾取。
- `stage.release()` 释放某个视图，而不要求释放整个 `App`。

## 创建 App

推荐使用面向环境的入口创建 `App`：

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

多端入口包括：

- `createBrowserVRenderApp()`
- `createNodeVRenderApp()`
- `createTaroVRenderApp()`
- `createFeishuVRenderApp()`
- `createTTVRenderApp()`
- `createWxVRenderApp()`
- `createLynxVRenderApp()`
- `createHarmonyVRenderApp()`

这些入口会完成对应环境的 app 级初始化。上层库应优先走这些入口或共享 App 工具，而不是直接重复维护环境注册逻辑。

## 复用 App，按视图创建 Stage

同一个页面、同一个容器范围、同一个宿主 Canvas 管理域或同一个服务进程内，如果会反复创建 VRender 视图，应复用同一个 `App`：

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

每个使用者只管理自己的 `Stage`。当图表或表格销毁时，释放对应 `Stage`：

```ts
chartStage.release();
```

当整个页面、容器、宿主 runtime 或服务进程结束时，再释放 `App`：

```ts
app.release();
```

## 普通更新不要重建 App

以下操作通常不需要重建 `App`：

- 数据更新。
- 图元属性更新。
- 图表类型切换。
- 主题切换。
- 页签或场景切换。
- 组件面板切换。
- 动画启停。

优先更新现有 scenegraph，或清理旧图元后重建图元：

```ts
stage.defaultLayer.removeAllChild(true);
// rebuild or update scenegraph
stage.render();
```

如果确实需要换一个画布或彻底重建视图，可以释放旧 `Stage`，再用同一个 `App` 创建新 `Stage`：

```ts
stage.release();

const nextStage = app.createStage({
  canvas: 'next-canvas',
  width: 480,
  height: 320,
  dpr: pixelRatio
});
```

只有当 app 级环境能力发生变化，或宿主页面、组件、runtime 生命周期结束时，才应该释放并重建 `App`。

## 共享 App

当同一页面里有多个上层库都使用 VRender，例如一个 VChart 图表和一个 VTable 表格，宿主或接入层可以使用 `acquireSharedVRenderApp()` 获取共享 `App`：

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

`env + key` 是共享身份。相同 `env + key` 会复用同一个 `App`，不同 key 会创建不同 `App`。

释放时，每个获取者释放自己的 `Stage`，再释放自己的 handle：

```ts
stage.release();
handle.release();
```

`handle.release()` 带引用计数语义：只有最后一个 handle 释放时，底层 `App` 才会真正释放。

如果宿主需要强制释放某个共享 `App`，可以使用：

```ts
import { releaseSharedVRenderApp } from '@visactor/vrender';

releaseSharedVRenderApp('harmony', 'page-main');
```

如果只想查询共享 `App` 是否存在，可以使用：

```ts
import { getSharedVRenderApp } from '@visactor/vrender';

const app = getSharedVRenderApp('harmony', 'page-main');
```

## envParams 的边界

`envParams` 是 app 级参数。它应该只包含对整个 `App` 都有效的环境能力。

适合放在 `envParams` 中的内容：

- `pixelRatio` 这类环境级默认值。
- node 环境的 node-canvas 包能力。
- Lynx/Harmony 等宿主 runtime。
- 可为同一个 app 下任意 Stage 创建 Canvas 的 `canvasFactory`。
- 小程序环境中对整个 app scope 都有效的宿主 runtime 或 `canvasFactory`。

不适合放在 `envParams` 中的内容：

- 某一个具体图表的 canvas id。
- 某一个具体视图的 width/height。
- 某一个具体 Stage 的 dpr 覆盖值。
- 某一个组件实例私有的事件状态。
- 只对某个 Stage 有效的 Canvas 对象。
- 旧小程序接入中的 `domref`、`canvasIdLists`、`freeCanvasIdx`。

这些具体视图参数应放在 `app.createStage()` 中：

```ts
const stage = app.createStage({
  canvas: 'chart-canvas',
  width: 360,
  height: 240,
  dpr: pixelRatio
});
```

如果一个能力被放到 `App` 上，接入层必须保证它对同一个共享 key 下的所有 VRender 使用者都成立。VRender 不会为后续相同 key 的调用者合并或校验新的 `envParams`；第一个创建者的 `envParams` 会决定这个共享 `App` 的环境能力。

如果两个使用者需要不同的 app 级环境能力，应使用不同的共享 key。

## 各端注意事项

### Browser

Browser 端也建议复用 `App`。页面中多个可视化视图可以共享同一个 browser app，各自创建 `Stage`。普通数据更新或路由内页签切换不应重建 `App`。

### Node

Node 端 `envParams` 通常是 node-canvas 包能力。持续服务、批量渲染任务或 worker 进程中应复用 `App`；一次性脚本可以在任务结束后释放 `Stage` 和 `App`。

### 小程序 / Taro / Feishu / TT / Wx

小程序类环境的宿主 canvas 能力通常和页面组件生命周期绑定。建议按页面或组件实例复用 `App`，每个 canvas 视图创建自己的 `Stage`。具体 Canvas 节点或 canvas id、宽高、dpr 都应放在 `app.createStage()` 中。

旧接入里常见的 `domref` / `canvasIdLists` / `freeCanvasIdx` 不再属于 app 级参数。wx 等端如果能拿到原生 Canvas 节点，优先直接传给 Stage；如果只能传字符串 id，则需要提供对当前共享 `App` 全局有效的 `canvasFactory` 或宿主 runtime，让 VRender 在 Stage/Layer 创建时按 `{ id, width, height, dpr }` 懒创建 Canvas。

### Lynx

Lynx 下应尽量使用页面级或宿主 view 级共享 `App`。旧 smoke 路径曾把 app 重建、Canvas view 绑定、scenegraph 清理和重绘耦合在一起，连续切换时出现过明显卡顿。当前建议是复用 `App`，普通切页只切换 scenegraph 或低频重建 `Stage`。

### Harmony

Harmony 下推荐使用 `createHarmonyVRenderApp()` 或 `acquireSharedVRenderApp({ env: 'harmony' })`。`canvasFactory` 可以作为 app 级能力，但它必须能根据任意 Stage 传入的 `id/width/height/dpr` 返回可绘制的宿主 Canvas-like 对象。具体 Canvas id 和尺寸仍属于 `Stage`。

## 推荐生命周期

页面或宿主容器初始化时：

```ts
const handle = acquireSharedVRenderApp({
  env: 'browser',
  key: 'page-main'
});
```

创建某个可视化视图时：

```ts
const stage = handle.app.createStage({
  container,
  width,
  height,
  autoRender: true
});
```

业务更新时：

```ts
// update attributes, data, states, animations, or scenegraph
stage.render();
```

销毁某个视图时：

```ts
stage.release();
handle.release();
```

页面彻底卸载或宿主希望强制清理时：

```ts
releaseSharedVRenderApp('browser', 'page-main');
```
