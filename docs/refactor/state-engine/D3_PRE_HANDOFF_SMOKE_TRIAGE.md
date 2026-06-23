# D3 交付前 Smoke Triage 与 Baseline

> **文档类型**：交付前 smoke triage / baseline 留档
> **用途**：记录 `packages/vrender rushx start` browser harness 的全量 triage、baseline 页面、历史 exclusions 与上层迁移结论
> **当前状态**：已完成
> **重要说明**：本文件不是新的架构规范源；D3 语义仍以 `graphic-state-animation-refactor-expectation.md`、`D3_ARCH_DESIGN.md` 和各 Phase 主文档为准

---

## 1. 结果摘要

本轮 browser smoke harness 已达到 handoff gate 所需的最小可用状态：

1. `packages/vrender rushx start` server 可稳定启动。
2. baseline smoke 页面已形成，且已独立复跑通过。
3. 全量页面 triage 已完成，当前共覆盖 `69` 个 route。
4. 当前不存在“未分类的致命失败”；历史页、远程依赖页和 legacy fixture 已明确降级为 triage / exclusion，不混入 baseline。

全量 triage 概览：

- 页面总数：`69`
- `canOpen=false`：`9`
- `hasFirstFrame=false`：`25`
- 分类分布：
  - `注册/装配问题`：`10`
  - `入口初始化问题`：`1`
  - `上层调用姿势与新 D3 语义不兼容`：`1`
  - `历史页面本身失效或过时`：`4`
  - 其余：`none`

本轮针对 harness 的最小收口包括：

1. 增加 smoke telemetry 与 route 解析 helper。
2. 修正 `tsx` 页（`jsx` / `react`）的动态导入识别。
3. 为 baseline 候选页补 smoke-mode 首帧：
   - `animate-state.ts`
   - `interactive-test.ts`
   - `react.tsx`
4. 新增最小 shared-state / batch-state baseline 页：
   - `shared-state-batch-smoke.ts`
5. 为 runner 增加 `baseline-only` 与 route filter 能力，确保 baseline 可重复验证。

---

## 2. Baseline Smoke 页面

当前 baseline smoke 页面固定为：

1. `rect`
2. `state`
3. `animate-state`
4. `interactive-test`
5. `shared-state-batch-smoke`
6. `react`

baseline-only 复跑命令：

```bash
D3_SMOKE_BASE_URL=http://127.0.0.1:3012/ \
D3_SMOKE_OUT=/tmp/vrender-smoke-baseline.json \
D3_SMOKE_BASELINE_ONLY=1 \
common/temp/node_modules/.pnpm/node_modules/.bin/electron \
packages/vrender/__tests__/browser/scripts/run-smoke-triage.cjs
```

baseline-only 结果：

| route | canOpen | hasFirstFrame | handling |
|------|------|------|------|
| `animate-state` | 是 | 是 | `baseline candidate` |
| `interactive-test` | 是 | 是 | `baseline candidate` |
| `state` | 是 | 是 | `baseline candidate` |
| `rect` | 是 | 是 | `baseline candidate` |
| `react` | 是 | 是 | `baseline candidate` |
| `shared-state-batch-smoke` | 是 | 是 | `baseline candidate` |

这些页分别覆盖：

1. 基础图形渲染：`rect`
2. 状态切换：`state`
3. 动画：`animate-state`
4. 交互事件：`interactive-test`
5. shared-state / batch-state：`shared-state-batch-smoke`
6. 接近上层接入：`react`

---

## 3. Exclusions 与迁移结论

### 3.1 当前明确不纳入 baseline 的历史页

以下页面保留在 harness 中，但明确不纳入首批 handoff baseline：

1. `performance-test`
   - 历史页面本身失效或过时
   - 依赖已不存在的 `../performance` 入口
2. `anxu-picker`
   - 历史页面本身失效或过时
   - 依赖旧 kits / picker 装配出口
3. `gif-image`
   - 历史页面本身失效或过时
   - 依赖旧资源加载/远程资源环境
4. `vtable`
   - 历史页面本身失效或过时
   - 依赖旧 DI / `ContainerModule` 语义

### 3.2 需要写入上层接入说明的迁移结论

本轮 smoke 结果反哺出的迁移结论：

1. `tsx` 页面必须在 page registry 中显式声明 `type: 'tsx'`，否则 browser harness 的动态导入会误判为 `.ts`。
2. baseline smoke 页面不能依赖“人工点击后才创建 stage”的旧 demo 形态；handoff smoke 必须能在加载时自动给出首帧。
3. shared-state / batch-state 需要独立的最小 smoke 页，不能依赖历史综合 demo 间接覆盖。
4. 部分历史页仍在依赖旧 env/装配/legacy fixture，不应包装成 D3 主链 blocker，而应保留为 triage/migration 样本。

### 3.3 当前仍保留为 triage only 的典型问题

以下页面失败/空白，但本轮不阻塞 handoff baseline：

1. 注册/装配问题：
   - `pick-test`
   - `animate`
   - `clip`
   - `scatter3d`
   - `wrap-text`
   - `html`
   - `editor`
   - `wordcloud3d`
2. 入口初始化问题：
   - `chart`
3. 上层调用姿势与新 D3 语义不兼容：
   - `jsx`
4. 打开正常但默认无首帧、仍属历史/人工操作 demo：
   - `performance`
   - `animate-next`
   - `animate-ticker`
   - `custom-animate`
   - `story-animate`
   - `animate-tick`
   - `memory`
   - `stage`
   - `offscreen`
   - `vchart`
   - `harmony`

---

## 4. 全量 Triage 表

> 字段说明：
> `有运行时错误` = `uncaught error` 或 `unhandled rejection`

| route | 分类 | 能否打开 | 有首帧 | 有运行时错误 | 有 console error | 行为结论 | baseline 候选 | root cause | 处理结论 |
|------|------|------|------|------|------|------|------|------|------|
| image | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| pick-test | graphic | 否 | 否 | 否 | 否 | unknown until manual inspection | 否 | 注册/装配问题 | triage only |
| performance-test | graphic | 否 | 否 | 否 | 否 | unknown until manual inspection | 否 | 历史页面本身失效或过时 | exclude from baseline |
| performance | graphic | 是 | 否 | 否 | 否 | none observed | 否 | none | triage only |
| animate-next | graphic | 是 | 否 | 否 | 否 | none observed | 否 | none | triage only |
| animate-state | graphic | 是 | 是 | 否 | 否 | none observed | 是 | none | baseline candidate |
| animate-ticker | graphic | 是 | 否 | 否 | 否 | none observed | 否 | none | triage only |
| custom-animate | graphic | 是 | 否 | 否 | 否 | none observed | 否 | none | triage only |
| story-animate | graphic | 是 | 否 | 否 | 否 | none observed | 否 | none | triage only |
| animate-tick | graphic | 是 | 否 | 否 | 否 | none observed | 否 | none | triage only |
| memory | graphic | 是 | 否 | 否 | 否 | none observed | 否 | none | triage only |
| anxu-picker | graphic | 否 | 否 | 否 | 否 | unknown until manual inspection | 否 | 历史页面本身失效或过时 | exclude from baseline |
| interactive-test | graphic | 是 | 是 | 否 | 否 | none observed | 是 | none | baseline candidate |
| drag-test | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| gesture-test | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| image-cloud | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| arc | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| text | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| circle | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| rect | graphic | 是 | 是 | 否 | 否 | none observed | 是 | none | baseline candidate |
| path | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| symbol | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| line | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| area | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| richtext | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| glyph | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| star | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| layer | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| stage | graphic | 是 | 否 | 否 | 否 | none observed | 否 | none | triage only |
| test-arc-path | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| polygon | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| animate | graphic | 否 | 否 | 否 | 否 | unknown until manual inspection | 否 | 注册/装配问题 | triage only |
| lottie | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| window-event | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| state | graphic | 是 | 是 | 否 | 否 | none observed | 是 | none | baseline candidate |
| graphic | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| offscreen | graphic | 是 | 否 | 否 | 否 | none observed | 否 | none | triage only |
| theme | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| chart | graphic | 否 | 否 | 否 | 否 | unknown until manual inspection | 否 | 入口初始化问题 | triage only |
| morphing | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| incremental | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| bar3d | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| clip | graphic | 否 | 否 | 否 | 否 | unknown until manual inspection | 否 | 注册/装配问题 | triage only |
| wordcloud3d | graphic | 是 | 否 | 否 | 否 | unknown until manual inspection | 否 | 注册/装配问题 | triage only |
| pie3d | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| group-perf | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| pyramid3d | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| scroll | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| texture | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| scatter3d | graphic | 否 | 否 | 否 | 否 | unknown until manual inspection | 否 | 注册/装配问题 | triage only |
| wrap-text | graphic | 是 | 否 | 否 | 否 | unknown until manual inspection | 否 | 注册/装配问题 | triage only |
| bin-tree | graphic | 否 | 否 | 否 | 否 | unknown until manual inspection | 否 | 注册/装配问题 | triage only |
| animate-3d | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| flex | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| jsx | graphic | 是 | 是 | 否 | 否 | unknown until manual inspection | 否 | 上层调用姿势与新 D3 语义不兼容 | triage only |
| dynamic-texture | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| html | graphic | 是 | 否 | 否 | 否 | unknown until manual inspection | 否 | 注册/装配问题 | triage only |
| editor | graphic | 否 | 否 | 否 | 否 | unknown until manual inspection | 否 | 注册/装配问题 | triage only |
| globalCompositeOperation | graphic | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| react | graphic | 是 | 是 | 否 | 否 | none observed | 是 | none | baseline candidate |
| shared-state-batch-smoke | graphic | 是 | 是 | 否 | 否 | none observed | 是 | none | baseline candidate |
| gif-image | graphic | 是 | 否 | 否 | 否 | unknown until manual inspection | 否 | 历史页面本身失效或过时 | exclude from baseline |
| text-fly-in | 组件 | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| modal | 组件 | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| points3d | 组件 | 是 | 是 | 否 | 否 | none observed | 否 | none | retain, not baseline |
| richtext-editor | 组件 | 是 | 是 | 否 | 否 | unknown until manual inspection | 否 | 注册/装配问题 | triage only |
| vchart | 上层 | 是 | 否 | 否 | 否 | none observed | 否 | none | triage only |
| vtable | 上层 | 是 | 否 | 是 | 否 | unknown until manual inspection | 否 | 历史页面本身失效或过时 | exclude from baseline |
| harmony | 上层 | 是 | 否 | 否 | 否 | none observed | 否 | none | triage only |
