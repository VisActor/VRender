# VRender Runtime And Entries

本文解释 `@visactor/vrender` 与 `@visactor/vrender-core` entries、runtime app、shared app 和 bootstrap/installers 的关系。

## Core Entries

路径：`packages/vrender-core/src/entries`

- `browser.ts`：`BrowserEntry`，创建 `AppContext`，暴露 `registry`、`factory`、`createStage`、`release`。
- `node.ts`：`NodeEntry extends BrowserEntry`。
- `miniapp.ts`：`MiniappEntry extends BrowserEntry`。
- `app-context.ts`：app-scoped registry/factory/stage resource ownership。
- `runtime-installer.ts`：把 legacy binding context 中的 renderer/picker/contribution 刷入 app registry，并配置 `application` factories。

core entries 只创建 app/context，不做默认图元、环境、picker、动画、插件全量装配。

## Root Package Entries

路径：`packages/vrender/src/entries`

- `browser.ts`：`createBrowserVRenderApp(options)`。
- `node.ts`：`createNodeVRenderApp(options)`。
- `miniapp.ts`：`createTaroVRenderApp`、`createFeishuVRenderApp`、`createTTVRenderApp`、`createWxVRenderApp`、`createLynxVRenderApp`、`createHarmonyVRenderApp`。
- `shared.ts`：按 `env` 创建/复用 shared app。
- `shared-browser.ts`：browser shared full 装配。
- `shared-browser-lite.ts`：browser shared lite 装配。
- `shared-registry.ts`：`globalThis` 上的 shared app registry 与引用计数。
- `bootstrap*.ts`：root package 默认装配逻辑。

## App 创建与 Stage 创建

推荐链路：

```text
createBrowserVRenderApp()
  -> createBrowserApp()
  -> bootstrapVRenderBrowserApp()
  -> app.createStage(...)
```

Stage 创建属于 app：

- `AppContext.createStage()` 会创建 stage，并把 stage 放入 app 的 `stageResources`。
- `stage.release()` 会从 app tracking 中移除自己。
- `app.release()` 会释放仍被 app 跟踪的 stage，再清空 plugin/renderer/picker/contribution registry。

旧根级 `createStage()` 仍存在于 `packages/vrender/src/legacy` 并由 root entry 导出，但新代码应优先 app-scoped entry。

## Shared App

通用 shared entry：

- `acquireSharedVRenderApp({ env, key, envParams })`
- `getSharedVRenderApp(env, key)`
- `releaseSharedVRenderApp(env, key)`

实现路径：`packages/vrender/src/entries/shared-registry.ts`。

语义：

- `env + key` 定位一个 shared app record。
- `acquire` 增加 `refCount` 并返回 handle。
- handle 的 `release()` 减少引用计数；最后一个 handle 释放后 app 释放。
- 直接调用 shared app 的 `app.release()` 会走同一 record release 逻辑。

## `shared` / `shared-browser` / `shared-browser-lite`

- `./entries/shared`：通用 env shared entry，支持 `browser`、`node`、`taro`、`feishu`、`tt`、`wx`、`lynx`、`harmony`。package exports 中 browser condition 会路由到 `shared-browser.js`。
- `./entries/shared-browser`：只面向 browser，使用 registry env `browser-shared`，走 standard/full browser bootstrap。
- `./entries/shared-browser-lite`：只面向 browser，使用 registry env `browser-lite-shared`，走 lite bootstrap。

不要把 `shared-browser-lite` 当作 full 默认装配；它只安装 lite 图元和 lite picker 集合。

## Full / Default 与 Lite

Full/default browser bootstrap 相关路径：

- `packages/vrender/src/entries/bootstrap.ts`
- `packages/vrender/src/entries/bootstrap-browser.ts`
- `packages/vrender-kits/src/installers/app.ts`
- `packages/vrender-kits/src/installers/browser.ts`
- `packages/vrender-kits/src/installers/graphics.ts`

full/default 图元覆盖 arc、arc3d、area、circle、glyph、group、image、line、path、polygon、pyramid3d、rect、rect3d、richtext、shadowRoot、star、symbol、text、wrapText，`installers/app.ts` 还包含 gif。

Lite browser bootstrap 相关路径：

- `packages/vrender/src/entries/bootstrap-browser-lite.ts`
- `packages/vrender-kits/src/installers/browser-lite.ts`
- `packages/vrender-kits/src/installers/graphics-lite.ts`

lite 图元/picker 覆盖 area、circle、glyph、group、line、rect、shadowRoot、symbol、text、wrapText。它不默认覆盖 path、arc、polygon、image、richtext、3D、gif 等 full 集合。

## Bootstrap / Register / Installer

三者关系：

- register：注册单个图元和相关 legacy picker/render binding，例如 `vrender-kits/src/register/register-rect.ts`。
- installer：把一组 env、graphics、pickers 安装到 app，例如 `installBrowserEnvToApp`、`installStandardGraphicsToApp`。
- bootstrap：root package entry 调 installer、legacy register、sync legacy renderers/pickers、register plugins/animate，例如 `bootstrapVRenderBrowserApp`。

root package bootstrap 为“上层默认使用”服务；core entries 是更底层的 app/context surface。

## EnvParams 边界

- `createBrowserVRenderApp({ envParams })` 把 browser envParams 传入 env activation。
- `createNodeVRenderApp({ envParams })` 通常传 node-canvas 兼容包；未传时会尝试复用 `vglobal.envParams`。
- miniapp/lynx/harmony/taro/feishu/tt envParams 只应放 app scope 有效的环境能力，例如 runtime、canvasFactory、pixelRatio。
- 具体 canvas id/name、宽高、dpr 应放到 `app.createStage()` 参数。

## 多端语义

- browser：DOM/canvas 环境，通常用 browser env + canvas picker。
- node：node-canvas 环境，通常用 node env + math picker。
- wx / lynx / harmony：当前状态/动画发布文档中属于 Tier 1 稳定路径，但仍需关注真实端 smoke。
- taro / feishu / tt：代码路径和 public creator 存在；真实端 smoke 前应按待验证/Tier 2 处理。

相关路径：

- env：`packages/vrender-kits/src/env/{browser,node,wx,lynx,harmony,taro,feishu,tt}.ts`
- canvas/window contribution：`packages/vrender-kits/src/canvas/contributions/*`、`packages/vrender-kits/src/window/contributions/*`
- multi-platform smoke：`multi-platform/*-vrender`

## 改 Entries 的高风险点

- package exports 的 browser condition：`./entries/shared` 在 browser 下指向 `shared-browser`。
- shared app registry key：`browser-shared`、`browser-lite-shared` 与通用 env registry 不相同。
- bootstrap idempotency：`BOOTSTRAP_STATE` 防止同一 app 重复 bootstrap。
- legacy sync：`syncLegacyRenderersToApp` / `syncLegacyPickersToApp` 合并 app registry 和 legacy binding。
- picker service factory：browser 与 node/math picker factory 不同。
- app release：shared app 的 `app.release` 被包装，改 release 需验证 refCount。

## 相关测试

- core entries：`packages/vrender-core/__tests__/unit/entries/*`
- root entries：`packages/vrender/__tests__/unit/entries.test.ts`
- shared app：`packages/vrender/__tests__/unit/shared-app.test.ts`
- shared browser：`packages/vrender/__tests__/unit/shared-browser-entry.test.ts`
- shared browser lite：`packages/vrender/__tests__/unit/shared-browser-lite-entry.test.ts`
- app bootstrap binding：`packages/vrender/__tests__/unit/app-bootstrap-binding.test.ts`
- node runtime：`packages/vrender/__tests__/unit/node-app-runtime.test.ts`
- build artifact consistency：`packages/vrender/__tests__/unit/build-artifact-consistency.test.ts`
