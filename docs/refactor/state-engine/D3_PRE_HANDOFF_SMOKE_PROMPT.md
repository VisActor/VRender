# D3 交付前 Smoke Harness 执行 Prompt

> **文档类型**：开发者执行 Prompt
> **用途**：指导实现 agent 收口 `packages/vrender rushx start` 对应的 browser smoke harness
> **当前状态**：已完成（baseline smoke 已建立，triage / exclusions 已留档）
> **重要说明**：本文件不是新的架构设计文档；执行边界以 `D3_PRE_HANDOFF_HARDENING.md` 和 `D3_PRE_HANDOFF_SMOKE_HARNESS.md` 为准

> **执行结果**：见 [D3_PRE_HANDOFF_SMOKE_TRIAGE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_TRIAGE.md)

---

你现在负责执行 D3 的 pre-handoff smoke harness 收口工作。

注意：

1. D3 Phase 1-4 主线已经完成并关闭。
2. 这轮不是新阶段，不是 Phase 5。
3. 这轮不重开主设计，不扩大为新架构迭代。
4. 目标是把 `packages/vrender rushx start` 收口为 handoff 前可用的 smoke harness。

你必须先读：

1. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md`
2. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md`
3. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_HARDENING.md`
4. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_HARNESS.md`
5. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCHIVE_INDEX.md`
6. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_FOLLOWUPS.md`
7. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`

执行原则：

1. 先做页面 triage，再修 baseline，不允许盲修页面。
2. 不要求一开始把全部页面修绿。
3. 不把历史页、远程依赖页、legacy fixture 强塞进首批 baseline。
4. 不把 `graphic.states` 告警策略、`Glyph ownership` 升级为 blocker。
5. 这轮必须能反哺：
   - 上层接入文档
   - 上层迁移经验总结
   - 当前 handoff gate

你要完成的 P0：

1. 建立 browser harness 的全量 triage 表
   - 数据源：
     - `packages/vrender/__tests__/browser/src/pages/index.ts`
     - `packages/vrender/__tests__/browser/src/pages/*`
   - 每页至少记录：
     - route
     - 分类
     - 能否打开
     - 是否有首帧渲染
     - 是否有 uncaught error / unhandled rejection
     - 是否有行为错误
     - 是否为 baseline 候选
     - root cause 类别
     - 处理结论

2. 按固定分类完成问题归类
   - 注册/装配问题
   - 入口初始化问题
   - 状态/动画/事件问题
   - 上层调用姿势与新 D3 语义不兼容
   - 历史页面本身失效或过时

3. 建立并修通 baseline smoke 页面
   - 至少覆盖：
     - 基础图形渲染
     - 状态切换
     - 动画
     - 交互事件
     - shared-state 或批量状态
     - 更接近真实上层接入的页面
   - 推荐优先页：
     - `graphic.ts`
     - `state.ts`
     - `animate-state.ts`
     - `interactive-test.ts`
     - `react.tsx`
   - 如现有页不适合承接 shared-state / batch-state，新增一个最小 smoke 页

4. 收口 `packages/vrender rushx start`
   - 目标不是漂亮 demo，而是 handoff smoke harness
   - server 必须可启动
   - baseline 页必须可重复验证
   - 页面切换后不能污染后续页

5. 产出 migration / triage 留档
   - 必须明确：
     - 哪些是 core bug
     - 哪些只是页面/用法迁移
     - 哪些历史页不再纳入 baseline
     - 哪些结论应写入上层接入文档

release gate 中与 smoke harness 相关的门槛：

1. `packages/vrender rushx start` server 可启动
2. baseline smoke 页面全部通过
3. 全量页面 triage 已完成
4. 无未分类的致命失败
5. migration / exclusions 已留档

开发过程要求：

1. 重要进展继续回填：
   `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
2. 每次留档至少写清：
   - 背景/问题
   - 结论
   - 影响文件
   - baseline 或 triage 结果
   - 是否影响 handoff gate

推荐执行顺序：

1. 跑通 `packages/vrender rushx start` 并拉全量页面清单
2. 完成 triage 表
3. 定义 baseline smoke 页面
4. 修复 baseline 页与必要的入口/装配问题
5. 新增最小 shared-state / batch-state smoke 页
6. 回填 migration / exclusions
7. 汇报 smoke gate 结果

何时必须停下来反馈：

1. 如果大量页面失败根因指向新的 D3 核心运行时回归，而不是页面/用法问题
2. 如果 baseline 页无法覆盖 shared-state 或 batch-state，且新增最小 smoke 页也无法建立
3. 如果为通过 smoke gate 必须重开 Phase 1-4 主设计
4. 如果 `packages/vrender rushx start` 当前结构本身不适合作为 smoke harness，需要重构整体工具链

输出格式：

1. `Smoke harness status`
2. `Pages triaged`
3. `Baseline pages`
4. `Files changed`
5. `Documentation updates`
6. `Verification`
7. `Remaining blockers`
8. `Can smoke harness enter handoff gate`

要求：

1. 先说明 baseline smoke 当前还有哪些红灯
2. 如果 triage 未完成或 baseline 未成形，直接列 blocker
3. 不要把“历史页未修”包装成“baseline 未通过”
4. 不要把关键判断再抛回协调者
