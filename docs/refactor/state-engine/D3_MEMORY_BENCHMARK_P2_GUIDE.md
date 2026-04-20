# D3 Memory Benchmark `P2` 专项实施文档

> **文档类型**：专项实施文档
> **用途**：为 `memory.ts` 与 VTable 相关高数量、低状态场景开启 `P2` 性能专项，明确业务价值、验证口径、允许改动范围与 stop 条件
> **当前状态**：`P1 accepted`，`P2 approved to start`
> **重要说明**：本文件不是新的架构设计文档；它只定义 `memory benchmark`/VTable 相关 `P2` 的执行边界，不重开 D3 Phase 1-4 主设计

---

## 1. 为什么现在开启 `P2`

当前继续推进，不是因为“与 `develop` 还有接近 1 倍差距”这个表象本身，而是因为已经确认存在明确业务价值：

1. `memory.ts` 仍然揭示了 **per-graphic fixed cost** 偏高的问题。
2. 这类问题不仅会出现在极端 benchmark，也会映射到 **VTable** 这类高数量、低状态、基础属性为主的真实业务场景。
3. VTable 的典型路径包括：
   - 大量 `text`
   - 每个单元格的自定义渲染图元
   - `text` 上透传到 VRender 的 `stateProxy` 样式配置

因此，这轮 `P2` 的目标不是“追平 develop”，而是：

> 继续压缩高数量、低状态、基础属性为主场景下的 `Graphic` 构造期固定成本，并用 VTable 相关 workload 证明这件事确实有业务意义。

---

## 2. 不重开的结论

以下结论已经成立，本轮不得重开：

1. 当前问题仍主要是 **per-graphic fixed cost**，不是：
   - app/stage 重建
   - renderer / raf / deferred 单点回归
   - legacy removal
2. 不回滚 D3 主架构。
3. 不把 shared-state / deferred 主链重新拉进专项。
4. 当前契约边界仍然保持：
   - 只承诺顶层 `graphic.attribute.xxx = ...` 兼容成立
   - 不承诺任意深层 nested mutation 完全隔离
5. `run 100` 仍然是官方性能 gate；`run 1000` 继续只作补充观察项。

---

## 3. 本轮 `P2` 的唯一目标

本轮 `P2` 只允许做一件事：

> 在 `Graphic` 构造路径及其直接相关的 text/基础属性初始化路径里，再做一轮**单目标、低风险、可测量**的固定成本优化。

这轮不是全仓性能优化，也不是新的阶段重构。

---

## 4. VTable 场景验证口径

这轮必须在原有 `memory.ts` 之外，再增加一组 **VTable-lite 代表性 workload**。

### 4.1 VTable-lite basic cells

目的：
- 验证“每个单元格同时创建图元与文本”的基础构造成本。

建议 workload：
1. 每个 cell 至少创建：
   - 1 个背景图元（例如 `rect`）
   - 1 个文本图元（`text`）
2. 单次 run 的对象总量尽量与 `memory.ts` 对齐到同一量级。
   - 推荐：`5000` 个 cell
   - 对应总图元数约 `10000`
3. 该 workload 不启用状态切换，只测高数量基础构造成本。

必测指标：
1. total
2. construction
3. heap delta

### 4.2 VTable-lite text-stateProxy cells

目的：
- 验证 VTable 的文本 `stateProxy` 路径仍被覆盖到，而且它不会被本轮优化忽略掉。

建议 workload：
1. 仍以 `5000` 个 cell 为默认量级
2. 每个 cell 继续创建：
   - 1 个背景图元
   - 1 个 `text`
3. 每个 `text` 都挂上与 VTable 透传语义一致的 `stateProxy`
4. 性能对比仍然重点观察**构造阶段**
5. 额外增加一条最小语义验证：
   - 至少对一小批 sample text 应用一次 state，确认 `stateProxy` 路径仍然成立

这里的重点是：
- `stateProxy` 要进入 workload
- 但不能把 `P2` 变成 state 系统专项

### 4.3 这轮的正式验证口径

本轮 `P2` 需要同时保留两类 gate：

#### A. 通用 gate
1. `memory.ts run 100` no-trace
   - 官方 gate
2. `memory.ts run 100` trace
   - 补充证据

#### B. VTable 业务 gate
1. `VTable-lite basic cells run 100` no-trace
   - 业务相关 gate
2. `VTable-lite text-stateProxy cells run 100` no-trace
   - 业务相关 gate
3. 如环境允许，可对其中一个 workload 再补一条 trace
   - 只作补充证据

`run 1000` 继续只作补充观察项，不升级为本轮门槛。

---

## 5. 允许改动范围

本轮优先允许改动：

1. `packages/vrender-core/src/graphic/graphic.ts`
2. `packages/vrender-core/src/graphic/text.ts`
   - 仅当 VTable-lite 证据明确显示 text 构造路径仍是主要热点时
3. `packages/vrender-core/__tests__/unit/graphic/*`
4. `packages/vrender/__tests__/browser/src/pages/*`
   - 仅限新增或补充 `memory` / `vtable-lite` 相关 benchmark/workload
5. `packages/vrender/__tests__/browser/scripts/*`
   - 仅限 measurement / benchmark 脚本

---

## 6. 明确不做

1. 不触碰 renderer 主链
2. 不触碰 raf 主链
3. 不触碰 deferred 主链
4. 不触碰 shared-state 主链
5. 不回滚 D3 主架构
6. 不改 truth-model 语义边界
7. 不扩大契约到“深层 nested mutation 完全隔离”
8. 不把专项扩成全仓优化
9. 不直接引入对象池

---

## 7. Stop-and-feedback 条件

出现以下任一情况，必须先停下来反馈：

1. 为了继续优化，必须改 renderer / raf / deferred / shared-state 主链
2. 为了继续优化，必须改变 `baseAttributes + resolvedStatePatch -> attribute` 语义
3. 为了继续优化，必须扩大当前契约边界
4. `VTable-lite` workload 证明当前剩余问题并不在构造期固定成本，而在其它系统性路径
5. 新 workload 本身不稳定，无法形成可复跑 gate

---

## 8. 成功标准

这轮 `P2` 只有在下面同时满足时才算成功：

1. `memory.ts run 100` no-trace 相比当前 `P1 accepted` 基线继续改善
2. `memory.ts run 100` trace 没有主导指标上的反向恶化
3. 至少一条 `VTable-lite` 业务 gate 证明：
   - 改动对“text + 图元 + stateProxy”相关场景有可见帮助
4. 定向测试继续全绿
5. 契约边界未扩大
6. 未触碰禁止改动的主链

---

## 9. 记录要求

继续回填：

- `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`

至少写清：
1. VTable-lite workload 定义
2. 允许改动范围内实际动了哪些文件
3. `memory.ts` 与 VTable-lite 的 before / after 数据
4. 是否继续保持当前契约边界
5. 本轮 `P2` 是否接受
