# VRender 1.1.0 升级功能报告

> 文档类型：release feature report
> 生成日期：2026-06-12
> 范围：D3 state / animation stable contract、app-scoped runtime、包体积专项新增 public capability

## 升级定位

VRender 1.1.0 是一次底层渲染语义稳定化升级，不是单纯包体积版本。核心目标是把 D3 阶段验证过的状态、动画和多端 runtime 语义转为稳定 contract，同时保留 root/default 的完整易用性。

对使用者而言，最重要的变化是：

- 状态样式、动画帧、静态属性真值的边界更清楚。
- update/state 动画目标来源更统一。
- 多端环境初始化收敛到 App 级入口。
- 按需加载能力开始有正式 public subpath/register，供 VChart/VTable 后续迁移。

## 主要功能升级

### 状态系统

1. 静态真值统一为：

```text
baseAttributes + resolvedStatePatch -> attribute
```

2. `sharedStateDefinitions` 成为跨图元共享状态的推荐入口。
3. `graphic.setStates(states, { animate, animateSameStatePatchChange })` 支持 same-state refresh。
4. 动态 state resolver 能收到有效的 `StateResolveContext.graphic`。
5. shared-state scope 绑定后，不再用本地图元 `graphic.states` 作为 missing-state fallback。
6. `graphic.states` 仍是非 shared scope 下的本地图元状态定义入口。

### 动画系统

1. 动画帧不再作为隐式静态属性真值来源。
2. appear/fade 推荐先写最终静态属性，再用 `animate().from(...)` 表达起始帧。
3. `animate().to(...)` 不应被当作“结束后写入 `baseAttributes`”的接口。
4. sibling update animations 不再让某个 custom animation 提前提交其他 update item 负责的属性。
5. `TagPointsUpdate` 可以从标准 update target context 读取目标 `points/segments`。
6. `scaleIn` 新增 `fromScale`、`fromScaleX`、`fromScaleY` 起点配置。

### Component Layout

label layout 改为通过 update/final-bounds context 读取最终目标 attrs，而不是在 render/layout 过程中临时 mutate source graphic。这使 label 与 animation binding 的目标读取方式保持一致。

### App-Scoped Runtime

新增并稳定环境专属 App 入口：

- `createBrowserVRenderApp()`
- `createNodeVRenderApp()`
- `createWxVRenderApp()`
- `createLynxVRenderApp()`
- `createHarmonyVRenderApp()`

推荐新代码使用：

```ts
const app = createBrowserVRenderApp();
const stage = app.createStage(options);
```

旧的根级 `createStage()` 继续保留为兼容入口，但不再作为新代码推荐路径。

### Shared App

当同一页面或宿主容器内存在多个上层库，例如 VChart 和 VTable 同时使用 VRender，可以使用共享 App：

```ts
const handle = acquireSharedVRenderApp({
  env: 'browser',
  key: 'dashboard-main'
});

const stage = handle.app.createStage(options);
```

`handle.release()` 带引用计数语义，最后一个 handle 释放后底层 App 才释放。

## 包体积专项新增能力

本轮包体积专项没有削弱 full/default，而是新增更窄 public capability，让上层未来可以选择加载更少内容。

### Animate Custom Register

| 能力 | Public entry | Register | 用途 |
| --- | --- | --- | --- |
| 基础 runtime | `@visactor/vrender-animate/register` | `registerAnimate()` | graphic/state animation 基础运行时 |
| 基础 custom | `@visactor/vrender-animate/custom/register-basic` | `registerBasicCustomAnimate()` | fade/scale/move/rotate/grow/clip/update/state 等常规动画 |
| richtext custom | `@visactor/vrender-animate/custom/register-richtext` | `registerRichTextCustomAnimate()` | text/richtext input/output 动画 |
| disappear effects | `@visactor/vrender-animate/custom/register-disappear` | `registerDisappearCustomAnimate()` | dissolve/grayscale/particle/glitch/blur 等退场效果 |
| story effects | `@visactor/vrender-animate/custom/register-story` | `registerStoryCustomAnimate()` | story、MotionPath、streamLight 等效果 |
| full custom | `@visactor/vrender-animate/custom/register` | `registerCustomAnimate()` | 完整兼容能力 |

预计默认不再继续新增更多 animate custom 窄 register，除非上层先定义出新的 component-only optional profile。

### Components Public Subpath

`@visactor/vrender-components` root 保持完整导出；bundle-sensitive profile 可改用组件级 public subpath：

- `@visactor/vrender-components/data-zoom`
- `@visactor/vrender-components/marker`
- `@visactor/vrender-components/marker/line`
- `@visactor/vrender-components/marker/area`
- `@visactor/vrender-components/marker/point`
- `@visactor/vrender-components/marker/arc-line`
- `@visactor/vrender-components/marker/arc-area`
- `@visactor/vrender-components/player`
- `@visactor/vrender-components/slider`
- `@visactor/vrender-components/scrollbar`
- `@visactor/vrender-components/title`
- `@visactor/vrender-components/brush`
- `@visactor/vrender-components/timeline`
- `@visactor/vrender-components/radio`
- `@visactor/vrender-components/checkbox`
- `@visactor/vrender-components/table-series-number`

## 删除与收紧项

以下不是稳定 public API 的随意删除，而是 D3 alpha、内部旧路径、dead source 或未发布草稿收口：

| 删除/收紧项 | 替代路径 |
| --- | --- |
| `graphic.stateProxy` | `states` + `StateDefinition.resolver` 或 `sharedStateDefinitions` |
| JSX/React `stateProxy` prop | JSX/React `states` prop |
| shared scope 下本地 missing-state fallback | 共享状态补到 `sharedStateDefinitions` |
| D3 alpha deferred state / perf hook | 1.1.0 标准 `setStates` 同步路径 |
| old animation target fallback 草稿 | 标准 animate extension target 方法 |
| stale core/kits commented shells | 当前正式模块和 public entry |
| unused segment curve stubs | 无稳定替代，未发布内部死码 |

完整删除项以 [D3 删除接口与调用链路留档](../../refactor/state-engine/D3_REMOVED_API_AND_CALL_CHAIN_LOG.md) 为准。

## 兼容性判断

| 维度 | 判断 |
| --- | --- |
| root/default | 保持完整易用性，不删除默认能力 |
| stable public API | 未删除稳定 public API |
| D3 alpha API | 已删除或收紧未承诺路径 |
| VChart/VTable | 普通 full 升级不要求立即迁移按需能力；要拿体积收益才需要上层配合 |
| package version | 本分支未修改，release 流程统一处理 |

## 建议阅读

- [VRender 1.1.0 升级指南](../../assets/guide/zh/asd/Basic/Upgrade_to_1_1_0.md)
- [D3 Stable Release Notes Draft](../../refactor/state-engine/D3_STABLE_RELEASE_NOTES_DRAFT.md)
- [VRender On-Demand Capability Usage](../../refactor/bundle-size/VRENDER_ON_DEMAND_CAPABILITY_USAGE.md)
