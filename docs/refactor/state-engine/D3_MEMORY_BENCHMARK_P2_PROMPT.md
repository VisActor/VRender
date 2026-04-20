你现在负责执行 D3 memory benchmark 性能专项的 `P2`。

先读：
1. /Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MEMORY_BENCHMARK_PERF_CONTEXT.md
2. /Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MEMORY_BENCHMARK_P2_GUIDE.md
3. /Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md
4. /Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/src/pages/memory.ts
5. /Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/src/graphic/graphic.ts
6. /Users/bytedance/Documents/GitHub/VRender2/AGENTS.md

当前已经拍板：
- `P0 accepted`
- `P1 accepted`
- `P2 approved to start`

这轮不是新的架构设计，也不是继续泛化做全仓性能优化。

本轮唯一目标：
- 面向高数量、低状态、基础属性为主的业务场景，继续压缩 `Graphic` 构造期固定成本
- `memory.ts` 作为压力代理
- `VTable-lite` 作为业务价值锚点

## 本轮必须先做

### 1. 先建立 VTable-lite 验证口径
你必须先补出一组最小但真实代表 VTable 特征的 workload。

至少包含两类：

1. `VTable-lite basic cells`
- 每个 cell 创建：
  - 1 个背景图元，例如 `rect`
  - 1 个文本图元，例如 `text`
- 推荐 `5000` 个 cell，使总图元量级约 `10000`
- 只测基础构造成本，不引入额外状态切换

2. `VTable-lite text-stateProxy cells`
- 同样以 `5000` 个 cell 为默认量级
- 每个 cell 创建：
  - 1 个背景图元
  - 1 个 `text`
- 每个 `text` 都带 `stateProxy`
- 性能对比重点仍是构造期
- 额外增加一个最小语义检查：
  - 对一小批 sample text 应用一次 state
  - 确认 `stateProxy` 路径仍然成立

要求：
- 先把 workload 定义清楚再动优化实现
- 不允许把 VTable 验证降格成“只测 rect”

### 2. 先拿 baseline，再做实现
本轮必须先拿 baseline，再开始代码优化。

至少保留这些 baseline：

#### A. 通用 gate
1. `memory.ts run 100` no-trace
2. `memory.ts run 100` trace

#### B. VTable 业务 gate
3. `VTable-lite basic cells run 100` no-trace
4. `VTable-lite text-stateProxy cells run 100` no-trace

如环境允许，可再补一条 VTable-lite trace，但这不是强制门槛。

### 3. 只做一个单目标 `P2` 优化
在 baseline 拿到后，本轮只允许做一个单目标优化：

- 继续收紧 `Graphic` 构造路径及其直接相关的 text / 基础属性初始化路径中的固定分配成本

允许改动范围：
1. `packages/vrender-core/src/graphic/graphic.ts`
2. `packages/vrender-core/src/graphic/text.ts`
   - 仅当 baseline 证明 text 构造路径仍是主要热点
3. `packages/vrender-core/__tests__/unit/graphic/*`
4. `packages/vrender/__tests__/browser/src/pages/*`
   - 仅限 `memory` / `vtable-lite` 相关 benchmark/workload
5. `packages/vrender/__tests__/browser/scripts/*`
   - 仅限 measurement / benchmark 脚本

## 这轮明确不做

1. 不触碰 renderer 主链
2. 不触碰 raf 主链
3. 不触碰 deferred 主链
4. 不触碰 shared-state 主链
5. 不回滚 D3 主架构
6. 不改变 `baseAttributes + resolvedStatePatch -> attribute` 语义
7. 不扩大当前契约边界
8. 不引入对象池
9. 不把 `run 1000` 升级为本轮门槛

## 契约边界

这轮仍只承诺：
- 顶层 `graphic.attribute.xxx = ...` 兼容成立

这轮仍不承诺：
- 任意深层 nested mutation 完全隔离

## 有效性判断

本轮 `P2` 只有在下面同时满足时才算成立：

1. `memory.ts run 100` no-trace 相比当前 `P1 accepted` 基线继续改善
2. `memory.ts run 100` trace 没有主导指标上的反向恶化
3. 至少一条 `VTable-lite` 业务 gate 证明：
   - 改动对“text + 图元 + stateProxy”场景有可见帮助
4. 定向测试继续全绿
5. 契约边界没有扩大
6. 没有触碰禁止改动的主链

## Stop-and-feedback 条件

出现以下任一情况，先停下来反馈：

1. 为了继续优化，必须改 renderer / raf / deferred / shared-state 主链
2. 为了继续优化，必须改变 truth-model 语义
3. 为了继续优化，必须扩大契约边界
4. `VTable-lite` workload 显示当前剩余问题并不在构造期固定成本
5. 新 workload 自身不稳定，无法形成可复跑 gate

## 最低验证要求

至少跑这些：

1. `rush compile -t @visactor/vrender-core`
2. memory 专项相关定向测试
3. `memory.ts run 100` no-trace
4. `memory.ts run 100` trace
5. `VTable-lite basic cells run 100` no-trace
6. `VTable-lite text-stateProxy cells run 100` no-trace
7. 如果你动到了 text 路径，再补最小相关定向测试

## 留档要求

继续回填：
- `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`

至少写清：
1. VTable-lite workload 定义
2. baseline / after 数据
3. 实际改动范围
4. 是否仍保持当前契约边界
5. 本轮 `P2` 是否接受

## 输出格式

1. `P2 status`
2. `VTable-lite workload`
3. `Files changed`
4. `Measurement`
5. `Verification`
6. `Did P2 succeed`

要求：
1. 先说明 baseline 是否拿到了
2. 再说明本轮单目标优化是什么
3. 如果指标没有改善，直接列 blocker
4. 不要因为已经允许进入 `P2`，就把结果默认写成成功

## 交给架构师的 review prompt

完成后，必须附一段可直接转发给架构师的 review prompt，至少覆盖：

1. VTable-lite basic cells 的 workload 定义是什么
2. VTable-lite text-stateProxy cells 的 workload 定义是什么
3. 本轮是否仍只改了构造期相关路径
4. 是否没有触碰 renderer / raf / deferred / shared-state 主链
5. `memory.ts run 100` no-trace / trace before-after 数据是什么
6. VTable-lite 业务 gate before-after 数据是什么
7. `stateProxy` 路径是否仍然成立
8. 当前契约边界是否仍未扩大
9. 本轮 `P2` 是否可以接受
