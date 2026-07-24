# Lynx 原生 RAF 设计

## 背景

`dev/0.22.x` 分支中的 `LynxEnvContribution` 只通过全局 `lynx` 对象访问宿主能力。
当前 `getRequestAnimationFrame()` 和 `getCancelAnimationFrame()` 始终使用
`rafBasedSto`，因此动画由 `setTimeout` 模拟，不能跟随 Lynx 宿主的帧节奏。

新版 VRender 的 PR #2101 已实现原生 RAF 优先策略，但新版同时具备可注入 Lynx
runtime 和独立的 `vrender-kits` 单测设施。这两项基础设施不属于本次向
`dev/0.22.x` 的回移范围。

## 目标

当全局 `lynx` 同时提供 `requestAnimationFrame` 和 `cancelAnimationFrame` 时，
让 Lynx 环境优先使用该原生调度器；能力不完整时继续使用现有
`rafBasedSto` 实现。

## 非目标

- 不回移新版的 Lynx runtime 注入能力。
- 不修改 `configure()` 的公开参数结构。
- 不改变 ticker、timeline 或其他动画语义。
- 不改变 browser、Node、Harmony、飞书、TT、WX、Taro 等非 Lynx 环境。
- 不为 `vrender-kits` 新建一套 Jest 基础设施。

## 设计

在 `packages/vrender-kits/src/env/contributions/lynx-contribution.ts` 中扩展全局
`lynx` 的内部类型声明，使其可选地包含：

```ts
requestAnimationFrame?: (callback: FrameRequestCallback) => number;
cancelAnimationFrame?: (handle: number) => void;
```

为现有 `rafBasedSto` request/cancel 行为定义稳定的模块级函数，并让
`LynxEnvContribution` 的两个私有字段默认指向这组 fallback。

每次 `configure()` 成功进入 Lynx 分支时，在既有画布初始化完成后重新选择
调度器：

- 两个原生方法都是函数时，将它们绑定到全局 `lynx` 并缓存。
- 任一原生方法缺失或不是函数时，将两个缓存字段同时恢复为 fallback。

`getRequestAnimationFrame()` 和 `getCancelAnimationFrame()` 只返回缓存字段。
能力判断和 `bind` 只发生在配置阶段，不进入逐帧动画路径。

## 原子配对与生命周期

request/cancel 必须作为一对选择。这样不会把原生 RAF handle 传给
`rafBasedSto.clear()`，也不会把 timeout handle 传给 Lynx 原生取消接口。

VRender 可能重复调用 `configure()`。每次配置都重新评估全局 `lynx`，因此从
完整原生能力切换到不完整能力时不会遗留上一轮缓存的原生函数。

原生方法必须绑定到全局 `lynx` 对象，因为宿主实现可能依赖 `this` receiver。

## 兼容与异常处理

缺失或不完整的原生 RAF 能力不是错误，不抛出新异常，继续保持
`rafBasedSto` 的现有行为。画布创建、像素比、事件处理及其他 Lynx 逻辑保持
不变。

## 测试

`dev/0.22.x` 的 `vrender-kits` 包没有测试脚本，而 `packages/vrender` 已有
Jest 26 配置并将 `@visactor/vrender-kits` 映射到源码。因此回归测试放在
`packages/vrender/__tests__/lynx-raf.test.ts`，直接覆盖当前分支的
`LynxEnvContribution`。

测试覆盖：

- 完整原生 scheduler pair 被优先使用。
- request 返回的宿主 handle 原样返回，callback 和 cancel handle 原样转发。
- request/cancel 的 `this` 都是全局 `lynx`。
- 原生能力不完整时 request/cancel 成对回退。
- 重复配置从完整原生能力切换到不完整能力后，不会继续调用旧的原生函数。
- 每个测试恢复原有全局 `lynx`，避免污染其他测试。

原生 scheduler 测试必须在实现前执行并因仍走 `rafBasedSto` 而失败。

## 验证

完成实现后执行：

- 聚焦的 Lynx RAF Jest 测试。
- `packages/vrender` 的完整 Jest 测试。
- `packages/vrender-kits` 和 `packages/vrender` 的 TypeScript 编译。
- 变更文件的 ESLint 检查，不自动修复。
- `git diff --check`。

当前环境没有 Lynx 宿主，因此不包含真机 smoke test；宿主 receiver、handle
透传和 fallback 行为由自动化测试验证。
