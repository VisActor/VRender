# VRender 图元包体积成本清单

> 文档类型：图元功能层体积台账
> 当前状态：只读源码事实 + 优化候选，不代表优化已经完成

## 阅读方式

本文件按 “graphic class -> creator -> renderer -> picker -> bounds/parser -> register -> optional deps” 记录。基础入口和注册链请先看：

- [VRENDER_IMPORT_AND_ENTRY_AUDIT.md](./VRENDER_IMPORT_AND_ENTRY_AUDIT.md)
- [VRENDER_RUNTIME_BOOTSTRAP_SIZE_AUDIT.md](./VRENDER_RUNTIME_BOOTSTRAP_SIZE_AUDIT.md)
- [Graphic Pipeline](../../agent/VRENDER_GRAPHIC_PIPELINE.md)

通用路径：

- creator：`packages/vrender-core/src/graphic/graphic-creator.ts`、`packages/vrender-core/src/graphic/creator.ts`
- core legacy register：`packages/vrender-core/src/register/register-*.ts`
- kits app register：`packages/vrender-kits/src/register/register-*.ts`
- renderer：`packages/vrender-core/src/render/contributions/render/*`
- canvas picker：`packages/vrender-kits/src/picker/contributions/canvas-picker/*`
- math picker：`packages/vrender-kits/src/picker/contributions/math-picker/*`

## 图元成本矩阵

| 图元 | graphic class | renderer | picker | bounds / parser / path 依赖 | register | line/simple 必需 | 常规 chart 必需 | optional / heavyweight 判断 | 后续方向 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| group | `packages/vrender-core/src/graphic/group.ts` | `render/contributions/render/group-render.ts` | `canvas-picker/group-picker.ts`；math picker 没有单独 group picker | group tree / child bounds，依赖场景树基础能力 | core/kits `register-group.ts` | 是 | 是 | 基础能力，暂不建议拆 | 保持基础图元；验证 register 不能漏 group renderer |
| rect | `graphic/rect.ts` | `rect-render.ts`、`rect-module.ts`、`rect-contribution-render.ts` | canvas/math `rect-picker.ts` | corner radius、outer border bounds、matrix/bounds | core/kits `register-rect.ts` | 是 | 是 | 基础能力，暂不建议优化 | 只能做 import 收窄和 register 成组验证 |
| line | `graphic/line.ts` | `line-render.ts`、`line-module.ts`、incremental line | canvas/math `line-picker.ts` | curve / segments / points bounds | core/kits `register-line.ts` | 是 | 是 | 基础 line chart 主路径 | 禁止为体积破坏 line animation / incremental 行为 |
| area | `graphic/area.ts` | `area-render.ts`、`area-module.ts`、incremental area | canvas/math `area-picker.ts` | area path / curve / segments / points bounds | core/kits `register-area.ts` | VChart simple 常见；纯 line 待 stats 验证 | 是 | 基础图表常用，不宜直接 optional | 可评估 line-only lite register 是否不含 area |
| symbol | `graphic/symbol.ts`、`graphic/builtin-symbol/*` | `symbol-render.ts`、`symbol-module.ts`、`symbol.ts` | canvas/math `symbol-picker.ts` | builtin symbol path、outer border bounds | core/kits `register-symbol.ts` | 是，点标记/legend/tooltip 常用 | 是 | builtin-symbol 全量可能有成本 | 可拆 builtin symbol 子集需谨慎，优先 analyzer 验证 |
| circle | `graphic/circle.ts` | `circle-render.ts`、`circle-module.ts` | canvas/math `circle-picker.ts` | circle bounds | core/kits `register-circle.ts` | lite 默认包含；line marker 可能需要 | 是 | 基础形状 | 保持基础；验证 Area/Circle binding 缺失不复现 |
| arc | `graphic/arc.ts` | `arc-render.ts`、`arc-module.ts`、arc contribution | canvas/math `arc-picker.ts` | arc path / corner / bounds | core/kits `register-arc.ts` | 否 | pie/radar/sector 常用 | 对 line/simple 非必需，full default 必须保持 | line lite 可不装；pie 场景必须补 register 验证 |
| path | `graphic/path.ts` | `path-render.ts`、`path-module.ts`、path contribution | canvas/math `path-picker.ts` | `common/custom-path2d`、`path-svg`、parser | core/kits `register-path.ts` | 否，除非组件/插件主动使用 | 常规 chart 中 marker/crosshair/brush 可能用 | parser / SVG path 较重 | 拆 parser 或延后 parse；验证 path 事件和 bounds |
| polygon | `graphic/polygon.ts` | `polygon-render.ts`、`polygon-module.ts` | canvas/math `polygon-picker.ts` | polygon bounds、points | core/kits `register-polygon.ts` | 否 | brush/crosshair/marker 可能用 | 组件相关 optional | 可只由对应组件 installer 带入 |
| star | `graphic/star.ts` | `star-render.ts`、`star-module.ts` | canvas `star-picker.ts`；未见 math star picker | star path / contribution | core/kits `register-star.ts` | 否 | 少量 symbol-like 场景 | optional | 建议从基础 lite 排除，full 保持 |
| image | `graphic/image.ts` | `image-render.ts`、`image-module.ts`、image contribution | canvas/math `image-picker.ts` | resource loader、image bounds、texture contribution | core/kits `register-image.ts` | 否，除 label/radio/checkbox/HTML plugin 等 | 常规图表可选 | resource / texture 链路较重 | 拆 image optional installer；验证资源加载和跨端 |
| gif image | `packages/vrender-kits/src/gif/*`、`register-gif.ts` | kits gif render contribution | canvas `gif-image-picker.ts` | `gifuct-js`，gif parser/resource | kits `register-gif.ts`、`installDefaultGraphicsToApp` | 否 | 否，特殊媒体能力 | heavyweight optional | 保持 opt-in；基础 browser bundle 不应静态带入 |
| text | `graphic/text.ts` | `text-render.ts`、`text-module.ts`、text contribution | canvas/math `text-picker.ts` | text measure、font、bounds | core/kits `register-text.ts` | 是，axis/label/tooltip 依赖 | 是 | 基础文本能力 | 不建议拆出基础路径；优化 text helper 延后创建 |
| wrapText | `graphic/wrap-text.ts` | 复用 text register / renderer 体系 | 复用 text picker 体系 | wrap layout、text measure | core/kits `register-wraptext.ts` | lite 默认包含 | 是 | text 扩展，成本需 analyzer 验证 | 如成本高，可评估 lazy wrap helper |
| richtext | `graphic/richtext.ts`、`graphic/richtext/*` | `richtext-render.ts`、`richtext-module.ts` | canvas/math `richtext-picker.ts` | paragraph/frame/icon/wrapper、resource | core/kits `register-richtext.ts` | 否 | tooltip/title/label rich text 可选 | heavyweight optional | 拆 richtext installer；避免基础 line 自动带入 |
| glyph | `graphic/glyph.ts` | `glyph-render.ts`、`glyph-module.ts` | canvas/math `glyph-picker.ts` | child graphic composition、glyphStateProxy | core/kits `register-glyph.ts` | lite 默认包含 | 是，组合图元能力 | 基础但有 state 特例 | 不建议删除；验证 D3 glyph state 行为 |
| shadowRoot | `graphic/shadow-root.ts` | 无单独 renderer，依附 group/tree | 无单独 picker | tree boundary / shadow host | core/kits `register-shadowRoot.ts` | lite 默认包含 | 是，宿主能力 | 基础生命周期能力 | 保持；验证 attach/detach/reparent |
| arc3d | `graphic/arc3d.ts` | `arc3d-render.ts`、`arc3d-module.ts`、`base-3d-render.ts` | canvas `arc3d-picker.ts` | 3D transform、light/camera、draw interceptor | core/kits `register-arc3d.ts` | 否 | 3D chart 才需要 | heavyweight optional | 从 lite 排除；full default 保持 |
| rect3d | `graphic/rect3d.ts` | `rect3d-render.ts`、`rect3d-module.ts`、`base-3d-render.ts` | canvas `rect3d-picker.ts` | 3D transform、light/camera | core/kits `register-rect3d.ts` | 否 | 3D chart 才需要 | heavyweight optional | 拆 3D installer；验证 3D chart |
| pyramid3d | `graphic/pyramid3d.ts` | `pyramid3d-render.ts`、`pyramid3d-module.ts` | canvas `pyramid3d-picker.ts` | 3D transform、light/camera | core/kits `register-pyramid3d.ts` | 否 | 3D chart 才需要 | heavyweight optional | 拆 3D installer；验证 pyramid3d |

## Creator 与 Register 风险

`graphic-creator.ts` 是图元创建主入口。即使上层只用 `createLine`，如果从 `@visactor/vrender-core` root import，bundler 可能先进入 root barrel。后续优化应优先确认：

- VChart / components / kits 是否能从 `@visactor/vrender-core/graphic/creator` 或更窄 subpath 引用 creator。
- 新增 subpath 是否只是转发窄文件，不能再 `export * from '@visactor/vrender-core'`。
- core register 与 kits register 的分工不要混淆：core register 绑定 creator / renderer，kits register 还要同步 picker。

## 可能带入的大工具链

| 工具链 | 主要来源 | 是否基础 line/simple 必需 | 判断 |
| --- | --- | --- | --- |
| path / SVG parser | `graphic/path.ts`、`common/custom-path2d`、`common/path-svg`、`svg` | 纯 line 不应必需；部分组件可能使用 | 优先拆 parser 或只由 path/marker/crosshair 入口带入 |
| richtext | `graphic/richtext/*`、tooltip/title/label rich text | 非基础 line 必需 | optional，full 保持 |
| image resource / texture | `graphic/image.ts`、render contribution、kits env resource | 非基础 line 必需 | optional，组件需要时显式 register |
| gif | kits gif register / picker | 非基础 line 必需 | heavyweight optional |
| 3D | arc3d/rect3d/pyramid3d、light、camera、3D interceptor | 非基础 line 必需 | optional installer |
| builtin-symbol | `graphic/builtin-symbol/*` | line marker / legend 可能需要 | 是否全量带入需 analyzer 验证 |

## 暂不建议优化的点

- group / rect / line / circle / symbol / text 是基础图表和 lite runtime 的核心集合，不能为了小体积收益做行为性拆分。
- glyph 和 shadowRoot 虽然不是普通用户直接创建的首要图元，但当前 lite runtime 默认包含，涉及组合图元和 shadow tree 生命周期，不建议在没有回归矩阵前删除。
- area 对纯 line 可能不是硬必需，但 VChart simple 和常规面积图路径常用，是否拆出 line-only entry 需要 stats 证明。

## 验证方式

功能验证：

```bash
rush compile -t @visactor/vrender-core
cd packages/vrender-core && rushx test --runInBand
cd packages/vrender-kits && rushx test --runInBand __tests__/register/register.test.ts
```

体积验证：

- VChart line/simple stats 对比：确认图元 register 调整是否真的减少基础 bundle。
- metafile 对比：`register-line`、`graphics-lite`、`graphics`、`app` 四组入口。
