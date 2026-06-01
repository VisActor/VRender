# VRender Runtime / Bootstrap / Register 体积审计

> 文档类型：runtime 装配链路台账
> 阅读顺序：entry -> bootstrap -> installer -> register -> legacy sync -> registry

## Entry 与 Bootstrap

| entry | bootstrap | 默认语义 |
| --- | --- | --- |
| `packages/vrender/src/entries/browser.ts` | `bootstrapVRenderBrowserApp` in `bootstrap.ts` | full browser app |
| `packages/vrender/src/entries/node.ts` | `bootstrapVRenderNodeApp` in `bootstrap.ts` | full node app |
| `packages/vrender/src/entries/miniapp.ts` | `bootstrapVRenderMiniApp` in `bootstrap.ts` | full miniapp family app |
| `packages/vrender/src/entries/shared.ts` | env dispatch to browser/node/miniapp creators | generic shared full app |
| `packages/vrender/src/entries/shared-browser.ts` | `bootstrapVRenderSharedBrowserApp` in `bootstrap-browser.ts` | browser full shared app |
| `packages/vrender/src/entries/shared-browser-lite.ts` | `bootstrapVRenderSharedBrowserLiteApp` in `bootstrap-browser-lite.ts` | browser lite shared app |

证据路径：

- `packages/vrender/src/entries/bootstrap.ts`
- `packages/vrender/src/entries/bootstrap-browser.ts`
- `packages/vrender/src/entries/bootstrap-browser-lite.ts`
- `packages/vrender/src/entries/shared-registry.ts`

## Full Runtime 默认注册能力

`bootstrapVRenderBrowserApp` / node / miniapp full 路径会安装：

- env：browser / node / taro / feishu / tt / wx / lynx / harmony 中对应 env。
- default graphics：`installDefaultGraphicsToApp`，覆盖 arc、arc3d、area、circle、glyph、group、image、line、path、polygon、pyramid3d、rect、rect3d、richtext、shadowRoot、star、symbol、text、wrapText、gif。
- picker：browser 使用 canvas picker，node/miniapp 使用 math picker。
- legacy graphic registrations：包含 arc、3D、gif、image、richtext、path、polygon、star 等。
- plugins：flex layout、3D view transform、HTML attribute、React attribute、directional light、ortho camera。
- animate：`registerAnimate` + `registerCustomAnimate`。
- legacy sync：同步 legacy renderers / pickers 到 app registry。

源码证据：

- `packages/vrender/src/entries/bootstrap.ts`
- `packages/vrender-kits/src/installers/app.ts`

## Shared Browser Full 默认注册能力

`bootstrapVRenderSharedBrowserApp` 会安装：

- browser env。
- `installStandardGraphicsToApp`：standard full graphics，不含 kits gif。
- browser pickers：不含 lottie / gif。
- standard legacy graphics：arc、arc3d、area、circle、glyph、group、image、line、path、polygon、pyramid3d、rect、rect3d、richtext、shadowRoot、symbol、text、wrapText、star。
- standard pipeline：flex、3D、HTML / React attribute、directional light、ortho camera、`registerAnimate`。

它没有调用 `registerCustomAnimate`。这是当前 VChart browser shared 条件下的关键体积边界。

源码证据：

- `packages/vrender/src/entries/bootstrap-browser.ts`
- `packages/vrender/src/entries/bootstrap-common.ts`
- `packages/vrender-kits/src/installers/browser.ts`
- `packages/vrender-kits/src/installers/graphics.ts`

## Lite Runtime 默认注册能力

`bootstrapVRenderSharedBrowserLiteApp` 会安装：

- browser lite env。
- lite graphics：area、circle、glyph、group、line、rect、shadowRoot、symbol、text、wrapText。
- lite browser pickers：area、circle、glyph、line、rect、symbol、text。
- lite legacy graphics：area、circle、glyph、group、line、rect、shadowRoot、symbol、text、wrapText。
- plugins：flex、HTML attribute、React attribute。
- animate：`registerAnimate`。

它不默认安装：

- arc、path、polygon、star、image、richtext。
- 3D 图元和 3D plugin / light / camera。
- gif、lottie、rough、dynamic texture。
- `registerCustomAnimate`。

源码证据：

- `packages/vrender/src/entries/bootstrap-browser-lite.ts`
- `packages/vrender-kits/src/installers/browser-lite.ts`
- `packages/vrender-kits/src/installers/graphics-lite.ts`

## Kits Installers 差异

| installer | 默认能力 | 体积判断 |
| --- | --- | --- |
| `installers/app` | 多端 env、default graphics、browser/node/math picker；default graphics 含 gif | full app，基础 browser bundle 应避免误入 |
| `installers/browser` | browser env + browser picker full set，不含 gif/lottie | shared browser full |
| `installers/browser-lite` | browser env + lite picker | lite |
| `installers/graphics` | standard full graphics，不含 gif | full graphics 候选 |
| `installers/graphics-lite` | lite graphics | lite |

## 多端静态链路风险

| env | 入口 | 风险 |
| --- | --- | --- |
| browser | `env/browser.ts`、browser installer | 基础 browser 必需，但 canvas picker full/lite 要区分 |
| node | `env/node.ts`、node installer | node-canvas / math picker，不应进入 browser bundle |
| wx | `env/wx.ts` | 小程序路径，真实 smoke 与 packer 行为独立验证 |
| lynx | `env/lynx.ts` | app envParams 和 stage canvas 参数边界敏感 |
| harmony | `env/harmony.ts` | Tier 1 代码路径，但真实端 smoke 仍重要 |
| taro | `env/taro.ts` | Tier 2，不能声明基础稳定体积收益 |
| feishu | `env/feishu.ts` | miniapp default 映射之一，browser bundle 不应静态带入 |
| tt | `env/tt.ts` | Tier 2，`env/all.ts` 未加载但 exports 存在 |

后续任何 entry 调整都必须用 browser condition / node condition / miniapp build 分别验证。

## Legacy Renderer / Picker Sync

`packages/vrender/src/entries/bootstrap-utils.ts` 的 `syncLegacyRenderersToApp` / `syncLegacyPickersToApp` 会：

1. 读取 app registry existing entries。
2. 读取 legacy binding context entries。
3. merge、去重、clear app registry。
4. re-register renderer / picker。

体积影响：

- 为兼容 legacy register，bootstrap 仍要保留 register + sync 两条路径。
- 不能只按体积删除 legacy sync，否则会复现“先 legacy register 后 app bootstrap”下 renderer / picker binding 缺失。

正确性风险：

- 不能重现 `AreaRender` / `CircleRender` / `GlyphRender` binding 缺失问题。
- register / installer 必须成组保证 creator、renderer、picker 和 draw contribution 一致。

验证：

- `packages/vrender/__tests__/unit/app-bootstrap-binding.test.ts`
- `packages/vrender-core/__tests__/unit/render/render-registry-migration.test.ts`
- `packages/vrender-core/__tests__/unit/picker/picker-registry-migration.test.ts`
- `packages/vrender-kits/__tests__/register/register.test.ts`

## 必须成组出现的 Register

| 能力 | 成组要求 |
| --- | --- |
| 基础图元绘制 | core graphic creator + renderer module + kits picker contribution |
| browser full picker | canvas picker service + 对应图元 picker + app picker registry |
| node / miniapp picker | math picker service + 对应图元 math picker |
| 3D | 3D 图元 renderer/picker + view transform plugin + light/camera register |
| richtext | richtext graphic + renderer + picker + text measure / icon 资源边界 |
| gif | gif graphic + gif render contribution + gif picker + `gifuct-js` |
| animate | `registerAnimate` + executor/timeline/ticker；type-based custom 动画另需 custom register |

## 适合 Optional Installer 的能力

- gif image。
- lottie。
- rough render。
- dynamic texture / texture effect。
- 3D 图元与 3D light/camera/plugin。
- richtext。
- image resource chain。
- full custom animation register。
- non-browser env。
- gesture / drag event extension。

## 后续优化建议

1. 下一轮主线不再围绕 VChart bundler condition 展开；`shared-browser` 命中只保留为回归 watch。
2. 以 VRender 自身内容大小为主，评估 full / lite runtime 中哪些 optional installer 和 register 可以分层，同时不替代 full/default entry。
3. 将 gif/lottie/rough/dynamicTexture 保持显式 opt-in。
4. 拆 `registerCustomAnimate` 为 basic / component / story / disappear / richtext 等分组，保留 full register 兼容。
5. 对 `installers/app` 做 VRender 自身 size ledger 标记，确认 full/default 内容与 optional 内容的边界。

## 验证命令

```bash
rush compile -t @visactor/vrender
cd packages/vrender && rushx test --runInBand __tests__/unit/shared-browser-entry.test.ts
cd packages/vrender && rushx test --runInBand __tests__/unit/shared-browser-lite-entry.test.ts
cd packages/vrender && rushx test --runInBand __tests__/unit/app-bootstrap-binding.test.ts
cd packages/vrender-kits && rushx test --runInBand __tests__/register/register.test.ts
```

体积验证优先记录 VRender 自身 size ledger；VChart stats 只作为外部 smoke，见 [VChart integration audit](./VRENDER_VCHART_INTEGRATION_AUDIT.md)。
