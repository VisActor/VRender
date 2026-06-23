# D3 Pre-handoff Smoke 浏览器空白页问题留档

> **文档类型**：问题定位与修复留档
> **用途**：记录 `packages/vrender rushx start` browser harness 中“场景树正常但页面空白”的定位过程、根因和最小修复
> **当前状态**：已完成
> **重要说明**：本文件不是新的设计文档；D3 主规范仍以 `graphic-state-animation-refactor-expectation.md`、`D3_ARCH_DESIGN.md` 和各 Phase 主文档为准

---

## 1. 触发背景

在 pre-handoff smoke 收口阶段，`rect` 页面被一度视为 baseline candidate，但实际浏览器肉眼观察时页面为空白。

后续在真实浏览器中进一步核对发现：

1. `window.stage.renderCount` 持续增长
2. `stage.defaultLayer.getChildren()` 返回正常图元
3. 各图元 `AABBBounds / globalAABBBounds` 均落在视口内
4. DOM 中存在且仅存在 `canvas#main`

这说明问题不是：

1. `Stage` 没创建成功
2. 图元没加进场景树
3. 图元 bounds 跑出了视口
4. 页面没有进入 render loop

真正异常是：页面“有 scene tree、有 renderCount、但没有任何实际绘制结果”。

---

## 2. 排查结论

### 2.1 `createStage` 不是空白页根因

`rect.ts` 最初使用的是 `@visactor/vrender` 根导出的 `createStage()`。

结论：

1. 它确实是 legacy 兼容入口，已标记 `@deprecated`
2. 推荐写法是 `createBrowserVRenderApp().createStage()`
3. 但它不是本次空白页的根因

这次排查中，页面改成 app-scoped `createStage()` 后，空白问题仍然存在；因此空白页不能简单归因为“页面还在用旧 API”。

相关文件：

- [legacy.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/src/legacy.ts)
- [rect.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/src/pages/rect.ts)

### 2.2 `stage.defaultLayer` 不是废接口

`rect.ts` 使用 `stage.defaultLayer.add(...)`。

结论：

1. `defaultLayer` 仍是 `IStage` 的正式成员
2. 这条调用链不是类型错，也不是废弃接口误用

相关文件：

- [stage.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/src/interface/stage.ts)

### 2.3 真正根因：app-scoped stage 没拿到 renderer

最终通过 hidden Electron 调试脚本确认：

1. `stage.renderService.drawContribution.defaultRenderMap` 为空
2. `drawContribution.getRenderContribution(graphic)` 对 `rect / circle / group` 返回 `null`
3. `renderCount` 正常增长，但 draw pipeline 只有清屏和少量 path 调用，没有对应图元 renderer 的真实绘制

也就是说，问题不是“没 render”，而是：

> app-scoped browser 入口创建出的 `Stage` 没有拿到默认 renderer registry，因此 scene tree 可以建立、render loop 可以运行，但 `rect/circle/group` 实际没有 renderer 可选。

---

## 3. 根因分析

问题来自 D3 迁移后的入口接线断层：

1. `createBrowserVRenderApp()` 已切到 app-scoped entry
2. 但默认 bootstrap 仍主要调用 legacy `registerRect / registerCircle / ...`
3. 这些注册函数会完成 graphic creator、legacy binding、picker/env 等 legacy 装配
4. 但 **不会自动把 renderer 注册到当前 app context 的 `registry.renderer`**

与此同时：

1. `AppContext` 会为每个 app 创建独立的 `renderer / picker / contribution` registry
2. `Stage` 在 app-scoped 路径下又会优先使用当前 app 自己的依赖
3. 结果就是：app 有自己的 registry，但 registry 里没有默认 renderer

因此出现了典型断层：

- legacy 默认管线“以为自己注册好了”
- app-scoped stage “以为自己应该只看 app registry”
- 最终两边都没错，但 stage 真正渲染时拿到的是空 renderer registry

---

## 4. 修复策略

本次修复遵循两个约束：

1. 不退回 `modules.ts` 全局预初始化
2. 不重开 D3 Phase 1-4 主设计

最终采用的最小修复是：

### 4.1 `AppContext` 默认组装 app-scoped render service

`AppContext.createStage()` 不再让 stage 落到“空默认值”的 `DefaultRenderService()`。

而是显式基于当前 app 的：

1. `registry.renderer`
2. `registry.contribution`

组装出：

1. `DefaultDrawContribution`
2. `DefaultRenderService`

这样 app-scoped stage 至少会消费当前 app 自己的 registry，而不是隐式退回无 renderer 的默认实例。

相关文件：

- [app-context.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/src/entries/app-context.ts)

### 4.2 browser/node bootstrap 同步 legacy renderer 到 app registry

由于现有默认注册函数仍然是 legacy 风格，本次没有重写整套 kits 注册 API，而是做了最小桥接：

1. 先继续执行当前默认 bootstrap
2. 再把 legacy binding context 中已经注册好的：
   - `GraphicRender`
   - `DrawItemInterceptor`
   同步到当前 app 的 `registry.renderer / registry.contribution`

这样可以保证：

1. 不恢复全局默认初始化副作用
2. 不退回旧 `application.renderService`
3. app-scoped `Stage` 能真实拿到默认 renderer/interceptor

相关文件：

- [bootstrap.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/src/entries/bootstrap.ts)

---

## 5. 页面级补充修正

在根因排查同时，对 `rect.ts` 做了两处页面级修正，用于消除噪音：

1. 第一个 rect 原有 `width: NaN`
   - 已改为依赖 `x1 - x` 计算宽度
2. 页面使用 `renderStyle: 'rough'`
   - 已补 `roughModule(getLegacyBindingContext())`

这些修正是页面输入质量修正，不是空白页的核心根因。

相关文件：

- [rect.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/src/pages/rect.ts)

---

## 6. 验证结果

### 6.1 编译验证

已通过：

1. `rush compile -t @visactor/vrender-core`
2. `packages/vrender rushx compile`

### 6.2 单测验证

已通过：

1. `packages/vrender/__tests__/unit/entries.test.ts`
2. `packages/vrender-core/__tests__/unit/entries/app-context.test.ts`

### 6.3 运行时验证

通过 hidden Electron 调试脚本重新验证 `rect` / `state` 页：

修复前：

1. `selected renderer` 全为 `null`
2. `defaultRenderMap/styleRenderMap` 为空
3. scene tree 正常，但像素采样始终为白色

修复后：

1. `rect -> DefaultCanvasRectRender`
2. `group -> DefaultCanvasGroupRender`
3. `circle -> DefaultCanvasCircleRender`
4. `defaultRenderMap` 已有默认 renderer key
5. `styleRenderMap` 已有 `rough`
6. `rect/state` 页面像素采样能读到真实颜色，不再是全白

### 6.4 调试脚本

本次定位使用了临时调试脚本：

- [debug-rect-stage.cjs](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/scripts/debug-rect-stage.cjs)

它的作用是输出：

1. telemetry
2. stage/window/canvas 关键属性
3. scene tree / bounds
4. renderer 选择结果
5. pixel sample / coarse scan
6. draw call 统计

这次问题证明，仅凭 “`renderCount` 在增长” 或 “scene tree 存在” 不能证明页面已经正确绘制；必须进一步核对 renderer 选择与像素级结果。

---

## 7. 对后续维护者的结论

如果后续再次遇到以下症状：

1. 页面空白
2. `stage` 存在
3. `renderCount` 在涨
4. scene tree / bounds 正常

优先检查：

1. `stage.renderService.drawContribution.defaultRenderMap`
2. `drawContribution.getRenderContribution(graphic)`
3. 当前 app 的 `registry.renderer`

不要先把问题归因为：

1. `defaultLayer` 废弃
2. `createStage` 类型问题
3. 图元没挂进去
4. 纯页面坐标错误

本次问题的经验是：

> 在 D3 已切到 app-scoped entry 后，浏览器页空白的高优先级排查项应该是“renderer registry 是否真正接到了当前 stage”，而不是只看 scene tree 是否存在。

