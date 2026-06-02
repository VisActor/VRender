# VRender Core 非图元模块体积风险图

> 文档类型：core 内部模块体积风险台账
> 范围：`packages/vrender-core/src` 中非图元 class 的主要模块

## 总览

`@visactor/vrender-core` 当前 VChart line baseline 中占比最高。风险不只来自 root barrel，还来自基础图元真实依赖的公共工具层。后续优化要区分：

- root barrel 暴露导致的静态模块图变宽。
- renderer / picker / parser 的真实功能依赖。
- 高频渲染路径不适合增加 clone、deep compare、运行时 fallback。

核心证据入口：

- `packages/vrender-core/src/index.ts`
- `packages/vrender-core/package.json`
- `packages/vrender-core/src/graphic/graphic.ts`
- `packages/vrender-core/src/render/contributions/render/*`
- `packages/vrender-core/src/common/*`

## 模块风险表

| 模块 | 作用 | 当前被哪些路径引用 | 基础图表必需 | optional 判断 | root barrel / 真实依赖 | 后续建议 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| render | render service、renderer module、draw contribution | 图元 register、bootstrap、stage render | 是，基础 renderer 必需 | 各图元 renderer 可分组 | root 导出多类 renderer；基础 register 也真实依赖 | 保持基础 render service；按图元拆 register / module，不从 root 引入全 render | render registry tests、line/rect/text smoke |
| picker | core 定义接口，kits 提供实现 | kits picker、stage pick、event | 是，事件/pick 场景必需 | 图元 picker 可按 full/lite 分组 | 多为真实依赖，root 也暴露接口 | 避免 full canvas/math picker 同时入基础 browser | picker registry tests、VChart tooltip/crosshair 交互 |
| common | text、color、bezier、custom path、render util 等 | graphic base、renderer、bounds、parser、components | 部分必需 | path/svg/xml/segment 等可选 | root `src/index.ts` 全量导出 | 给 heavy common 建子入口，内部引用按能力收窄 | compile + metafile |
| common/xml | XML parser / node util | `graphic/graphic.ts`、root 导出；历史 XML/SVG 相关路径 | 基础 line 是否真实必需待验证 | 应偏 optional | `Graphic` base 当前引用导致风险高 | 先确认当前 base 是否必须静态依赖；如仅特定场景需要，后续拆低频入口 | core tests + analyzer |
| path | 自定义 Path2D、path command、bounds | `graphic/path.ts`、path renderer/picker、symbol/path tool | 非纯 line 必需 | optional | root 和 `@visactor/vrender-core/path` subpath 都存在 | parser 与 path graphic 分层；基础 register 不带 path | path render/pick/bounds tests |
| svg | SVG parser / transform | `@visactor/vrender-core/svg` subpath、path/svg usage | 否 | optional | root 导出 svg | 保持 subpath，避免基础 entry re-export 触发 | svg parser tests + analyzer |
| text | text measure、font、wrap/rich text基础 | text/wrapText/richtext、axis/label/tooltip | 是 | richtext 可选，plain text 必需 | root 和 `@visactor/vrender-core/text` subpath | plain text 保持；richtext 分离 | text bounds/render tests |
| color-string | color parse/stringify | color attr / parser | 是，样式基础能力 | 不建议拆到需要用户感知 | 已有 `./common/color-string` export | 只做 import 收窄，不做行为变更 | color parser unit tests |
| event | pointer/mouse/touch event、gesture 基础 | stage、env、kits event extension | 基础交互必需 | drag/gesture extension 可选 | root 导出 event | 将 drag/gesture 放 kits optional；core event 保持 | VChart tooltip/crosshair interaction |
| plugin | HTML/React attr、flex、richtext-edit、3D 等插件 | full/shared bootstrap、用户显式使用 | 基础 browser full 部分必需；lite 有 HTML/React/flex | richtext-edit/3D optional | root 导出 plugin | 插件按 installer 显式组合；避免 root 触发全部 plugin | bootstrap tests、plugin smoke |
| registry | render/picker graphic 注册表 | bootstrap、legacy sync、app registry | 是 | 不 optional | 真实依赖 | 不优化行为；只减少默认注册内容 | registry migration tests |
| core/camera | 3D camera | 3D plugin / 3D renderer | 否 | optional | root 导出可能带入 | 和 3D installer 绑定 | 3D scene tests |
| core/light | 3D light | 3D plugin / 3D renderer | 否 | optional | root 导出可能带入 | 和 3D installer 绑定 | 3D light/camera tests |
| 3D interceptor | view transform / draw interceptor | full bootstrap、3D graphics | 否，lite 不需要 | optional | full bootstrap 真实依赖 | 拆 3D optional installer，full 保持 | 3D render/pick tests |
| builtin-symbol | symbol 内置形状 | `graphic/symbol.ts`、symbol renderer/picker | line marker/legend 常用 | 部分形状可待验证 | 真实依赖，也由 root 暴露 | 评估 builtin symbol 子集化；不能破坏 symbolType 兼容 | symbol render/pick + VChart marker/legend |
| bounds | graphic bounds、outer border bounds | 所有图元、picker、layout | 是 | 不 optional | 真实依赖 | 避免高频分配；不要为体积加入复杂 fallback | bounds unit tests |
| matrix | transform / global matrix | 图元、render、picker | 是 | 不 optional | 真实依赖 | 保持热路径轻量 | transform render/pick tests |
| geometry | bezier、curve、points、segment | line/area/path/polygon/arc | line/area 真实依赖 | 部分 path/arc 工具可选 | root common 暴露较宽 | 按图元 register 收窄；避免基础 line 带 arc/path parser | line/area/arc/path tests |

## Root Barrel 风险

`packages/vrender-core/src/index.ts` 目前导出范围覆盖：

- graphic / creator / factory / register。
- render modules 和 draw interceptor。
- common/xml、path-svg、segment、morphing、split-path 等。
- plugins：HTML、React、flex、richtext-edit、3D 等。
- camera/light/3D 相关能力。

该入口必须保留兼容，但后续基础业务路径应尽量不从 root import。对外新增窄入口时，必须同步 package exports，不要要求 VChart 使用未公开 deep import。

## 当前看起来合理、暂不建议优化的模块

- `registry`、基础 `render service`、基础 `event`、`bounds`、`matrix` 是运行时骨架，不应通过删除行为降体积。
- plain `text` 对 axis/label/tooltip 和基础 chart 都是常规能力，不宜整体 optional。
- D3 状态引擎相关文件不是本轮主要嫌疑；除非 analyzer 证明状态模块异常占比，否则不要重开 D3 语义。
- `DefaultGraphicService.updatePathProxyAABBBounds()` 已在 2026-06-02 删除；后续 path proxy bounds 仍由 `Graphic.updatePathProxyAABBBounds()` 承担，不要把旧 service helper 作为兼容 fallback 加回。

## 需要重点复核的模块

1. `common/xml` 是否被 `Graphic` base 静态带入基础 line 路径。若只是低频 XML/SVG 功能需要，后续可考虑延迟或下沉到专用入口。
2. path/svg parser 是否通过 root barrel 或 path graphic 进入 line/simple。
3. 3D camera/light/interceptor 是否只在 full/shared full 中出现，lite 和 line-only 路径不能静态带入。
4. builtin-symbol 是否全量带入，是否存在可兼容的 symbol set 切分点。

## 验证方式

```bash
rush compile -t @visactor/vrender-core
cd packages/vrender-core && rushx test --runInBand
```

体积验证：

- 使用 bundler metafile 对比 `@visactor/vrender-core` root、`graphic/creator`、`register/graphic`、`path`、`svg`、`text`。
- VChart line/simple stats before/after 必须确认 core rendered/gzip 是否下降。
