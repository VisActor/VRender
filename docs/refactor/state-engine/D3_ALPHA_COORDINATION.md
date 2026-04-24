# D3 Alpha Coordination

> **文档类型**：协作文档
> **用途**：为 `VRender agent`、`VChart agent` 和协调者提供同一份 alpha gate 共享事实面
> **当前状态**：browser alpha gate closed
> **重要说明**：本文件不是新的设计文档，也不替代 implementation log；这里只保留当前有效事实、owner 和下一步

---

## 1. Current decision

当前已经拍板的结论：

- `P0 accepted`
- `P1 accepted`
- `P2 approved to start`
- `P2` 当前 **未 accepted**
- `Text.cache lazy-init` 引入的 `WrapText` 兼容回归已修复并通过复核
- 当前可以恢复继续评估 `P2`
- 当前 **browser alpha gate 已关闭**
- 当前可以按 **browser alpha ready / browser alpha verification build** 处理
- 当前 **还不是 node-complete alpha**

当前统一判断：

1. browser binding / installer root-cause 已完成 consumer-side re-check
2. full-link browser 功能回归已通过
3. `textHeavy` mixed scene recreate 性能回归已完成双边验证并从 browser alpha gate 中移除
4. 推荐 app-scoped 入口的真实上层接入验证已在 `external-stage-first` 路径完成 fresh rerun
5. 上层接入体验审查与“多环境一等支持”治理任务已完成，当前推荐接入契约已足够支撑 browser alpha 验证

---

## 2. Browser alpha gate

当前按 browser-first 口径判断 alpha。以下项目现已满足：

1. `VRender` root package export / build artifact 一致
2. `vrender-components` fresh build 不再阻塞
3. `VChart` 在真实依赖图 + full link 下能完成 browser import/build
4. `VChart` 在真实依赖图 + full link 下能进入 browser 首帧
5. `VChart` 至少完成一轮基于推荐 browser app-scoped 入口的真实接入验证
6. 关键 browser 功能场景无明显回归
7. browser 性能没有出现明确不可接受退化
8. 当前 blocker 不再落在基础模块导出 / runtime / bootstrap / binding 层

当前明确 **不** 把下面两项当作 browser alpha gate：

- `P2 accepted`
- `createNodeVRenderApp().createStage()` 的 node runtime 全绿

node app-scoped runtime 仍然是已知 blocker，但当前单独挂账，不作为 browser alpha 先决条件。

---

## 3. Confirmed stable

### 3.1 D3 / performance baseline

- `P0` 构造期固定成本优化已 accepted
- `P1` simple attrs fast path 已 accepted
- `Text.cache lazy-init` 兼容回归已修复
- 当前没有新的已知 `text / cache / layout` 副作用

### 3.2 VChart baseline

在 **原始依赖** 下，`VChart` browser baseline 已 fresh 证明可用：

- 基础渲染：bar / line 正常 init、update、recreate
- 文字密集场景：text-heavy mixed scene 正常 init、update、recreate
- 状态/交互：hover / select / tooltip 程序化触发通过
- runtime 命中了真实上层 **非 text** `stateProxy` 透传

### 3.3 VChart full-link functional lane

在 `67ddeace8525b99b5c5e081e342aaa00278fc7a4` 上，consumer-side full-link browser 功能回归已 fresh 通过：

- `basicBar`: `firstFrame: true`，`init / update / recreate` 正常，交互正常
- `basicLine`: `firstFrame: true`，`init / update / recreate` 正常，交互正常
- `textHeavy`: `firstFrame: true`，`init / update / recreate` 正常，交互正常
- 当前不再出现：
  - `installNodeEnvToApp`
  - `Arc3dRender`
  - `Pyramid3dRender`
  - `StarRender`

### 3.4 VChart full-link performance

first round before/after 性能对比已完成，且 `textHeavy` recreate 回归已在后续修复中收口。

first round snapshot：

- `basicBar`
  - render/update/recreate: `151.54 / 28.96 / 41.04ms -> 133.13 / 21.25 / 49.87ms`
  - perf 中位数: `16.29 / 16.08 / 33.02ms -> 15.44 / 17.19 / 33.46ms`
- `basicLine`
  - render/update/recreate: `31.96 / 15.63 / 41.00ms -> 24.16 / 15.66 / 41.71ms`
- `textHeavy`
  - render/update/recreate: `92.50 / 39.50 / 58.54ms -> 81.92 / 51.42 / 99.46ms`
  - perf 中位数: `32.39 / 32.17 / 49.90ms -> 31.90 / 30.25 / 74.96ms`

后续在 `9b6508ea70ac223be87a2e86608ebcb3db49d1cf` 上完成了 targeted perf re-check：

- `textHeavy` functional recreate: `57.71ms`
- `textHeavy` perf recreate median: `45.96ms`
- `recreate longTasks`: `0`

结论：`textHeavy mixed scene recreate` perf blocker 已完成双边验证并移出 browser alpha gate。

### 3.5 Latest VRender delivery

`VRender agent` 最新有效提交：

- `9b6508ea70ac223be87a2e86608ebcb3db49d1cf`

该提交 fresh 证明：

- `packages/vrender-components` build 通过
- `AbstractComponent` 的 `onSetStage` 已收成 attach-only，detach 路径不再触发 `render() + bindEvents()`
- targeted detach probe：
  - before `componentMarkReleaseDuration: 45.92ms`
  - after `componentMarkReleaseDuration: 3.45ms`
  - before `_onSetStage callback duration: 42.33ms`
  - after `_onSetStage callback duration: 0ms`
- canonical full-link self-check：
  - `textHeavy` functional recreate: `99.46 -> 57.87ms`
  - functional recreate longTasks: `1 -> 0`
  - perf recreate median: `74.96 -> 50.42ms`
  - perf recreate longTasks: `1 -> 0`
  - `basicBar / basicLine / textHeavy` 仍均为 `firstFrame: true`

### 3.6 App-scoped external-stage-first validation

当前 fresh 证据表明，`external-stage-first` 的推荐 app-scoped 接入路径已经在 consumer 侧完成 rerun：

- `createBrowserVRenderApp()`: 可用
- `app.createStage()`: 可用
- `new VChart(..., { stage })`: 可用
- `directApp.status = ok`
- `injectedApp.status = ok`
- `injectedApp.firstFrame = true`
- `beforeRelease = { hasWindow: true, hasDefaultLayer: true }`
- `afterRelease = { hasWindow: true, hasDefaultLayer: true }`
- `reuseSameStage.success = true`
- `globalErrors = []`

结论边界：

- 推荐 app-scoped 入口在 `external-stage-first` 路径上已经具备真实上层验证证据
- 这不等于已经完成 full internal migration

### 3.7 Root-only browser smoke

当前 fresh 证据表明，下面两条都已经转绿：

- `createBrowserVRenderApp() + app.createStage({ canvas: HTMLCanvasElement })`
- `createBrowserVRenderApp() + app.createStage({ canvas: 'canvas-id' })`

结论边界：

- 两种 browser 入口现在都可作为稳定入口使用
- 前提是目标 canvas 已先插入 DOM

---

## 4. Cleared blockers

以下 blocker 已从 browser alpha gate 中移除：

| Cleared blocker | Owner | fresh 结论 |
| --- | --- | --- |
| `vrender-core` ES export 缺失 `container` | `VRender-side` | 已清掉，`VChart` full-link browser build/import 已通过 |
| browser app-scoped `canvas: 'id'` 路径不稳 | `VRender-side` | 已清掉，root-only browser smoke 已支持 create -> render -> release -> recreate |
| `installNodeEnvToApp` 导出 / 预构建不一致 | `VRender-side` | 已清掉，canonical consumer rerun 中不再出现 `does not provide an export named 'installNodeEnvToApp'` |
| 默认 browser env / picker 安装链过宽 | `VRender-side` | 已完成 consumer-side re-check，canonical rerun 中不再出现 `installNodeEnvToApp` / `Arc3dRender` / `Pyramid3dRender` / `StarRender`，且 `basicBar / basicLine / textHeavy` 已拿到 `firstFrame: true` |
| `VChart` full-link browser 功能回归 | `cross-repo integration` | 已通过，三个场景 `init / update / recreate / interaction` 正常 |
| `textHeavy` mixed scene recreate 性能回归 | `VRender-side` | 已完成 consumer-side perf re-check，`functional recreate` 回到 `57.71ms`，`perf recreate median` 回到 `45.96ms`，且 `recreate longTasks` 消失 |
| 推荐 app-scoped external-stage-first 接入验证 | `cross-repo integration` | 已完成 consumer-side fresh rerun，`createBrowserVRenderApp() + app.createStage() + { stage }` 路径稳定成立 |

---

## 5. Remaining non-gate follow-ups

以下事项保留，但不再作为当前 browser alpha gate blocker：

| Item | Owner | 当前状态 | 说明 |
| --- | --- | --- | --- |
| `createNodeVRenderApp().createStage()` node runtime 未转绿 | `VRender-side` | open | `createWindow` 为空导致 node runtime 失败；这是 node lane，不属于当前 browser gate |
| `VChart` source-level external-stage-first 对齐尚未正式落仓 | `cross-repo integration` | follow-up | 当前已有 consumer harness 证据；下一步应按 `D3_VCHART_APP_SCOPED_ALIGNMENT_PLAN.md` 推进源码对齐 |
| 是否继续做 full internal migration | `cross-repo integration` | follow-up | 当前不作为 alpha 先决条件，应在 external-stage-first 稳定后再决定 |
| 真实上层 `text stateProxy` 路径未覆盖 | `cross-repo integration` | follow-up | 当前只覆盖到非 text `stateProxy` |
| 外部传入 stage 的更完整 ownership 约束与治理沉淀 | `VChart-side` | follow-up | 当前 external-stage-first 路径已可用，但源码侧契约治理仍建议继续落档 |

---

## 6. Latest handoff

### 6.1 Latest from VRender agent

- 仓库：`/Users/bytedance/Documents/GitHub/VRender2`
- 最新有效提交：`9b6508ea70ac223be87a2e86608ebcb3db49d1cf`
- 最新交付内容：
  - 将 `AbstractComponent` 的 `onSetStage` 收成 attach-only
  - detach 路径不再触发组件 `render() + bindEvents()`
  - `textHeavy` recreate perf blocker 已收口
  - 当前不需要继续围绕 browser alpha gate 修复

### 6.2 Latest from VChart agent

- 仓库：`/Users/bytedance/Documents/GitHub/VChart`
- 工作区状态：验证后已回退 link，repo clean
- 最新结论：
  - browser binding / installer 根因已通过
  - browser functional lane 已通过
  - browser perf lane 已通过
  - `external-stage-first` app-scoped fresh rerun 已通过
  - 当前 browser alpha gate 已无新的 blocker
- 当前下一步：
  - 如需要继续推进，按 `D3_VCHART_APP_SCOPED_ALIGNMENT_PLAN.md` 做 source-level alignment，而不是重新验证 gate

---

## 7. Repro artifacts

当前关键证据文件包括：

- `/tmp/vchart-vrender-verify/linked-67ddeac-functional.json`
- `/tmp/vchart-vrender-verify/baseline-67ddeac-before-perf.json`
- `/tmp/vchart-vrender-verify/linked-67ddeac-after-perf.json`
- `/tmp/vchart-vrender-verify/linked-vchart-textheavy-recheck.json`
- `/tmp/vchart-vrender-verify/linked-vchart-appscoped-external-stage.json`
- `/tmp/vchart-vrender-verify/linked-vchart-appscoped-external-stage-rerun.json`

---

## 8. Current recommended next step

当前最短路径只有 2 步：

1. 按 `D3_VCHART_APP_SCOPED_ALIGNMENT_PLAN.md` 推进 `VChart` 的 source-level external-stage-first 对齐
2. 如对齐过程中再次出现 `VRender-side` 问题，再由 `VRender agent` 接手收口

browser alpha 发布后的完整收尾优先级看：

- [D3_POST_ALPHA_WRAPUP_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_POST_ALPHA_WRAPUP_PLAN.md)

当前不再需要：

- 重做 browser alpha gate 验证
- 扩大 browser perf gate 场景
- 围绕已关闭 blocker 继续做 owner 收窄

---

## 9. Current coordination verdict

当前统一结论：

- `VChart` 在旧接入姿势下可以继续验证
- `VRender` root-only browser app-scoped smoke 已转绿
- `VChart` 在真实依赖图 + full link 下，已经通过 build/import
- 默认 browser env / picker 安装链过宽这条 root cause，已经在 consumer-side re-check 中通过
- `VChart` full-link browser 功能回归已通过
- `textHeavy` recreate perf blocker 已完成 consumer-side re-check，可从 browser alpha gate 中移除
- 推荐 app-scoped `external-stage-first` 真实上层接入验证已完成 fresh rerun
- 因此当前 **browser alpha gate 已关闭**

当前协调口径：

- **可以按 browser alpha ready / browser alpha verification build 处理**
- **不能写成 node-complete alpha**
- 剩余事项全部按 non-gate follow-up 管理

---

## 10. Coordination maintenance protocol

从现在开始，这份协作文档按下面规则维护：

### 10.1 可以直接同步的事实

以下内容可以直接更新，不需要额外确认：

- 最新有效 commit sha
- 最新复现命令
- 结果文件路径
- `VRender agent` / `VChart agent` 最新回报的原始事实

### 10.2 可以先更新为保守状态的变化

以下变化可以先写入文档，但必须保持保守表述：

- `open -> pending re-check`
- 新增 `producer-side observed` blocker
- blocker 优先级调整
- 当前最短下一步变化

### 10.3 必须双边证据后才能写死的结论

以下变化不能只凭单边证据直接写成最终结论：

- `open -> cleared`
- blocker owner 变化
- `alpha readiness` 变化
- gate 定义变化
- 当前最重要 blocker 变化

只有同时满足下面两条时，才允许把 blocker 正式写成 `cleared`：

1. `producer-side` fresh 验证通过
2. `consumer-side` fresh 复验通过

### 10.4 Browser alpha closed 后的维护规则

当 browser alpha gate 已关闭后：

- 剩余事项默认降级为 non-gate follow-up
- 不再把 node lane、source-level migration、coverage 补齐类任务重新拉回 browser alpha 主判断
- 若未来出现新的 browser-side fresh 回归，再重新打开 gate
