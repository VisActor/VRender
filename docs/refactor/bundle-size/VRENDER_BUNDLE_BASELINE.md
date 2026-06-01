# VRender 包体积基线与数据口径

> 文档类型：baseline / 数据台账
> 事实来源：用户提供的 VChart line analyzer 数据、只读查看 VChart 本地产物和源码
> 当前状态：待后续优化补 before/after

## 当前优化主口径

下一轮优化主线是 VRender 自身内容大小，而不是继续围绕 VChart bundler resolve 做入口排查。VChart line/simple 仍可作为外部回归和 smoke 参照，但 owner 判断应优先回到 VRender 包内：

- 各包 `src` / `es` / `cjs` 的文件级内容大小。
- full/default 入口必须保留的能力与 optional 能力边界。
- 图元、renderer、picker、bounds、parser、text / richtext、path / svg / xml、3D、image / gif / texture 的真实代码量。
- 重复代码、过度防御、旧路径残留和可删除内部 compatibility。
- `@visactor/vutils` 引入造成的内容大小和重复版本风险。

## 当前 VChart Line 基础场景

用户提供的当前 line 基础场景组成：

| group | rendered | analyzer gzip |
| --- | ---: | ---: |
| VChart app | 1097.7k | 225.2k |
| `@visactor/vrender-core` | 934.4k | 231.5k |
| `@visactor/vrender-components` | 293.0k | 72.1k |
| `@visactor/vrender-animate` | 159.9k | 36.0k |
| `@visactor/vutils` | 129.9k | 41.1k |
| `@visactor/vrender-kits` | 113.1k | 37.8k |

数据来源：

- VChart line analyzer 统计：用户提供。
- stats 产物位置：`/Users/bytedance/Documents/GitHub/VChart/packages/vchart/build/stats-line.html`。
- VChart line 入口：`/Users/bytedance/Documents/GitHub/VChart/packages/vchart/src/vchart-line.ts`。

## 本地可见产物

只读查看 VChart 仓库时发现：

| entry | file | bytes | 说明 |
| --- | --- | ---: | --- |
| line | `packages/vchart/build/index-line.min.js.gz` | 366123 | final minified bundle gzip，本地已有产物 |
| line | `packages/vchart/build/index-line.js.gz` | 521551 | final non-minified bundle gzip，本地已有产物 |
| simple | `packages/vchart/build/index-simple.min.js.gz` | 388141 | final minified bundle gzip，本地已有产物 |
| simple | `packages/vchart/build/index-simple.js.gz` | 554061 | final non-minified bundle gzip，本地已有产物 |
| empty | `packages/vchart/build/index-empty.min.js.gz` | 234952 | final minified bundle gzip，本地已有产物 |
| pie | `packages/vchart/build/index-pie.min.js.gz` | 322864 | final minified bundle gzip，本地已有产物 |

这些 final bundle gzip 与 analyzer group gzip 不是同一个口径，不能直接相加或互相替代。

待补数据：

- full 入口 analyzer group 表：待验证。
- pie / empty 的 analyzer group 表：待验证。
- bare stage 入口：待验证。
- line/simple 的 raw-data 或 metafile 明细：待验证。
- VTable 基础场景：待验证。

## 口径说明

| 口径 | 含义 | 常见来源 | 使用方式 |
| --- | --- | --- | --- |
| rendered | analyzer 对模块或 group 的渲染体积估计，通常接近未 gzip 代码量 | `rollup-plugin-visualizer` treemap/list | 判断主要体积 owner |
| analyzer gzip | analyzer 对模块或 group 的 gzip 估计 | `rollup-plugin-visualizer({ gzipSize: true })` | 比较 group 贡献，但不等于最终产物 gzip |
| final bundle gzip | 最终 `.js.gz` 文件大小 | `rollup-plugin-gzip` 或 `gzip -c` | 判断用户实际下载成本 |
| minified final gzip | minify 后再 gzip 的最终产物 | `index-*.min.js.gz` | release 口径通常优先看这个 |

后续 before/after 必须同时写清数据来源、构建命令、产物时间和是否同一 git commit / lockfile。

## 已消除的历史基础链路

以下是历史包体积排查中已经从基础业务 bundle 回流链路消除的项。注意：这不表示源码或依赖完全从仓库删除；例如 kits 仍有 gif/lottie 可选能力，必须看具体入口是否静态带入。

| 历史链路 | 当前记录口径 |
| --- | --- |
| `lottie-web` | 不应进入 VChart line 基础路径；kits root / lottie 子能力仍存在，待 analyzer 持续确认 |
| `gifuct-js` | 不应进入 VChart line 基础路径；kits gif image 仍存在，`installers/app` 与某些 root barrel 仍需审计 |
| `js-binary-schema-parser` | 作为 `gifuct-js` 深层链路，不应进入基础 line |
| old `@visactor/vrender/es/index.js` 回流 | 已通过 VChart app entry / shared entry 收口，后续仍需 watch root import |
| old `@visactor/vrender-kits/es/index.js` 回流 | 已有子路径替代方向，但 VChart 侧仍存在 root kits import，见 VChart 审计 |
| old `@visactor/vrender-components/es/index.js` 回流 | 已有部分组件子路径，但很多组件仍 root-only，见 components 审计 |

## 当前仍需排查的主要包

| 包 | 当前风险摘要 | 详见 |
| --- | --- | --- |
| `@visactor/vrender-core` | root barrel、Graphic 基类、path/svg/xml/text/richtext/3D、renderer modules | [core risk map](./VRENDER_CORE_SIZE_RISK_MAP.md) |
| `@visactor/vrender-components` | root barrel、组件 subpath 不完整、组件 class 顶层注册、label/axis/legend/marker | [components audit](./VRENDER_COMPONENTS_SIZE_AUDIT.md) |
| `@visactor/vrender-animate` | root entry 导出 custom、full bootstrap 带 `custom/register`、story/disappear/richtext custom | [animate audit](./VRENDER_ANIMATE_SIZE_AUDIT.md) |
| `@visactor/vrender-kits` | root barrel、rough/gif/lottie、multi-env installer、legacy canvas picker | [kits audit](./VRENDER_KITS_SIZE_AUDIT.md) |
| `@visactor/vutils` | 全包 root import、geometry/bounds/matrix/merge 高频、潜在重复版本 | [vutils audit](./VRENDER_VUTILS_IMPORT_AUDIT.md) |

## VRender 自身 Size Ledger 格式

下一轮编码 agent 应优先补 VRender 自身 size ledger。推荐格式：

```md
### YYYY-MM-DD / <backlog-id> / <short-title>

- Commit / branch: `<sha or branch>`
- Package: `<@visactor/vrender-core|...>`
- Build/source scope: `<src|es|cjs|bundle/metafile>`
- Command: `<exact command>`
- Data source: `<file size script / analyzer / build artifact>`

| group/file | before raw | after raw | before gzip | after gzip | delta gzip |
| --- | ---: | ---: | ---: | ---: | ---: |
| `<module>` | | | | | |

Verification:
- `<test/build command>`

Not-tested:
- `<known gap>`
```

## 外部 Bundle Before / After 记录格式

涉及 VChart / VTable 外部场景时，再追加如下记录：

```md
### YYYY-MM-DD / <backlog-id> / <short-title>

- Commit / branch: `<sha or branch>`
- Entry: `<line/simple/full/...>`
- Command: `<exact command>`
- Analyzer source: `<stats html/raw-data/metafile path>`
- Final bundle source: `<build file path>`

| metric | before | after | delta |
| --- | ---: | ---: | ---: |
| analyzer rendered: `<group>` | | | |
| analyzer gzip: `<group>` | | | |
| final min gzip | | | |

Verification:
- `<test/build command>`

Not-tested:
- `<known gap>`
```
