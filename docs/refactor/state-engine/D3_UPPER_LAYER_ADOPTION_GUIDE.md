# D3 上层业务接入指南

> **文档类型**：上层接入指南
> **用途**：给在 `vchart` / `vtable` 等上层仓库里工作的 agent 提供一份可以直接执行的 VRender 新版本接入说明
> **当前状态**：基于当前已确认基线编写：`P0 accepted`、`P1 accepted`、`legacy removal completed`、`browser alpha gate closed`
> **重要说明**：本文件只总结当前对上层已经稳定的使用口径，不重开 D3 主架构，也不把 `P2` 中仍在评估的性能尝试写成上层契约

---

## 1. 这份文档解决什么问题

如果你正在 `vchart` 仓库里做事，这份文档回答的是：

1. 新版本 VRender 现在**应该怎么创建 app / stage**
2. 上层代码现在**还能依赖哪些语义**
3. 哪些旧写法仍能跑，但**不该再写进新代码**
4. 遇到状态、`stateProxy`、shared-state、React、browser smoke 时，**应该按什么边界理解**

这份文档面向的是“要在上层仓库里继续开发”的 agent，不是面向 VRender 内核实现者的阶段设计文档。

---

## 2. 先记住这 9 条

如果你只记住最关键的规则，记这些：

1. 新代码优先使用 `createBrowserVRenderApp()` / `createNodeVRenderApp()`，不要继续写 deprecated `createStage()`
2. `app.createStage()` 是当前推荐入口；如果同一页面里会重建 stage，优先复用同一个 app
3. `app.release()` 会释放它仍然拥有的 stage；单 stage 场景里，仍建议显式先 `stage.release()`，再 `app.release()`
4. 根包 `createBrowserVRenderApp()` / `createNodeVRenderApp()` 是 **default bootstrap 入口**，不是细粒度按需装配入口
5. 当前 browser/node 是 app-scoped 一等路径；feishu / wx / taro / harmony / lynx / tt / miniapp 等环境能力仍在，但更多还停留在 legacy 或更底层装配面
6. 不要在已经走 root app creator 的 caller 里再混用 `initBrowserEnv()` / `initFeishuEnv()` / `initAllEnv()` 这类旧 env 初始化
7. 状态静态真值现在按 `baseAttributes + resolvedStatePatch -> attribute` 理解，动画不是新的真值源
8. `normalAttrs` 只剩 deprecated alias/view 语义，不要再把它当成 snapshot/restore 主路径
9. `stateProxy` 仍可用于**实例级局部动态样式**，但不要把它当成 shared-state 主模型；当前对上层也只承诺顶层 `graphic.attribute.xxx = ...` 兼容，不承诺任意深层 nested mutation 完全隔离

---

## 3. 当前稳定状态

截至当前基线，面向上层可依赖的状态是：

1. `P0 accepted`
   - 构造期固定成本优化第一轮已落地
2. `P1 accepted`
   - `simple attrs fast path` 已落地
3. `legacy removal completed`
   - 正式 runtime 主链与 repo 内主 caller 已不再依赖旧 `legacy -> app registry sync`
4. `handoff ready`
   - 当前仓库已恢复到可以交给上层使用的状态
5. `browser alpha gate closed`
   - browser binding / installer、functional、perf 和 external-stage-first app-scoped consumer rerun 均已通过
6. root app creator public typing 已补齐
   - `createBrowserVRenderApp()` / `createNodeVRenderApp()` 当前对外类型应返回 `IApp`

当前**不应**把下面这些写成上层契约：

1. `P2` 中仍在评估的性能尝试
2. 任意更深层的构造期表示优化
3. 对 `graphic.attribute` 深层 nested mutation 的额外隔离保证

---

## 4. 推荐入口

### 4.1 Browser

如果你在浏览器环境里工作，优先使用根包 `@visactor/vrender` 的显式 app-scoped 入口：

```ts
import { createBrowserVRenderApp } from '@visactor/vrender';

const app = createBrowserVRenderApp();

const stage = app.createStage({
  width: 800,
  height: 600,
  autoRender: true,
  canvas: 'main'
});
```

生命周期建议：

1. 一页内如果会反复销毁/重建 stage，优先复用同一个 `app`
2. 页面彻底结束时再 `app.release()`
3. 普通单 stage 场景中，仍建议保持 “`stage.release()` 后再 `app.release()`” 的顺序

ownership 规则：

1. `app.createStage()` 创建出的 stage 默认由该 `app` 跟踪
2. `app.release()` 会释放它仍然跟踪的 stage，再释放 app 级 registry/plugin 资源
3. 如果你自己先 `stage.release()`，再 `app.release()`，这是允许且推荐的显式顺序
4. 如果 stage 不是这个 `app` 创建的，不要假设 `app.release()` 应该替你释放它

### 4.2 Node

Node 侧同理：

```ts
import { createNodeVRenderApp } from '@visactor/vrender';

const app = createNodeVRenderApp();
const stage = app.createStage({
  width: 800,
  height: 600
});
```

额外提醒：

1. 当前 browser 是最稳定的推荐主路径
2. 如果你的上层真实依赖 node runtime，请把它当成单独验证项，不要直接假设它已经和 browser 路径等强

### 4.3 React

如果你在上层用的是 `react-vrender`，当前 `Stage` 组件内部已经切到 app-scoped `createBrowserVRenderApp() + app.createStage()` 模型。
对上层来说，重点是：

1. 不要再围绕 deprecated root `createStage()` 补 React 层 workaround
2. 重点关注 mount / update / unmount 生命周期是否符合你自己的上层约束

---

## 5. 旧入口现在怎么理解

`createStage()` 仍然存在，但它现在属于 **compat surface**：

```ts
import { createStage } from '@visactor/vrender';
```

当前理解方式应是：

1. 它还是可以工作
2. 但它已经是 deprecated 入口
3. 新代码不要再继续写它
4. 上层仓库如果已有大量旧 caller，可以分批迁移，但不要再新增

更直接地说：

- **允许旧代码继续跑**
- **不允许新代码继续扩 legacy usage**

---

## 6. 根包与 core 包怎么选

### 6.1 上层业务默认优先 `@visactor/vrender`

如果你在 `vchart` 这类上层仓库里工作，默认优先使用根包：

```ts
import { createBrowserVRenderApp, createNodeVRenderApp } from '@visactor/vrender';
```

原因：

1. 根包已经走默认 browser/node bootstrap
2. 默认 env / graphics / pickers / animations 会一起装好
3. 这是当前最接近“上层业务直接用”的稳定路径

### 6.2 只有在你明确需要自定义装配时才直接用 `@visactor/vrender-core`

如果你直接使用 `@visactor/vrender-core`，要意识到这更偏底层装配面。
这意味着你需要自己负责 app/context 级安装链，而不是假设 core 会像根包一样自动完成默认装配。

### 6.3 多环境与按需装配怎么选

当前建议直接按下面路由理解：

| 场景 | 当前推荐路径 | 说明 |
|------|------|------|
| browser 默认接入 | `@visactor/vrender` + `createBrowserVRenderApp()` | 当前一等路径 |
| node 默认接入 | `@visactor/vrender` + `createNodeVRenderApp()` | 有入口，但要单独验证真实 node runtime |
| 非 browser/node 环境 | `vrender-core` / `vrender-kits` 更底层 env loader / 自定义装配 | 当前不要假设已经存在对等 root app creator |
| 细粒度按需装配 | 更底层 installer / register surface | 当前 root app creator 不是细粒度按需装配接口 |

额外边界：

1. 当前 app-scoped 更接近 “app registry + lifecycle + bootstrap timing” 的显式化
2. 不要默认把它理解成完全隔离的 per-app/per-env runtime container
3. 如果你真的需要同进程混合多环境，必须单独验证，而不是直接套 browser/node 默认指南

---

## 7. 状态系统：上层必须知道的语义

### 7.1 静态真值

当前静态状态真值统一按下面理解：

```text
baseAttributes + resolvedStatePatch -> attribute
```

对上层的含义：

1. `attribute` 是当前生效结果
2. `baseAttributes` 是静态真值
3. 动画不再偷偷把最终结果回写成新的静态真值

### 7.2 `normalAttrs`

`normalAttrs` 现在只剩 deprecated alias/view 语义。
不要再在上层代码里把它当成：

1. 旧 snapshot
2. clear/restore 主路径
3. 动画结束后的 authoritative source

### 7.3 `stateProxy`

`stateProxy` 仍然可用，但应按下面理解：

1. 它适合做实例级、局部、动态样式 escape hatch
2. 它不是当前 shared-state 主模型
3. 如果你在上层需要共享状态定义，优先按 Group-first / Theme root scope 模型理解，而不是继续把 `stateProxy` 当 shared ownership

### 7.4 当前对上层仍成立的兼容边界

当前仍只承诺：

```ts
graphic.attribute.xxx = nextValue
```

这种**顶层**属性赋值兼容成立。

当前不承诺：

```ts
graphic.attribute.nested.deep.value = nextValue
```

这种任意深层 nested mutation 具备完全隔离语义。
如果上层代码严重依赖这种写法，应先收口成顶层替换式写法。

---

## 8. shared-state：上层如何理解

当前 shared-state 主模型已经收口为：

```text
Theme -> stage.rootSharedStateScope -> Group scopes -> Graphic
```

对上层的含义：

1. 共享状态定义优先通过 Theme / Group scope 理解
2. 不要再把实例级 `stateProxy` 设计成 shared-state 常规能力
3. 如果你在 `vchart` 层要做跨图元共享状态，优先确认自己走的是 scope 模型，而不是实例补丁拼接

---

## 9. 组件 / 插件 / 安装链

如果你只使用根包 `@visactor/vrender` 的默认 browser/node app 入口，通常不需要自己再手动补 env/graphics/picker 安装。

如果你在更底层做装配，当前 repo 已经存在 app-scoped installer surface，例如：

1. `installBrowserEnvToApp`
2. `installNodeEnvToApp`
3. `installDefaultGraphicsToApp`
4. `installBrowserPickersToApp`
5. `installNodePickersToApp`
6. `installPoptipToApp`
7. `installScrollbarToApp`

上层仓库的原则是：

1. 能走根包默认入口就不要自己再拼 legacy bootstrap
2. 真要自定义装配，也优先找 app-scoped installer，不要再回到旧 `ContainerModule` / legacy binding 路径
3. 当前 app-scoped public installer surface 主要覆盖 browser/node 默认 env、默认 graphics/pickers 和少量组件插件；它还不是完整的多环境一等 surface，也不是细粒度按需装配 surface
4. 如果你发现 caller 仍显式依赖 `registerRect()` / `registerArc()` / `loadFeishuEnv()` / `initAllEnv()` 这类能力，请先把它归类为“高级自定义装配路径”，不要直接套 root app creator 迁移模板

---

## 10. 上层仓库里的迁移清单

如果你要在 `vchart` 仓库里接入这版 VRender，建议按下面顺序做：

### 10.1 先查启动入口

优先 grep：

```bash
rg "createStage\\(" src test packages
rg "preLoadAllModule|loadBrowserEnv|loadNodeEnv|getLegacyBindingContext" src test packages
rg "initAllEnv|initBrowserEnv|initFeishuEnv|initWxEnv|initTaroEnv|initHarmonyEnv|loadAllEnv|loadFeishuEnv|loadWxEnv|loadTaroEnv" src test packages
rg "registerRect\\(|registerArc\\(|registerLine\\(|registerPolygon\\(|registerText\\(" src test packages
```

处理原则：

1. 新代码不再新增 deprecated `createStage()`
2. 如果已有旧 caller，优先迁到 `createBrowserVRenderApp()` / `createNodeVRenderApp()` + `app.createStage()`
3. 不再假设 import 副作用会自动补完运行时装配
4. 如果命中了额外 env loader 或 `register*()` 细粒度装配点，先把该 caller 标记为“高级自定义装配路径”，不要直接按普通 browser/node 模板替换

### 10.2 再查状态写法

重点看有没有：

1. 把 `normalAttrs` 当 snapshot/restore 主路径
2. 深层 nested mutation 直接改 `graphic.attribute`
3. 把 `stateProxy` 当 shared-state 常规能力

### 10.3 最后补 smoke / integration

至少建议补这些上层验证：

1. Browser 下自动首帧渲染，不依赖人工点击后才创建 stage
2. stage recreate 场景
3. text + graphic 混合场景
4. 如果上层使用 `stateProxy`，补一条 `text stateProxy` 验证
5. 如果有 React 接入，补 mount / unmount 生命周期验证
6. 如果你依赖 node runtime、非 browser/node 环境或细粒度按需装配，补对应的专门 smoke，不要只靠 browser baseline

---

## 11. 对 `vchart` agent 最有用的 smoke 结论

从当前 VRender 仓库的 smoke triage 里，最值得上层 agent 直接采用的结论有：

1. baseline smoke 页面不要依赖“点击之后才创建 stage”的旧 demo 形态
2. shared-state / batch-state 要有独立最小 smoke，不要指望大而杂的历史 demo 间接覆盖
3. 部分历史页面仍是 triage/migration 样本，不应直接等价为 D3 主链 blocker
4. 远程脚本驱动的 `vchart` / `vtable` demo 不能直接当成稳定 handoff baseline

换句话说：

- **上层仓库请补自己的最小 smoke**
- **不要把历史 demo 页面当成唯一验收依据**

---

## 12. 当前哪些内容还不是上层契约

当前不要把下面这些写进上层依赖假设：

1. `P2` 中仍在评估的 memory/VTable 性能尝试
2. 任意新的构造期 lazy-init 候选
3. `_AABBBounds lazy-init` 这类还没单独拍板的更宽边界方案
4. 非 browser/node 的一等 app-scoped creator 已经齐全
5. 存在细粒度的 app-scoped public on-demand installer family
6. 当前 app-scoped 已经天然提供完整的 per-app/per-env 隔离

当前可对上层明确说的是：

1. `P0 accepted`
2. `P1 accepted`
3. `legacy removal completed`
4. 可以基于这版 VRender 继续开发/验证
5. browser root-package 默认路径当前是主推荐入口

当前不能对上层说的是：

1. `P2 accepted`
2. “所有高数量场景都已进一步优化完成”
3. “多环境一等支持已经全部迁入新 app-scoped 主路径”
4. “细粒度按需装配已经由 root app creator 等价承接”

---

## 13. 给 `vchart` agent 的推荐操作顺序

如果你现在就在 `vchart` 目录工作，建议按下面顺序行动：

1. 先确认当前接入点是不是 deprecated `createStage()`
2. 如果是新代码，直接改成 `createBrowserVRenderApp()` / `createNodeVRenderApp()` + `app.createStage()`
3. 再确认状态逻辑里有没有继续依赖旧 `normalAttrs` 或深层 nested mutation
4. 再确认当前 caller 是否还显式依赖额外 env loader 或 `register*()` 细粒度装配；如果是，先把它归类为高级自定义装配路径
5. 再补最小 smoke：
   - 自动首帧
   - stage recreate
   - text + graphic
   - 如有 `stateProxy`，补 text-stateProxy
6. 如果路径涉及 node runtime / 非 browser/node 环境 / 细粒度装配，追加专门 smoke，再决定是否继续迁移
7. 只有在 smoke 稳定后，再继续放大到更复杂业务页面

---

## 14. 文档关系

如果你需要更细的背景，而不仅是上层接入动作：

1. 想知道当前 overall 结论：
   - 看 [D3_FINAL_SUMMARY.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_FINAL_SUMMARY.md)
2. 想知道 legacy/createStage 收口到了哪里：
   - 看 [D3_LEGACY_PATH_REMOVAL_STATUS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md)
3. 想知道 browser smoke 对上层迁移给了哪些结论：
   - 看 [D3_PRE_HANDOFF_SMOKE_TRIAGE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_TRIAGE.md)
4. 想知道 memory benchmark 为什么还要单独做性能专项：
   - 看 [D3_MEMORY_BENCHMARK_PERF_CONTEXT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MEMORY_BENCHMARK_PERF_CONTEXT.md)
5. 想知道当前接入方式的摩擦点分层判断：
   - 看 [D3_UPPER_LAYER_INTEGRATION_FRICTION_REVIEW.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_UPPER_LAYER_INTEGRATION_FRICTION_REVIEW.md)
6. 想知道 multi-env / on-demand 是否继续作为正式承诺保留，以及对应治理任务：
   - 看 [D3_MULTI_ENV_ON_DEMAND_GOVERNANCE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MULTI_ENV_ON_DEMAND_GOVERNANCE.md)
7. 想知道“推荐接入链”和“当前真实上层链”是否已经一致：
   - 看 [D3_UPPER_LAYER_LOGIC_CHAIN_AUDIT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_UPPER_LAYER_LOGIC_CHAIN_AUDIT.md)
8. 想知道如何把 `VChart` 推到第一条真实 app-scoped 集成链：
   - 看 [D3_VCHART_APP_SCOPED_ALIGNMENT_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_VCHART_APP_SCOPED_ALIGNMENT_PLAN.md)

但如果你只是要在上层仓库里开始干活，这份文档应作为第一入口。
