# VRender Kits 包体积审计

> 文档类型：`@visactor/vrender-kits` env / register / installer / optional media 体积台账
> 当前状态：只读源码事实 + 优化候选

## 当前入口事实

- root：`packages/vrender-kits/src/index.ts` 先导出 `index-node`，再导出 lottie。
- node root：`packages/vrender-kits/src/index-node.ts` 导出 env、register、picker、gif、dynamicTexture，并顶层 import rough module。
- package `sideEffects: false`，但 env/register/installers 多数是显式副作用函数，是否被 tree-shaken 取决于上层 import 和 bundler 条件。
- full app installer 与 browser installer 的默认能力不同，不能混用口径。

## Env 入口风险

| env | 源码路径 | 当前作用 | 基础 browser bundle 是否应静态带入 | 判断 |
| --- | --- | --- | --- | --- |
| browser | `env/browser.ts`、`env/contributions/browser-contribution.ts`、`canvas/contributions/browser/*`、`window/contributions/browser-contribution.ts` | browser canvas/window/env contribution | 是，browser runtime 必需 | 保持 |
| node | `env/node.ts`、node canvas/window contribution | node-canvas / server 环境 | 否 | browser bundle 不应带入 |
| wx | `env/wx.ts`、wx canvas/window contribution | 微信小程序 | 否 | miniapp 专属 |
| lynx | `env/lynx.ts`、lynx contribution | Lynx runtime | 否 | miniapp/app 专属 |
| harmony | `env/harmony.ts`、harmony contribution | Harmony runtime | 否 | app/harmony 专属 |
| taro | `env/taro.ts`、taro contribution | Taro runtime | 否 | miniapp 专属 |
| feishu | `env/feishu.ts`、feishu contribution | 飞书小程序 | 否 | miniapp 专属 |
| tt | `env/tt.ts`、tt contribution | 字节小程序 | 否 | miniapp 专属；`env/all.ts` 未加载但 exports 存在 |
| all | `env/all.ts` | load browser/feishu/lynx/node/taro/wx | 否 | full app 可用，基础 browser 避免 |

## Installers

| installer | 源码路径 | 默认能力 | 体积边界 |
| --- | --- | --- | --- |
| app | `installers/app.ts` | 多端 env、default graphics、browser/node/math picker；default graphics 包含 gif | full/default 行为，基础 browser 不应误用 |
| browser | `installers/browser.ts` | browser env + full browser picker | shared browser full |
| browser-lite | `installers/browser-lite.ts` | browser env + lite browser picker | lite |
| graphics | `installers/graphics.ts` | standard full graphics，不含 gif | full standard graphics |
| graphics-lite | `installers/graphics-lite.ts` | area/circle/glyph/group/line/rect/shadowRoot/symbol/text/wrapText | lite graphics |

full 行为不能为体积改变。后续优化应新增更窄 optional installer，而不是削弱现有 app/browser 默认语义。

## Register 入口

| register | 源码路径 | 带入能力 | 基础 line/simple 判断 |
| --- | --- | --- | --- |
| register-group/rect/line/circle/symbol/text/wraptext/glyph/shadowRoot/area | `register/register-*.ts` | 基础图元 + 对应 renderer/picker | lite 默认集合，基础常用 |
| register-arc/path/polygon/star/image/richtext | 同上 | arc/path/parser/image/resource/richtext | 常规 full 需要，line-only 可 optional |
| register-arc3d/rect3d/pyramid3d | 同上 | 3D 图元 + picker | 3D optional |
| register-gif | `register/register-gif.ts` | gif image graphic/render/picker + gif parser | heavyweight optional |

## Picker Contributions

| picker | 路径 | 风险 |
| --- | --- | --- |
| canvas picker full | `picker/canvas-module.ts`、`picker/contributions/canvas-picker/*` | 包含 arc/path/polygon/star/image/richtext/3D/gif/lottie picker contribution，基础 browser 需区分 full/lite |
| canvas picker lite | `installers/browser-lite.ts` 间接安装 lite picker | 只覆盖 lite 图元，适合 line/simple 候选 |
| math picker full | `picker/math-module.ts`、`picker/contributions/math-picker/*` | node/miniapp 需要；browser bundle 不应同时带入 |
| lottie/gif picker | `canvas-picker/lottie-*`、`canvas-picker/gif-image-*` | media optional，不应进入基础 chart |

## Event Extension

| 能力 | 路径 | 判断 |
| --- | --- | --- |
| drag | `event/extension/drag.ts` | 交互增强，非基础渲染必需 |
| gesture | `event/extension/gesture.ts` | 手势增强，非基础渲染必需 |
| index | `event/extension/index.ts` | barrel，后续要确认是否同时导出 drag/gesture |

drag / gesture 应保持显式 opt-in，不能被基础 runtime 默认静态带入。

## Image / Gif / Texture / Lottie / Rough

| 能力 | 源码路径 | 外部依赖 | 当前风险 |
| --- | --- | --- | --- |
| image | core image + kits register-image / picker | 无大型第三方，但涉及 resource/texture | 常规 full 可用，line-only optional |
| gif | `graphic/gif-image.ts`、`register-gif.ts`、`render/contributions/canvas/gif-image-*` | `gifuct-js`、`js-binary-schema-parser` 历史链路已在 baseline 标记为已消除或需确认 | full app default graphics 含 gif，shared browser standard 不含 |
| texture | `tools/dynamicTexture/effect.ts` | canvas/resource | root index-node 导出 effect；旧的全注释 `tools/dynamicTexture.ts` 草稿已删除 |
| lottie | `graphic/Lottie.ts`、`render/contributions/canvas/lottie-*`、`picker/.../lottie-*` | `lottie-web` 历史链路已在 baseline 标记为已消除或需确认 | root `src/index.ts` 导出 lottie，基础路径不应导入 root |
| rough | `render/contributions/rough/*` | `roughjs` | `index-node.ts` 顶层 import rough module，root kits 风险高 |

## 哪些入口必须保持 full 行为

- `@visactor/vrender-kits` root：兼容入口，不能破坏公开导出，但应减少上层主动使用。
- `installers/app`：full app 默认行为。
- `installers/browser`：browser full installer。
- `register/register-*`：单图元显式 register 语义。

## 适合 lite / optional 的能力

- non-browser env：node/wx/lynx/harmony/taro/feishu/tt。
- 3D registers、3D pickers。
- gif/lottie/rough/dynamicTexture。
- image / richtext / path / polygon / star 在 line-only 基础路径中可选。
- drag / gesture extension。

## 后续优化建议

1. 下一轮优先分析 VRender 自身 kits 内容大小，而不是继续围绕 VChart bundler resolve 排查。
2. VRender 内部基础路径避免从 `@visactor/vrender-kits` root 取 optional 能力；使用 installers/register 子入口。
3. 对 `installers/app` 增加 size ledger 标识，确认 gif/lottie/rough/dynamicTexture 在 full/default 与 optional 路径中的内容边界。
4. 建立 media optional installer：gif、lottie、rough、dynamicTexture 分离。
5. 对 picker full/lite 建 before/after stats，避免为了减少 picker 体积漏掉交互命中。

## 验证方式

```bash
rush compile -t @visactor/vrender-kits
cd packages/vrender-kits && rushx test --runInBand __tests__/register/register.test.ts
cd packages/vrender-kits && rushx test --runInBand __tests__/unit/root-installer-exports.test.ts
```

体积验证：

- kits root vs `installers/browser` vs `installers/browser-lite` vs `register/register-line` metafile。
- VChart line/simple stats 中 `@visactor/vrender-kits` rendered/gzip before/after。
