# D3 交付前 Smoke Harness 规划

> **文档类型**：交付前 smoke 规划文档
> **用途**：把 `packages/vrender rushx start` 收口为 handoff 前的最小浏览器集成 harness
> **当前状态**：已完成（baseline smoke 已建立，triage / exclusions 已留档）
> **重要说明**：本文件不是新的架构设计文档，也不是新的规范源；规范仍以 `graphic-state-animation-refactor-expectation.md`、`D3_ARCH_DESIGN.md`、`D3_PRE_HANDOFF_HARDENING.md` 及各 Phase 主文档为准

> **执行结果**：见 [D3_PRE_HANDOFF_SMOKE_TRIAGE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_TRIAGE.md)

---

## 1. Why this is P0

`packages/vrender rushx start` 对应的小测试项目必须进入当前 pre-handoff `P0`。

原因不是“它是个 demo”，而是：

1. 它是上层业务最小集成 harness。
2. 它是 handoff 前 smoke 验证环境。
3. 它是上层接入问题与迁移经验的真实来源。

它与单元测试的关系是：

1. unit test 证明内核契约和局部行为。
2. compile 证明类型和构建闭环。
3. browser harness 证明当前 workspace 源码在真实页面环境里、以接近上层接入方式运行时是否仍正常工作。

因此，如果当前 harness 中多数页面无法正常工作，这不是开发体验问题，而是 handoff 风险。

本轮目标不是把所有页面都修成“漂亮 demo”，而是把它收口成可用于 handoff 决策的 smoke harness。

---

## 2. Current assessment

### 2.1 当前页面体系是什么

当前 `packages/vrender rushx start` 实际执行：

- `vite ./__tests__/browser --host`

browser harness 结构如下：

- 宿主页面：
  [index.html](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/index.html)
- 入口：
  [main.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/src/main.ts)
- 页面注册表：
  [pages/index.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/src/pages/index.ts)
- Vite alias：
  [vite.config.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/vite.config.ts)

关键事实：

1. browser harness 通过 alias 直接引用 workspace 源码。
2. 页面切换依赖动态 import。
3. 页面集合包含基础 graphic、状态、动画、事件、performance、3D、React、以及历史上层 fixture。
4. 当前页面总量约为 `69`。

### 2.2 这些页面对 handoff 的价值是什么

这些页面的价值不在于“展示效果”，而在于验证：

1. 浏览器宿主初始化是否正常。
2. stage / canvas / container / root 生命周期是否闭环。
3. 事件、状态、动画、页面切换与清理是否还能工作。
4. 当前 D3 新语义在接近上层真实使用方式的页面环境里是否仍成立。

### 2.3 为什么它应该被视为 P0

因为它弥补的是当前最关键的一层空白：

- 重构后的 VRender 在接近上层真实使用方式的页面环境里，到底还能不能正常工作。

如果这一层不收口，就算单元测试和 compile 都通过，上层接入仍可能在初始化、装配、事件、动画、页面切换、宿主生命周期这些问题上首轮失败。

### 2.4 它和 handoff 文档之间的关系

这一层工作的输出不只是“修页面”，还包括：

1. baseline smoke 页面清单
2. 全量页面 triage 结果
3. 页面问题分类
4. 上层迁移经验总结
5. handoff 门槛中的 smoke gate

---

## 3. Triage plan

### 3.1 先做全量页面 triage，不先盲修

必须先基于页面注册表生成全量 triage 清单，而不是直接修某几个坏页。

每个页面至少记录：

1. `route`
2. `类别`
3. `能否打开`
4. `是否有首帧渲染`
5. `是否有 uncaught error / unhandled rejection`
6. `是否存在 console error / import failure / blank render`
7. `是否为 baseline 候选`
8. `root cause 类别`
9. `处理结论`

这里的失败信号需要显式记录，不能只凭主观判断“页面看起来不对”。至少包括：

1. dynamic import 失败
2. browser console error
3. uncaught error / unhandled rejection
4. 页面打开但空白渲染
5. 页面有首帧，但关键行为错误

### 3.2 故障分类固定为 5 类

页面问题统一归为以下 5 类：

1. 注册/装配问题
   - 例如 animate、kits、env、plugin 没注册或注册顺序错误
2. 入口初始化问题
   - 例如 canvas/root/container 宿主不匹配、页面切换清理不完整、stage 初始化/释放顺序错误
3. 状态/动画/事件问题
   - 页面能开，但 hover/click/state/animate 逻辑错误
4. 上层调用姿势与新 D3 语义不兼容
   - 例如旧 `normalAttrs` 预期、依赖隐式 end-commit、直接改 `attribute`
5. 历史页面本身失效或过时
   - 例如 legacy DI fixture、强依赖远程脚本、实验页

### 3.3 triage 的判定规则

1. 页面使用当前推荐姿势且仍失败：
   - 归类为 core bug
2. 页面依赖旧语义或旧写法：
   - 归类为页面/用法迁移，不包装成 core bug
3. 页面依赖远程脚本、legacy DI 或历史实验能力：
   - 归类为 historical fixture，不纳入首批 baseline
4. 如果出现 `console error / import failure / blank render`：
   - 必须先归为失败页进入 triage，不允许跳过记录或仅凭肉眼判为“非关键问题”

### 3.4 triage 的最终产物

triage 完成后，必须能直接回答：

1. 哪些页是 baseline smoke
2. 哪些页 handoff 前必须修
3. 哪些页只需要写迁移说明
4. 哪些页继续保留，但明确不纳入 baseline

---

## 4. Smoke baseline proposal

本轮不要求一开始让全部 `69` 页全绿。

建议先建立一组代表性 baseline，优先覆盖当前 handoff 最关键的能力：

### 4.1 基础图形渲染

优先：

- [graphic.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/src/pages/graphic.ts)

备选：

- [stage.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/src/pages/stage.ts)

### 4.2 状态切换

- [state.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/src/pages/state.ts)

### 4.3 动画

- [animate-state.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/src/pages/animate-state.ts)

### 4.4 交互事件

- [interactive-test.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/src/pages/interactive-test.ts)

如需补一个更聚焦的事件页，可追加：

- [drag-test.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/src/pages/drag-test.ts)

### 4.5 shared-state 或批量状态

当前 browser harness 中没有干净的 dedicated shared-state / batch-state smoke 页面。

因此本轮建议新增一个最小 baseline 页面，例如：

- `shared-state-batch-smoke.ts`

它的目标不是做 demo，而是验证：

1. Group-first shared-state 在页面环境里能工作
2. 或 strict `paint-only` batch/deferred 在页面环境里能工作

### 4.6 更接近真实上层接入

优先：

- [react.tsx](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/src/pages/react.tsx)

不建议首轮 baseline 直接使用：

- [vchart.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/src/pages/vchart.ts)
- [vtable.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/src/pages/vtable.ts)

因为它们强依赖远程脚本，噪音过大，不适合作为首批 handoff gate。

### 4.7 baseline 通过标准

每个 baseline 页至少满足：

1. 页面可稳定打开
2. 无 uncaught error / unhandled rejection
3. 有可见首帧渲染结果
4. 关键交互/状态/动画动作可复现
5. 页面切换后不会污染后续页
6. 如果页面承接 shared-state / batch-state，则必须走当前 D3 新语义，不接受旧语义伪通过

---

## 5. Upstream learnings to capture

这项工作的输出除了“修页面”，还必须沉淀可交付给上层的知识。

至少包括：

1. 哪些旧用法已经不适用
   - 例如旧 `normalAttrs` snapshot / restore 预期
   - 依赖动画隐式 end-commit
   - 直接改 `graphic.attribute.xxx` 期待成为真值
2. 哪些接入方式需要更新
   - 页面初始化 / 销毁顺序
   - animate / env / kits 的装配顺序
   - 当前 state / animation / deferred 推荐用法
3. 哪些问题属于 core bug
4. 哪些只是页面/用法需要迁移
5. 哪些历史页不再适合作为“当前正确用法样板”

这些内容后续应回填到：

1. 上层接入说明
2. 迁移经验总结
3. handoff 门槛中的 smoke baseline / exclusions 说明

---

## 6. Developer task split

### P0 必做

1. 建立全量页面 triage 表
   - 目标：先知道问题分布，不允许盲修
2. 让 `packages/vrender rushx start` 成为可用的 handoff smoke harness
   - 目标：server 可启动，页面切换机制可工作，baseline 检查可重复执行
3. 修复 baseline 页中的 core bug 和入口/装配问题
   - 目标：基础渲染、状态、动画、事件、shared-state/batch、上层接入页至少各有一个代表页可用
4. 新增一个最小 shared-state 或 batch-state smoke 页
   - 目标：把 Phase 3/4 主链真正带入页面环境验证
5. 产出 migration / triage 留档
   - 目标：区分 core bug、页面迁移、历史页失效，并反哺上层接入文档
6. 将 smoke harness 纳入 handoff gate
   - 目标：以 baseline smoke + 全量页面 triage 完整作为 handoff 门槛

### P1 强烈建议

1. 对 baseline smoke 做最小自动化
   - 目标：至少自动发现页面 import failure、uncaught error、空白渲染
2. 再补 1 到 2 个更贴近上层的页面
   - 目标：如 `jsx`、`react`、或已去掉远程依赖后的上层 fixture
3. 对历史页做“保留但降级”处理
   - 目标：继续保留历史参考，但不纳入 handoff baseline

### Non-goals

1. 不要求一开始把全部页面修绿
2. 不重开 Phase 1-4 主设计
3. 不新增新的架构阶段
4. 不把 harness 做成漂亮 demo
5. 不把 `graphic.states` 告警策略、`Glyph ownership` 升级为当前 blocker

---

## 7. Handoff gate conclusion

结论如下：

1. 这项工作进入当前 pre-handoff `P0`
2. `packages/vrender rushx start` 的 smoke 验证应纳入 release gate
3. 纳入方式不是“全部页面全绿”，而是：
   - baseline smoke 页面全部通过
   - 全量页面 triage 已完成
   - 无未分类的致命失败
   - migration / exclusions 已留档

如果当前轮次还做不到自动化，那么至少要把它作为 handoff 门槛中的手工或半自动 smoke gate，而不是留到上层接入后再发现问题。
