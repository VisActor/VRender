# VRender Test And Verification

本文整理后续 agent 常用验证入口。实际验证要按改动范围收敛，不能只跑单包单测就声明跨包安全。

## Rush 常用命令

仓库使用 Rush，命令定义在 `common/config/rush/command-line.json`。

常见命令：

- `rush compile`
- `rush compile -t @visactor/vrender-core`
- `rush test`
- `rush test -t @visactor/vrender`
- `rush eslint`
- `rush lint-staged`
- `rush start`
- `rush components`

在 package 目录内可用：

- `rushx compile`
- `rushx test`
- `rushx test:electron`
- `rushx eslint`
- `rushx build`

## 单包 Compile

常用：

- core：`rush compile -t @visactor/vrender-core`
- root：`rush compile -t @visactor/vrender`
- animate：`rush compile -t @visactor/vrender-animate`
- components：`rush compile -t @visactor/vrender-components`
- kits：`rush compile -t @visactor/vrender-kits`
- react：`rush compile -t @visactor/react-vrender`
- react utils：`rush compile -t @visactor/react-vrender-utils`

如果改动影响依赖上游包，优先用 Rush `-t` 编译目标和依赖链，不只在包内跑 `tsc`。

## 单包 Test

在对应 package 下：

- `cd packages/vrender-core && rushx test`
- `cd packages/vrender-animate && rushx test`
- `cd packages/vrender-components && rushx test`
- `cd packages/vrender-kits && rushx test`
- `cd packages/vrender && rushx test`
- `cd packages/react-vrender && rushx test`
- `cd packages/react-vrender-utils && rushx test`

Electron/browser 相关：

- `rushx test:electron`
- browser dev：`rush start` 或 `rush components`

## Touched Files ESLint

`.lintstagedrc` 当前只覆盖 `{packages,tools}/**/*.{ts,tsx}`，命令是 `eslint --color --fix` + prettier。

建议：

- 改 TS/TSX 源码：优先跑对应 package `rushx eslint` 或 `rush lint-staged`。
- 只改 Markdown 文档：通常无需 eslint，但仍应跑 `git diff --check`。
- 不要把 docs-only 验证写成“lint/typecheck 全通过”，除非实际运行。

## 基础 Diff 检查

每次完成前至少：

```bash
git diff --check
git diff --stat
git status --short
```

docs-only 任务要确认 diff stat 只包含文档路径。

## Browser Smoke 位置

root package：

- `packages/vrender/__tests__/browser`
- 页面：`packages/vrender/__tests__/browser/src/pages/*`
- harness：`packages/vrender/__tests__/browser/src/harness.ts`
- smoke 脚本：`packages/vrender/__tests__/browser/scripts/run-smoke-triage.cjs`

components：

- `packages/vrender-components/__tests__/browser`
- examples：`packages/vrender-components/__tests__/browser/examples/*`

core：

- `packages/vrender-core/__tests__/browser`

## Core Graphic / State 测试

位置：

- `packages/vrender-core/__tests__/unit/graphic/*`
- `packages/vrender-core/__tests__/perf/attribute-model-performance.test.ts`

重点：

- `state-engine.test.ts`
- `state-definition-compiler.test.ts`
- `state-transition-orchestrator.test.ts`
- `state-animation.test.ts`
- `state-same-state-refresh.test.ts`
- `shared-state-scope.test.ts`
- `shared-state-refresh.test.ts`
- `shared-state-fallback.test.ts`
- `normal-attrs.test.ts`
- `attribute-layer-core.test.ts`
- `glyph-state.test.ts`

## Entries / App-Context 测试

core：

- `packages/vrender-core/__tests__/unit/entries/app-context.test.ts`
- `packages/vrender-core/__tests__/unit/entries/runtime-installer.test.ts`
- `packages/vrender-core/__tests__/unit/entries/entry.test.ts`

root：

- `packages/vrender/__tests__/unit/entries.test.ts`
- `packages/vrender/__tests__/unit/shared-app.test.ts`
- `packages/vrender/__tests__/unit/shared-browser-entry.test.ts`
- `packages/vrender/__tests__/unit/shared-browser-lite-entry.test.ts`
- `packages/vrender/__tests__/unit/app-bootstrap-binding.test.ts`
- `packages/vrender/__tests__/unit/node-app-runtime.test.ts`
- `packages/vrender/__tests__/unit/build-artifact-consistency.test.ts`

## Animate 测试

位置：`packages/vrender-animate/__tests__`

重点：

- `unit/animation-runtime-attribute.test.ts`
- `unit/animate-extension-closeout.test.ts`
- `unit/animate-tracking.test.ts`
- `unit/graphic-state-extension.test.ts`
- `unit/ticker.test.ts`
- `unit/timeline.test.ts`
- `unit/custom-appear-static-truth.test.ts`
- `unit/custom-animate-null-props.test.ts`
- `perf/animation-frame-performance.test.ts`

## Components / Kits 测试

components：

- `packages/vrender-components/__tests__/unit/*`
- `packages/vrender-components/__tests__/electron/*`
- `packages/vrender-components/__tests__/browser/examples/*`

重点：

- `unit/component-update-animation-static-truth.test.ts`
- `unit/label-update-animation.test.ts`
- `unit/module-explicit-bindings.test.ts`
- `unit/legacy-removal-browser-examples.test.ts`
- `unit/abstract-component-stage-detach.test.ts`
- `unit/brush-stage-detach.test.ts`

kits：

- `packages/vrender-kits/__tests__/unit/env/*`
- `packages/vrender-kits/__tests__/unit/picker/*`
- `packages/vrender-kits/__tests__/unit/register/*`
- `packages/vrender-kits/__tests__/unit/render/*`
- `packages/vrender-kits/__tests__/register/register.test.ts`
- `packages/vrender-kits/__tests__/tools/dynamicTexture/effect.test.ts`

## 最小验证矩阵

只改文档：
- `git diff --check`
- `git diff --stat`
- `git status --short`

改 core graphic/state：
- `rush compile -t @visactor/vrender-core`
- `cd packages/vrender-core && rushx test --runInBand __tests__/unit/graphic`
- 影响上层时加 `cd packages/vrender && rushx test`

改 entries/runtime：
- `rush compile -t @visactor/vrender`
- root entries/app/shared targeted tests
- 影响 kits 时加 kits env/picker tests

改 renderer/picker/register：
- core render/registry tests
- kits picker/register tests
- root app bootstrap binding tests

改 animate：
- `rush compile -t @visactor/vrender-animate`
- `cd packages/vrender-animate && rushx test`
- 涉及 components animation 时加 components targeted tests

改 components：
- `rush compile -t @visactor/vrender-components`
- 对应组件 unit/electron/browser example
- 涉及动画时加 animate runtime targeted tests

改 kits/env：
- `rush compile -t @visactor/vrender-kits`
- kits env/window/picker/register tests
- root entry tests

改 React：
- `rush compile -t @visactor/react-vrender`
- `cd packages/react-vrender && rushx test`
- Stage app 生命周期改动时加 root app entry tests

## 多端入口额外验证

改 wx / lynx / harmony / taro / feishu / tt：

- 跑对应 kits env/window unit tests。
- 跑 root miniapp/shared entry tests。
- 检查 `multi-platform/*-vrender` 是否有对应 smoke 工程。
- 未真实端验证时，在最终报告写清 `Not-tested: 未跑 <端> 真机/宿主 smoke`。

## Not-tested 记录

Not-tested 应具体说明缺口，例如：

- `Not-tested: 未跑 packages/vrender-components browser examples，当前改动只触及文档。`
- `Not-tested: 未跑 wx 真机 smoke，本地只覆盖 kits unit。`
- `Not-tested: 未跑 full rush test，已跑 impacted package targeted tests。`

不要写“未测试”这种无法指导后续工作的泛化描述。
