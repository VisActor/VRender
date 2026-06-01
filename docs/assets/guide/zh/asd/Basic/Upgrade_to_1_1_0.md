# VRender 1.1.0 升级指南

VRender 1.1.0 是一次面向状态系统、动画语义和多端运行时接入方式的稳定版升级。核心变化是：状态样式、动画帧和静态属性真值的边界被明确拆开，跨端环境初始化也收敛到 App 级入口。

如果你使用 VRender 作为 VChart、VTable 或自研渲染层的底层依赖，建议在升级前阅读本文并按迁移清单检查项目。

## 适用范围

本文面向从 1.0.x 或 1.1.0 alpha 版本升级到 1.1.0 的用户，重点覆盖：

- 图元状态和 shared state。
- appear/update/state 动画。
- Browser、Node、小程序、Lynx、Harmony 等环境的创建方式。
- 上层库如何减少对 VRender 内部属性缓存的直接维护。

## 安装

正式发布后可以按常规方式安装：

```bash
npm install @visactor/vrender@1.1.0
```

如果你按包使用，也应保证 `@visactor/vrender-core`、`@visactor/vrender-animate`、`@visactor/vrender-components`、`@visactor/vrender-kits` 等 VisActor VRender 包版本一致。

## 重要变化概览

### 状态系统

1. 状态静态真值统一为：

```text
baseAttributes + resolvedStatePatch -> attribute
```

2. `sharedStateDefinitions` 是推荐的共享状态定义入口。
3. `graphic.setStates(states, { animate, animateSameStatePatchChange })` 支持同状态刷新和同状态 patch 变化动画。
4. 动态 resolver 会收到有效的 `StateResolveContext.graphic`。
5. `graphic.states` 是图元本地状态定义入口；共享状态优先使用 `sharedStateDefinitions`。动态状态属性应写成 `StateDefinition.resolver`，`graphic.stateProxy` 已移除。

### 动画系统

1. 动画帧不再是新的静态属性真值来源。
2. appear/fade 推荐写法是先设置最终静态属性，再使用 `animate().from(...)` 表示起始帧。
3. `animate().to(...)` 不应被当作“动画结束后写入 baseAttributes”的接口。
4. update 动画中的多个 sibling 配置不会再互相提前提交对方负责动画的属性。
5. 内置 `TagPointsUpdate` 可以从标准 update target 来源读取目标 `points/segments`。
6. `scaleIn` 新增可配置起点能力：`fromScale`、`fromScaleX`、`fromScaleY`。

### App 级运行时

1. 推荐使用环境专属 App 入口创建 VRender：
   - `createBrowserVRenderApp()`
   - `createNodeVRenderApp()`
   - `createWxVRenderApp()`
   - `createLynxVRenderApp()`
   - `createHarmonyVRenderApp()`
2. 使用 `app.createStage()` 创建具体视图。
3. 旧的根级 `createStage()` 仍作为兼容入口保留，但不推荐新代码继续使用。
4. 同一页面、容器或服务进程内如果会创建多个 VRender 视图，优先复用同一个 App。

## 推荐创建方式

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

页面或容器销毁时：

```ts
stage.release();
app.release();
```

### Node

Node 环境需要提供 node-canvas 兼容包：

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

持续服务、批量出图任务或 worker 进程中建议复用 App；一次性脚本可以在任务结束后释放 Stage 和 App。

当前 1.1.0 发布验证使用 Node `20.19.6`，建议你的 Node 版本与本地 `canvas` native 依赖 ABI 保持匹配。

### 小程序、Lynx、Harmony

```ts
import { createWxVRenderApp, createLynxVRenderApp, createHarmonyVRenderApp } from '@visactor/vrender';
```

这些端的建议是一致的：

- App 级 `envParams` 只放对整个 App 有效的环境能力，例如宿主 runtime、全局 `canvasFactory`、`pixelRatio`。
- 具体 canvas id/name/对象、宽高和 dpr 应放在 `app.createStage()` 参数中。
- 普通数据更新、场景切换或页签切换不应频繁释放并重建 App。

示例：

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

## 共享 App

当同一个页面或宿主容器内存在多个上层库，例如 VChart 和 VTable 同时使用 VRender，可以使用共享 App：

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

释放顺序：

```ts
stage.release();
handle.release();
```

相同 `env + key` 会复用同一个 App。`handle.release()` 带引用计数语义，最后一个 handle 释放后底层 App 才会真正释放。

## 状态系统迁移

### 使用 sharedStateDefinitions

推荐把跨图元共享状态定义放到 Group 或 Theme scope 中：

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

`resolver` 可以读取 `graphic`、`baseAttributes`、`activeStates`、`effectiveStates` 和当前已解析的 `resolvedPatch`。如果 resolver 依赖外部数据，建议声明 `declaredAffectedKeys`，让 VRender 能更准确地处理 patch diff 和动画。

### 刷新状态

1.1.0 推荐使用：

```ts
graphic.setStates(['custom1'], {
  animate: true,
  animateSameStatePatchChange: true
});
```

语义：

- `states` 是调用方刚计算出的目标状态集合。
- `animate` 控制状态集合变化时是否允许状态动画。
- `animateSameStatePatchChange` 控制状态集合相同但 resolved patch 变化时，是否允许从旧 patch 动画到新 patch。

不要为了刷新状态先调用 `clearStates()` 再调用 `setStates()`。这样会丢失旧 resolved patch，可能导致图元先回到 normal attrs，再从 normal attrs 动画进入 state attrs。

### 同状态 patch 变化

如果图元一直保持 `['custom1']`，但 `sharedStateDefinitions.custom1.patch` 从 `{ fillOpacity: 0.2 }` 变成 `{ fillOpacity: 0.5 }`：

```ts
graphic.setStates(['custom1'], {
  animate: true,
  animateSameStatePatchChange: true
});
```

VRender 会从旧 resolved patch 动画到新 resolved patch，不会经过 normal `fillOpacity: 1`。

如果不希望同状态 patch 变化动画：

```ts
graphic.setStates(['custom1'], {
  animate: false,
  animateSameStatePatchChange: false
});
```

或：

```ts
graphic.setStates(['custom1'], {
  animate: true,
  animateSameStatePatchChange: false
});
```

此时 patch 会同步应用。

### 旧签名兼容

旧签名仍可用：

```ts
graphic.setStates(['hover'], true);
```

等价于允许普通状态变化动画，但不会显式开启同状态 patch 变化动画。新代码建议使用 options 形式，语义更清晰。

## 动画迁移

### appear/fade 推荐写法

如果希望一个元素从透明渐入到最终透明度 1，推荐：

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

不要依赖下面这种写法把终点写入静态真值：

```ts
// 不推荐作为静态真值写入方式
graphic.setAttribute({ opacity: 0 });
graphic.animate().to({ opacity: 1 }, 300, 'linear');
```

`to()` 表示动画目标帧，不是“提交 baseAttributes”的 API。动画结束后仍应以图元静态属性写入路径为准。

### scaleIn 起点配置

`scaleIn` 现在支持显式配置起点：

```ts
{
  type: 'scaleIn',
  options: {
    fromScale: 0
  }
}
```

如果最终属性是：

```ts
{
  scaleX: 2,
  scaleY: 3
}
```

上面的动画会从 `0 -> 2`、`0 -> 3`。如果不传 `fromScale`，默认行为保持旧逻辑：从当前 `attribute.scaleX/scaleY ?? 0` 推断起点。

也可以分别配置两个方向：

```ts
{
  type: 'scaleIn',
  options: {
    fromScaleX: 0,
    fromScaleY: 0.5
  }
}
```

### update 动画目标

内置 update 动画现在会更明确地区分：

- 静态最终属性。
- 动画起始帧。
- 动画过程中的 transient 属性。

上层库不应为了让内置 update 动画读到目标值而长期维护 VRender 内部 `finalAttribute` 合并缓存。应通过 VRender 标准 update context、`diffAttrs`、`finalAttrs` 或图元静态属性写入路径传递目标。

## 多端支持矩阵

1.1.0 的稳定默认环境：

| 环境 | 状态 |
| --- | --- |
| Browser | 稳定支持 |
| Node | 稳定支持 |
| 微信小程序 wx | 稳定支持 |
| Lynx | 稳定支持 |
| Harmony | 稳定支持 |

保留入口但需要按项目继续做真机或真实宿主验证的环境：

| 环境 | 建议 |
| --- | --- |
| Taro | 保留 public creator，真实端 smoke 后再升级承诺 |
| Feishu | 保留 public creator，真实端 smoke 后再升级承诺 |
| TT | 保留 public creator，真实端 smoke 后再升级承诺 |

`native` 不属于 1.1.0 稳定默认合同。

## Glyph 边界

`Glyph` 仍是特殊图元 surface。1.1.0 不把 `glyphStates`、`glyphStateProxy` 或 `subAttributes` 合并进 shared-state 主路径。现有行为继续保持：

- 状态属性作用于 glyph 自身。
- subGraphic ownership 不由 D3 shared-state 主模型重新定义。
- 如果业务依赖 glyph 子图元状态，应继续按 glyph 专属 API 或业务层约定处理。

## 迁移清单

升级前建议逐项检查：

1. 搜索旧入口：

```bash
rg "createStage\\("
rg "initAllEnv|initBrowserEnv|loadBrowserEnv|loadNodeEnv|loadAllEnv"
```

新代码迁移到环境专属 `create*VRenderApp()` 和 `app.createStage()`。

2. 搜索旧状态写法：

```bash
rg "clearStates\\("
rg "normalAttrs"
rg "stateProxy"
rg "graphic\\.states|\\.states\\s*="
```

避免在刷新相同状态前先 `clearStates()`；不要把 `normalAttrs` 当作 snapshot/restore 主路径。将 `stateProxy` 迁移到 `states` + `StateDefinition.resolver` 或 `sharedStateDefinitions`。

如果你维护 VChart、VTable 或其他上层集成，还需要查看 D3 删除接口与调用链路留档：

- [D3_REMOVED_API_AND_CALL_CHAIN_LOG.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_REMOVED_API_AND_CALL_CHAIN_LOG.md)

3. 检查 appear/fade：

- 先写最终静态属性。
- 使用 `animate().from(...)` 表示起始帧。
- 不依赖 `animate().to(...)` 写入 `baseAttributes`。

4. 检查 `scaleIn`：

- 如果业务需要从不可见缩放进入，显式传 `options.fromScale: 0`。
- 不要通过把最终样式写成 `scaleX: 0`、`scaleY: 0` 来制造动画起点。

5. 检查多端：

- Browser 和 Node 至少补最小 smoke。
- wx、Lynx、Harmony 若在业务中使用，应在对应宿主环境验证渲染、动画、事件和 release。
- Taro、Feishu、TT 在真实端 smoke 前不要扩大稳定承诺。

## 常见问题

### update 后同状态图元先闪回 normal attrs

通常是调用方先 `clearStates()` 再 `setStates()`。请改为：

```ts
graphic.setStates(nextStates, {
  animate: true,
  animateSameStatePatchChange: true
});
```

### 同状态 patch 变化没有动画

确认传入：

```ts
{
  animate: true,
  animateSameStatePatchChange: true
}
```

同时确认 shared state definitions 或 resolver 已经更新，并且 resolver 依赖的外部输入能触发重新计算。

### fade appear 结束后图元消失或回到旧值

请确认最终静态属性已经通过 `setAttribute` 或等价静态写入路径设置，再使用 `animate().from(...)` 设置起始帧。

### scaleIn 没有缩放效果

如果最终 attrs 已经包含 `scaleX/scaleY`，默认推断可能得到“从当前 scale 到当前 scale”的无变化动画。需要显式配置：

```ts
{
  type: 'scaleIn',
  options: { fromScale: 0 }
}
```

### Node 出图失败

优先检查：

- Node 版本是否和 `canvas` native 依赖 ABI 匹配。
- 是否把 node-canvas 包作为 `createNodeVRenderApp({ envParams })` 传入。
- Stage 是否设置了明确的 `width` 和 `height`。

## 不属于本次稳定合同的内容

1. Taro、Feishu、TT 的 Tier 1 稳定承诺。
2. 同一 JS runtime 中多环境完全隔离。
3. 细粒度按需装配等价替代根包默认入口。
4. `Glyph` 子图元状态纳入 shared-state 主路径。
5. 额外内存优化或构造期表示优化。

这些方向可能在后续版本继续推进，但不应作为 1.1.0 的升级前提。
