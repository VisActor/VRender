# VRender Kits Architecture

`@visactor/vrender-kits` 是 VRender 的环境、注册与装配包。它把 core 的底层能力组装成可运行 runtime，但不应承载 core 图元状态语义或 animate 执行语义。

## 包职责

路径：`packages/vrender-kits/src`

主要职责：

- 多端 env / canvas / window contribution。
- 图元 register 与 installer。
- browser picker / math picker。
- event extension：drag、gesture。
- JSX / react-tree 工具。
- gif image、lottie、dynamic texture 等扩展能力。

## Env

env 入口：`src/env/{browser,node,wx,lynx,harmony,taro,feishu,tt}.ts`

每个 env 通常包含：

- `bind*Env(container)`：绑定 env contribution。
- `load*Env(container = getLegacyBindingContext(), loadPicker = true)`：legacy 载入 env、canvas/window contribution 和 picker。
- `init*Env()`：便捷初始化。

当前 env：

- browser：`env/browser.ts`，绑定 browser canvas/window，默认可 load canvas picker。
- node：`env/node.ts`，绑定 node canvas/window；当前文件中 math picker load 被注释，node app picker 主要通过 installer 路径安装。
- wx：`env/wx.ts`，绑定 wx canvas/window，默认 load math picker。
- lynx：`env/lynx.ts`，绑定 lynx canvas/window，默认 load math picker。
- harmony：`env/harmony.ts`，绑定 harmony canvas/window，默认 load math picker。
- taro：`env/taro.ts`，绑定 taro canvas/window，默认 load math picker。
- feishu：`env/feishu.ts`，绑定 feishu canvas/window，默认 load math picker。
- tt：`env/tt.ts`，绑定 tt canvas/window，默认 load math picker。

`env/all.ts` 会加载多端 env，并在 `vglobal.hooks.onSetEnv` 上按非 browser env 加载 math picker。使用前要确认是否符合当前 app-scoped 入口，不要在 root app creator 后混用旧 init。

## Register / Register-*

路径：`src/register/register-*.ts`

职责：

- 调 core `register*Graphic()` 注册 creator。
- 绑定对应 renderer/picker contribution 到 legacy context。
- 3D register 还可能注册 light/camera。
- `register-gif.ts` 注册 kits 扩展 gif graphic、gif renderer、gif picker。

常见图元 register：

- arc、arc3d、area、circle、glyph、group、image、line、path、polygon、pyramid3d、rect、rect3d、richtext、shadowRoot、star、symbol、text、wrapText、gif。

## Installers

路径：`src/installers`

app：
- `installBrowserEnvToApp`
- `installNodeEnvToApp`
- `installTaroEnvToApp`
- `installFeishuEnvToApp`
- `installTTEnvToApp`
- `installWxEnvToApp`
- `installLynxEnvToApp`
- `installHarmonyEnvToApp`
- `installDefaultGraphicsToApp`
- `installBrowserPickersToApp`
- `installNodePickersToApp`
- `installMathPickersToApp`

browser：
- `installBrowserEnvToApp`
- `installBrowserPickersToApp`
- 用于 standard browser shared bootstrap。

browser-lite：
- `installBrowserLiteEnvToApp`
- `installBrowserLitePickersToApp`
- 只覆盖 lite picker 集合。

graphics：
- `installStandardGraphicsToApp`
- 覆盖 standard full 图元集合，不含 kits app installer 中的 gif 扩展。

graphics-lite：
- `installLiteGraphicsToApp`
- 覆盖 area、circle、glyph、group、line、rect、shadowRoot、symbol、text、wrapText。

## Event Extension

路径：`src/event/extension`

- `drag.ts`：把 pointer/mouse 事件扩展成 dragstart、drag、dragenter、dragleave、dragover、dragend。
- `gesture.ts`：手势扩展。
- `index.ts`：导出扩展入口和配置。

React 和 JSX 层只做事件名映射；事件扩展能力归 kits。

## JSX / React-Tree 工具

路径：

- `src/jsx/index.ts`
- `src/jsx/jsx-classic.ts`
- `src/jsx/graphicType.ts`
- `src/react-tree.ts`

用途：

- VRender JSX 创建图元。
- `react-tree.ts` 提供 React DOM-like tree 解码辅助，当前注释标识为 react jsx customLayout 相关临时工具。

不要把这些工具与 `packages/react-vrender` 的 React reconciler host config 混为一谈。

## Image / Gif / Texture / Lottie

归属：

- 普通 image 图元：core `graphic/image.ts` + core renderer，kits register/installer 负责装配。
- gif image：kits `graphic/gif-image.ts`、`interface/gif-image.ts`、`register/register-gif.ts`、`render/contributions/canvas/gif-image-*`、`picker/contributions/canvas-picker/gif-image-*`。
- lottie：kits `graphic/Lottie.ts`、`graphic/interface/lottie.ts`、`render/contributions/canvas/lottie-*`、`picker/contributions/canvas-picker/lottie-*`。root `index.ts` 导出 lottie，`index-node.ts` 中 lottie 导出被注释。
- texture / dynamic texture：正式导出在 `tools/dynamicTexture/effect.ts`，测试在 `packages/vrender-kits/__tests__/tools/dynamicTexture/effect.test.ts`。旧的全注释 `tools/dynamicTexture.ts` 草稿已删除。

不要把 gif/lottie 默认可用性写死；是否可用取决于 entry/installer/register 路径。

## Kits 与 `@visactor/vrender` Entries 的关系

root package entries 通过 kits installers 完成默认装配：

```text
createBrowserVRenderApp()
  -> bootstrapVRenderBrowserApp()
  -> installBrowserEnvToApp()
  -> installDefaultGraphicsToApp()
  -> installBrowserPickersToApp()
  -> register default pipeline / legacy sync
```

`shared-browser-lite` 则走 browser-lite env/pickers 和 graphics-lite。

## 高风险点

- env 全局激活：`getRuntimeInstallerGlobal().setEnv(...)` 仍影响 runtime global。
- full/lite 覆盖差异：lite 不包含许多图元和 picker。
- browser/math picker 装错会导致事件命中异常。
- lottie/gif 扩展与默认 graphic/image 不同，注册路径更窄。
- 多端 window/canvas contribution 依赖真实宿主参数，单元测试不等于真实端 smoke。

## 验证方式

常用：

- `rush compile -t @visactor/vrender-kits`
- `cd packages/vrender-kits && rushx test`

Targeted：

- env：`__tests__/unit/env/*`
- window event：`__tests__/unit/*window-event.test.ts`
- picker：`__tests__/unit/picker/*`
- register：`__tests__/register/register.test.ts`、`__tests__/unit/register/register-gif.test.ts`
- render binding：`__tests__/unit/render/render-module-explicit-bindings.test.ts`
- root installer exports：`__tests__/unit/root-installer-exports.test.ts`
- build artifact imports：`__tests__/unit/build-artifact-imports.test.ts`
- react-tree：`__tests__/unit/react-tree.test.ts`

多端入口变更后，还应按影响端检查 `multi-platform/*-vrender` 的真实或手动 smoke。未跑真实端时必须在最终报告写 Not-tested。
