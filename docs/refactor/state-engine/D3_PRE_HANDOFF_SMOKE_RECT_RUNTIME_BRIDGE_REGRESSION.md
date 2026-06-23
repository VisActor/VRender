# D3 Pre-handoff Smoke Rect 白屏回归留档

> **文档类型**：问题定位与修复留档
> **用途**：记录 `packages/vrender/__tests__/browser/src/pages/rect.ts` 在真实浏览器/hidden Electron 中出现“scene tree 正常但页面白屏”的新一轮回归、根因与最小修复
> **当前状态**：已完成
> **重要说明**：本文件不是新的设计文档；D3 主规范仍以 `graphic-state-animation-refactor-expectation.md`、`D3_ARCH_DESIGN.md` 和各 Phase 主文档为准

---

## 1. 触发背景

在 consolidated handoff gate 已经 fresh 跑绿后，用户在真实浏览器中观察到：

1. `rect` 页面肉眼仍然白屏
2. 但 `window.stage`、`renderCount`、`defaultLayer.getChildren()` 看起来都正常

这与 baseline smoke 中 `rect = open=true / firstFrame=true / errors=0` 的结论冲突，因此本轮按真实 blocker 重新排查，而不是继续沿用 smoke 绿态。

本次复现使用的页面入口是：

- [rect.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/src/pages/rect.ts)

本次实际复现 URL：

- `http://localhost:3015/?smoke=1&route=rect`

其中：

1. `3015` 是本轮 `packages/vrender rushx start` 的实际端口
2. `smoke=1` 仅用于稳定复现同一个页面入口与 harness telemetry
3. 页面模块仍然是同一个 `rect.ts`

---

## 2. 稳定复现证据

### 2.1 页面白屏证据

本轮通过 hidden Electron 捕获了 `rect` 页截图，结果是：

1. 左侧 menu 正常显示
2. 右侧 canvas 区域整体空白
3. 没有任何 rect / symbol / image 实际可见

### 2.2 运行时内部状态证据

使用 [debug-rect-stage.cjs](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/scripts/debug-rect-stage.cjs) 复现并采样，得到：

1. `window.stage` 存在
2. `renderCount` 正常增长
3. `stage.defaultLayer.getChildren()` 为 `3`
4. 各图元 `AABBBounds / globalAABBBounds` 均在视口内
5. 但：
   - `drawContribution.getRenderContribution(rect) === null`
   - `pixelSample` 全白
   - `coarseScan = []`
   - `drawCalls` 只有极少量 `clearRect / fillRect / rect`，没有对应图元的真实落像素结果

这证明问题不是：

1. `Stage` 没创建成功
2. 图元没挂进场景树
3. 图元跑出视口
4. render loop 没执行

而是：

> 有 scene tree、有 renderCount，但某些图元没有选到 renderer，因此视觉结果仍然是白屏。

---

## 3. 与历史问题的关系

必须明确区分这次问题与 [D3_PRE_HANDOFF_SMOKE_RENDERER_REGRESSION.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_RENDERER_REGRESSION.md) 中记录的问题。

### 3.1 历史问题

历史问题的结论是：

1. app-scoped `Stage` 创建后没有拿到默认 renderer registry
2. `defaultRenderMap/styleRenderMap` 基本为空
3. `rect/group/circle` 等 renderer 大面积缺失
4. 本质是 app-scoped stage 与 legacy renderer 管线之间完全断层

### 3.2 这次问题

这次不是“完全没有 renderer”，而是：

1. app registry 中已有一部分 renderer / picker
   - 例如 `group / arc3d / rect3d / glyph / star / gif-image`
2. 但缺失了一整批关键 2D renderer / picker
   - `rect / circle / image / line / path / polygon / text / richtext / symbol / area`
3. 结果是：
   - `group` 能选中 renderer
   - `rect` 选不中 renderer
   - 页面整体仍然是白屏

因此这次是：

> 历史“renderer registry 断层”问题在新的 bootstrap 口径下的**部分复发**，不是原问题的简单重复。

---

## 4. 真正根因

本轮根因不是：

1. `rect.ts` 输入错误
2. `stage.defaultLayer` 废弃
3. smoke 误判
4. 仅仅是页面肉眼观察错误

真正根因是：

### 4.1 当前工作区中的 `bootstrap.ts` 已切到 installer-only 路径

[bootstrap.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/src/entries/bootstrap.ts) 当前工作区改动把 browser/node bootstrap 改成了：

1. `installBrowserEnvToApp()`
2. `installDefaultGraphicsToApp()`
3. `installBrowserPickersToApp()`

并把 legacy `registerRect/registerCircle/...` 从 app-scoped bootstrap 主路径移走，仅保留在 `bootstrapLegacyVRenderRuntime()`。

### 4.2 但当前 installer surface 对默认 2D graphics/picker 仍不完全闭环

`vrender-core` render leaf module 与 `vrender-kits` canvas picker module 里仍存在全局 one-shot guard，例如：

1. `rect-module.ts`
   - `let loadRectModule = false`
2. `circle-module.ts`
   - `let loadCircleModule = false`
3. `symbol-module.ts`
   - `let loadSymbolModule = false`
4. `canvas-picker/rect-module.ts`
   - `let loadRectPick = false`
5. `canvas-picker/circle-module.ts`
   - `let loadCirclePick = false`

这些 guard 是**跨 container 的全局状态**，不是“对某个 container 只初始化一次”。

### 4.3 结果

当 legacy path 与 app-scoped installer path 在同一 bundle 中共存时，会出现下面的问题：

1. 某些 renderer/picker 已经在 legacy binding context 中被绑定过
2. 后续 app-scoped installer 再尝试给 runtime/app context 绑定时，由于 `loadXModule/loadXPick` 已经是 `true`，直接 no-op
3. 最终 app registry 只拿到一部分条目
4. `drawContribution.getRenderContribution(rect)` 返回 `null`
5. scene tree 正常，但页面视觉白屏

---

## 5. 最小修复

本次修复边界严格限制在 runtime 接线，不改页面结构，不重构 browser harness。

修复点在：

- [bootstrap.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/src/entries/bootstrap.ts)

### 5.1 修复策略

在保留 app-scoped installer 主路径的前提下，增加最小 bridge：

1. 先执行 app-scoped installer：
   - env
   - default graphics
   - pickers
2. 再执行 legacy env + legacy graphic registrations
3. 将 legacy binding context 中已存在的 renderer / picker 合并回当前 app registry

合并对象包括：

1. `GraphicRender`
2. browser 下的 `CanvasPickerContribution`
3. node 下的 `MathPickerContribution`

并通过 `numberType + type + constructor.name` 做最小去重。

### 5.2 为什么这是最小修复

这次没有做：

1. 不重构 `vrender-kits` installer surface
2. 不批量重写 leaf module 的全局 `loadXModule/loadXPick`
3. 不改 `rect.ts` 页面结构
4. 不改 smoke baseline 标准

它只是在当前仍然存在 legacy/app 双路径的现实下，补一条最小 bridge，确保 app-scoped `Stage` 能拿到完整默认 renderer/picker 集。

---

## 6. 验证结果

### 6.1 修复前

`debug-rect-stage.cjs` 输出：

1. `renderRegistry.selected` 中两个 `rect.renderer = null`
2. `appRegistry.renderers` 缺失 `rect/circle/image/line/path/polygon/text/richtext/symbol/area`
3. `pixelSample` 全白
4. `coarseScan = []`
5. 截图白屏

### 6.2 修复后

`debug-rect-stage.cjs` 输出：

1. `renderRegistry.selected`
   - `rect -> DefaultCanvasRectRender`
   - `group -> DefaultCanvasGroupRender`
2. `appRegistry.renderers` 现在包含：
   - `rect`
   - `circle`
   - `image`
   - `line`
   - `path`
   - `polygon`
   - `text`
   - `richtext`
   - `symbol`
   - `area`
3. `appRegistry.pickers` 也同步补齐对应 2D picker
4. `pixelSample` 不再全白
5. `coarseScan` 命中多处非白像素
6. `drawCalls` 出现真实 `fill / stroke / drawImage / arc / lineTo` 等绘制行为
7. 截图恢复可见

### 6.3 baseline 复验

fresh 复跑：

1. `rect`
2. `state`

结果：

1. `open=true`
2. `firstFrame=true`
3. `errors=0`

### 6.4 test / compile

已通过：

1. `packages/vrender rushx test`
2. `rush compile -t @visactor/vrender-core`
3. 新增的 `entries` 回归单测

---

## 7. 对后续维护者的结论

如果后续再次看到：

1. `stage` 正常
2. scene tree 正常
3. `renderCount` 在增长
4. 但页面视觉白屏

优先检查：

1. `drawContribution.getRenderContribution(graphic)`
2. `app.registry.renderer`
3. `app.registry.picker`
4. bootstrap 是否只走了 installer path，是否缺 legacy bridge
5. leaf module / picker module 是否因全局 `loadXModule/loadXPick` 提前 short-circuit

不要先把问题归因为：

1. 页面坐标
2. `defaultLayer` 废弃
3. 用户看错
4. smoke 误判

这次回归的核心经验是：

> 当默认 graphics/picker 仍部分依赖 legacy one-shot module 绑定时，app-scoped bootstrap 不能简单切成 installer-only；否则会出现“registry 部分缺失，scene tree 正常但视觉白屏”的部分回归。
