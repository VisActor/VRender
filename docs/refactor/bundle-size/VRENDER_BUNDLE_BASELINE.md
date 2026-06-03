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

## 2026-06-03 场景收益 Gate

- Commit / branch: `10a5d5177 / remerge-d3`
- Scope: VRender source ledger plus existing VChart scenario stats
- Command: `node <<'NODE' ... parse VChart stats HTML and zlib.gzipSync VRender src files ... NODE`
- Data source: local VRender source files; existing VChart `stats-*.html` and `index-*.min.js.gz`
- Scenario assessment: [VRENDER_SCENARIO_SIZE_VALUE_ASSESSMENT.md](./VRENDER_SCENARIO_SIZE_VALUE_ASSESSMENT.md)

Current source package totals after recent P0 slices:

| package path | files | raw bytes | gzip bytes |
| --- | ---: | ---: | ---: |
| `packages/vrender-core/src` | 392 | 1,723,156 | 495,105 |
| `packages/vrender-components/src` | 240 | 1,015,830 | 284,741 |
| `packages/vrender-kits/src` | 197 | 453,271 | 141,711 |
| `packages/vrender-animate/src` | 73 | 489,724 | 127,784 |
| `packages/vrender/src/entries` | 13 | 32,322 | 8,741 |

Existing VChart scenario sample:

| scenario | final min gzip | core analyzer gzip | components | kits | animate | `@visactor/vutils` |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| empty | 234,952 | 236,829 | 944 | 38,752 | 24,692 | 32,589 |
| line | 366,123 | 237,096 | 73,784 | 38,752 | 36,855 | 42,125 |
| pie | 322,864 | 236,882 | 49,315 | 38,752 | 28,916 | 40,995 |
| simple | 388,141 | 237,096 | 81,575 | 38,752 | 42,256 | 42,839 |
| full | 646,668 | 237,499 | 149,228 | 69,250 | 74,760 | 85,846 |

Owner判断：

- components / kits / animate 在 VChart `full - line` 中分别多出约 75KB / 30KB / 38KB analyzer gzip，是后续 optional 拆分的主要场景价值来源。
- core 在 empty / line / pie / simple / full 中都接近 237KB analyzer gzip，说明常规图表场景已带入 core 主闭包；后续 core 优化应优先删真实内容或建立可验证 lite profile，不能只看单个小 parser。
- VTable 本轮没有 ready-made stats / gzip；源码显示存在 components root re-export 和多端 env loader 静态导入。表格收益需要先补 VTable stats 后再作为 P0 owner 证据。

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

## VRender 自身 Size Ledger

### 2026-06-01 / BS-P0-001 / VRender package source and build-output size ledger

- Commit / branch: `14bfab123 / remerge-d3`
- Package: `@visactor/vrender-core`, `@visactor/vrender-animate`, `@visactor/vrender-components`, `@visactor/vrender-kits`, `@visactor/vrender` entries
- Build/source scope: `src` TypeScript files and existing `es` / `cjs` runtime `.js` files
- Command: `node <<'NODE' ... filesystem size ledger with zlib.gzipSync(level=9) ... NODE`
- Data source: local filesystem file sizes; gzip is per-file gzip summed by group, not bundled gzip
- Excluded from runtime totals: `.d.ts`, `.map`, and source Markdown notes

Package / scope totals:

| package | scope | path | files | raw bytes | gzip bytes | status |
| --- | --- | --- | ---: | ---: | ---: | --- |
| `@visactor/vrender-core` | `src` | `packages/vrender-core/src` | 407 | 1,772,502 | 505,028 | present |
| `@visactor/vrender-core` | `cjs` | `packages/vrender-core/cjs` | 406 | 1,259,927 | 337,970 | present |
| `@visactor/vrender-core` | `es` | `packages/vrender-core/es` | 406 | 1,119,595 | 294,607 | present |
| `@visactor/vrender-components` | `src` | `packages/vrender-components/src` | 240 | 1,015,830 | 284,164 | present |
| `@visactor/vrender-components` | `cjs` | `packages/vrender-components/cjs` | 239 | 867,831 | 226,470 | present |
| `@visactor/vrender-components` | `es` | `packages/vrender-components/es` | 239 | 779,921 | 195,819 | present |
| `@visactor/vrender-animate` | `src` | `packages/vrender-animate/src` | 70 | 492,628 | 127,821 | present |
| `@visactor/vrender-kits` | `src` | `packages/vrender-kits/src` | 203 | 465,108 | 144,513 | present |
| `@visactor/vrender-animate` | `cjs` | `packages/vrender-animate/cjs` | 70 | 409,674 | 90,496 | present |
| `@visactor/vrender-kits` | `cjs` | `packages/vrender-kits/cjs` | 202 | 407,775 | 128,295 | present |
| `@visactor/vrender-animate` | `es` | `packages/vrender-animate/es` | 70 | 372,840 | 82,404 | present |
| `@visactor/vrender-kits` | `es` | `packages/vrender-kits/es` | 202 | 347,479 | 106,906 | present |
| `@visactor/vrender` | `cjs/entries` | `packages/vrender/cjs/entries` | 13 | 34,598 | 9,809 | present |
| `@visactor/vrender` | `src/entries` | `packages/vrender/src/entries` | 13 | 32,322 | 8,726 | present |
| `@visactor/vrender` | `es/entries` | `packages/vrender/es/entries` | 13 | 25,826 | 7,473 | present |

Top source modules:

| package | module | files | raw bytes | gzip bytes |
| --- | --- | ---: | ---: | ---: |
| `@visactor/vrender-core` | `packages/vrender-core/src/graphic` | 74 | 472,276 | 134,383 |
| `@visactor/vrender-animate` | `packages/vrender-animate/src/custom` | 45 | 348,414 | 88,933 |
| `@visactor/vrender-core` | `packages/vrender-core/src/render` | 68 | 328,900 | 87,128 |
| `@visactor/vrender-core` | `packages/vrender-core/src/common` | 58 | 288,290 | 85,018 |
| `@visactor/vrender-core` | `packages/vrender-core/src/interface` | 66 | 182,721 | 58,461 |
| `@visactor/vrender-components` | `packages/vrender-components/src/axis` | 33 | 178,234 | 54,339 |
| `@visactor/vrender-core` | `packages/vrender-core/src/core` | 26 | 141,395 | 38,448 |
| `@visactor/vrender-components` | `packages/vrender-components/src/label` | 19 | 141,296 | 40,229 |
| `@visactor/vrender-core` | `packages/vrender-core/src/plugins` | 16 | 114,976 | 29,102 |
| `@visactor/vrender-components` | `packages/vrender-components/src/marker` | 19 | 99,038 | 25,002 |
| `@visactor/vrender-kits` | `packages/vrender-kits/src/canvas` | 36 | 84,382 | 25,837 |
| `@visactor/vrender-components` | `packages/vrender-components/src/legend` | 15 | 83,855 | 22,383 |
| `@visactor/vrender-kits` | `packages/vrender-kits/src/env` | 21 | 81,276 | 25,184 |
| `@visactor/vrender-core` | `packages/vrender-core/src/event` | 13 | 72,255 | 21,144 |
| `@visactor/vrender-kits` | `packages/vrender-kits/src/picker` | 75 | 70,485 | 29,701 |
| `@visactor/vrender-kits` | `packages/vrender-kits/src/window` | 9 | 64,578 | 19,108 |
| `@visactor/vrender-components` | `packages/vrender-components/src/data-zoom` | 8 | 64,057 | 14,837 |
| `@visactor/vrender-components` | `packages/vrender-components/src/table-series-number` | 6 | 59,955 | 10,395 |
| `@visactor/vrender-core` | `packages/vrender-core/src/canvas` | 6 | 57,566 | 16,216 |
| `@visactor/vrender-kits` | `packages/vrender-kits/src/render` | 16 | 50,618 | 14,467 |
| `@visactor/vrender-components` | `packages/vrender-components/src/player` | 22 | 45,794 | 13,907 |
| `@visactor/vrender-animate` | `packages/vrender-animate/src/(root)` | 6 | 44,483 | 13,305 |
| `@visactor/vrender-components` | `packages/vrender-components/src/slider` | 5 | 40,725 | 8,870 |
| `@visactor/vrender-animate` | `packages/vrender-animate/src/executor` | 3 | 38,480 | 9,293 |
| `@visactor/vrender-kits` | `packages/vrender-kits/src/installers` | 5 | 34,572 | 6,767 |
| `@visactor/vrender` | `packages/vrender/src/entries/(root)` | 13 | 32,322 | 8,726 |
| `@visactor/vrender-components` | `packages/vrender-components/src/poptip` | 8 | 30,734 | 9,102 |
| `@visactor/vrender-components` | `packages/vrender-components/src/tooltip` | 6 | 28,775 | 7,225 |
| `@visactor/vrender-components` | `packages/vrender-components/src/scrollbar` | 6 | 27,889 | 8,296 |
| `@visactor/vrender-animate` | `packages/vrender-animate/src/state` | 5 | 24,828 | 6,368 |
| `@visactor/vrender-components` | `packages/vrender-components/src/util` | 11 | 23,465 | 7,545 |
| `@visactor/vrender-core` | `packages/vrender-core/src/picker` | 6 | 22,862 | 6,339 |
| `@visactor/vrender-components` | `packages/vrender-components/src/brush` | 5 | 22,640 | 6,426 |
| `@visactor/vrender-kits` | `packages/vrender-kits/src/tools` | 2 | 20,656 | 3,527 |
| `@visactor/vrender-kits` | `packages/vrender-kits/src/event` | 4 | 19,089 | 6,104 |
| `@visactor/vrender-components` | `packages/vrender-components/src/segment` | 5 | 18,115 | 5,912 |
| `@visactor/vrender-kits` | `packages/vrender-kits/src/register` | 21 | 15,997 | 6,338 |
| `@visactor/vrender-components` | `packages/vrender-components/src/title` | 4 | 15,552 | 3,736 |
| `@visactor/vrender-components` | `packages/vrender-components/src/tag` | 4 | 14,559 | 4,202 |
| `@visactor/vrender-components` | `packages/vrender-components/src/crosshair` | 10 | 14,540 | 5,686 |

Top ES runtime JS modules:

| package | module | files | raw bytes | gzip bytes |
| --- | --- | ---: | ---: | ---: |
| `@visactor/vrender-core` | `packages/vrender-core/es/graphic` | 74 | 342,841 | 85,615 |
| `@visactor/vrender-animate` | `packages/vrender-animate/es/custom` | 45 | 281,856 | 61,352 |
| `@visactor/vrender-core` | `packages/vrender-core/es/render` | 68 | 238,113 | 62,293 |
| `@visactor/vrender-core` | `packages/vrender-core/es/common` | 58 | 174,814 | 49,235 |
| `@visactor/vrender-components` | `packages/vrender-components/es/axis` | 33 | 132,086 | 36,839 |
| `@visactor/vrender-components` | `packages/vrender-components/es/label` | 19 | 104,055 | 26,434 |
| `@visactor/vrender-core` | `packages/vrender-core/es/core` | 26 | 101,044 | 24,740 |
| `@visactor/vrender-core` | `packages/vrender-core/es/plugins` | 16 | 92,579 | 21,348 |
| `@visactor/vrender-components` | `packages/vrender-components/es/marker` | 19 | 77,901 | 17,387 |
| `@visactor/vrender-components` | `packages/vrender-components/es/legend` | 15 | 63,957 | 15,046 |
| `@visactor/vrender-kits` | `packages/vrender-kits/es/env` | 21 | 59,483 | 18,180 |
| `@visactor/vrender-kits` | `packages/vrender-kits/es/picker` | 75 | 58,448 | 25,690 |
| `@visactor/vrender-components` | `packages/vrender-components/es/data-zoom` | 8 | 54,343 | 10,490 |
| `@visactor/vrender-kits` | `packages/vrender-kits/es/window` | 9 | 51,664 | 14,443 |
| `@visactor/vrender-kits` | `packages/vrender-kits/es/canvas` | 35 | 50,341 | 14,778 |
| `@visactor/vrender-components` | `packages/vrender-components/es/table-series-number` | 6 | 48,044 | 7,650 |
| `@visactor/vrender-core` | `packages/vrender-core/es/event` | 13 | 46,492 | 10,762 |
| `@visactor/vrender-kits` | `packages/vrender-kits/es/render` | 16 | 40,093 | 10,408 |
| `@visactor/vrender-components` | `packages/vrender-components/es/player` | 22 | 37,096 | 9,768 |
| `@visactor/vrender-core` | `packages/vrender-core/es/canvas` | 6 | 34,189 | 8,805 |
| `@visactor/vrender-components` | `packages/vrender-components/es/slider` | 5 | 33,049 | 6,102 |
| `@visactor/vrender-kits` | `packages/vrender-kits/es/installers` | 5 | 30,079 | 5,963 |
| `@visactor/vrender-animate` | `packages/vrender-animate/es/(root)` | 6 | 28,405 | 7,548 |
| `@visactor/vrender` | `packages/vrender/es/entries/(root)` | 13 | 25,826 | 7,473 |
| `@visactor/vrender-components` | `packages/vrender-components/es/poptip` | 8 | 24,873 | 6,526 |

Top CJS runtime JS modules:

| package | module | files | raw bytes | gzip bytes |
| --- | --- | ---: | ---: | ---: |
| `@visactor/vrender-core` | `packages/vrender-core/cjs/graphic` | 74 | 373,810 | 94,001 |
| `@visactor/vrender-animate` | `packages/vrender-animate/cjs/custom` | 45 | 305,871 | 66,237 |
| `@visactor/vrender-core` | `packages/vrender-core/cjs/render` | 68 | 262,663 | 69,629 |
| `@visactor/vrender-core` | `packages/vrender-core/cjs/common` | 58 | 193,377 | 55,020 |
| `@visactor/vrender-components` | `packages/vrender-components/cjs/axis` | 33 | 145,125 | 40,786 |
| `@visactor/vrender-components` | `packages/vrender-components/cjs/label` | 19 | 111,435 | 28,683 |
| `@visactor/vrender-core` | `packages/vrender-core/cjs/core` | 26 | 108,694 | 27,456 |
| `@visactor/vrender-core` | `packages/vrender-core/cjs/plugins` | 16 | 97,218 | 22,846 |
| `@visactor/vrender-components` | `packages/vrender-components/cjs/marker` | 19 | 85,935 | 19,562 |
| `@visactor/vrender-kits` | `packages/vrender-kits/cjs/picker` | 75 | 75,094 | 32,140 |
| `@visactor/vrender-components` | `packages/vrender-components/cjs/legend` | 15 | 70,131 | 17,011 |
| `@visactor/vrender-kits` | `packages/vrender-kits/cjs/env` | 21 | 65,780 | 20,307 |
| `@visactor/vrender-kits` | `packages/vrender-kits/cjs/canvas` | 35 | 62,619 | 19,988 |
| `@visactor/vrender-components` | `packages/vrender-components/cjs/data-zoom` | 8 | 57,210 | 11,420 |
| `@visactor/vrender-kits` | `packages/vrender-kits/cjs/window` | 9 | 54,168 | 15,062 |
| `@visactor/vrender-core` | `packages/vrender-core/cjs/event` | 13 | 52,716 | 12,463 |
| `@visactor/vrender-components` | `packages/vrender-components/cjs/table-series-number` | 6 | 50,002 | 8,408 |
| `@visactor/vrender-kits` | `packages/vrender-kits/cjs/render` | 16 | 45,096 | 11,989 |
| `@visactor/vrender-components` | `packages/vrender-components/cjs/player` | 22 | 44,168 | 12,546 |
| `@visactor/vrender-core` | `packages/vrender-core/cjs/canvas` | 6 | 37,731 | 9,745 |
| `@visactor/vrender-animate` | `packages/vrender-animate/cjs/(root)` | 6 | 35,751 | 8,831 |
| `@visactor/vrender-components` | `packages/vrender-components/cjs/slider` | 5 | 35,267 | 6,793 |
| `@visactor/vrender` | `packages/vrender/cjs/entries/(root)` | 13 | 34,598 | 9,809 |
| `@visactor/vrender-kits` | `packages/vrender-kits/cjs/installers` | 5 | 32,217 | 6,448 |
| `@visactor/vrender-components` | `packages/vrender-components/cjs/poptip` | 8 | 27,811 | 7,495 |

Top source files:

| package | file | raw bytes | gzip bytes |
| --- | --- | ---: | ---: |
| `@visactor/vrender-core` | `packages/vrender-core/src/graphic/graphic.ts` | 98,192 | 20,719 |
| `@visactor/vrender-components` | `packages/vrender-components/src/legend/discrete/discrete.ts` | 55,197 | 12,046 |
| `@visactor/vrender-core` | `packages/vrender-core/src/plugins/builtin-plugin/richtext-edit-plugin.ts` | 44,735 | 10,386 |
| `@visactor/vrender-components` | `packages/vrender-components/src/label/base.ts` | 42,556 | 10,029 |
| `@visactor/vrender-components` | `packages/vrender-components/src/table-series-number/table-series-number.ts` | 40,990 | 6,595 |
| `@visactor/vrender-core` | `packages/vrender-core/src/core/stage.ts` | 38,189 | 9,504 |
| `@visactor/vrender-core` | `packages/vrender-core/src/common/Reflect-metadata.ts` | 36,396 | 5,865 |
| `@visactor/vrender-kits` | `packages/vrender-kits/src/canvas/contributions/browser/context.ts` | 36,329 | 7,997 |
| `@visactor/vrender-components` | `packages/vrender-components/src/label/arc.ts` | 36,178 | 8,905 |
| `@visactor/vrender-components` | `packages/vrender-components/src/slider/slider.ts` | 35,207 | 6,813 |
| `@visactor/vrender-animate` | `packages/vrender-animate/src/custom/story.ts` | 33,705 | 5,246 |
| `@visactor/vrender-animate` | `packages/vrender-animate/src/executor/animate-executor.ts` | 31,705 | 6,884 |
| `@visactor/vrender-components` | `packages/vrender-components/src/axis/line.ts` | 31,067 | 7,054 |
| `@visactor/vrender-animate` | `packages/vrender-animate/src/custom/disappear/dissolve.ts` | 30,411 | 4,571 |
| `@visactor/vrender-components` | `packages/vrender-components/src/data-zoom/renderer.ts` | 30,172 | 5,170 |
| `@visactor/vrender-core` | `packages/vrender-core/src/canvas/util.ts` | 27,460 | 6,903 |
| `@visactor/vrender-core` | `packages/vrender-core/src/event/event-manager.ts` | 26,541 | 6,047 |
| `@visactor/vrender-components` | `packages/vrender-components/src/axis/base.ts` | 26,458 | 6,686 |
| `@visactor/vrender-core` | `packages/vrender-core/src/interface/graphic.ts` | 24,281 | 7,687 |
| `@visactor/vrender-core` | `packages/vrender-core/src/common/custom-path2d.ts` | 23,700 | 4,926 |
| `@visactor/vrender-core` | `packages/vrender-core/src/core/contributions/textMeasure/AtextMeasure.ts` | 23,675 | 4,488 |
| `@visactor/vrender-core` | `packages/vrender-core/src/graphic/text.ts` | 23,242 | 5,584 |
| `@visactor/vrender-core` | `packages/vrender-core/src/graphic/richtext.ts` | 22,943 | 5,836 |
| `@visactor/vrender-core` | `packages/vrender-core/src/graphic/node-tree.ts` | 22,928 | 5,103 |
| `@visactor/vrender-components` | `packages/vrender-components/src/marker/point.ts` | 22,247 | 5,459 |
| `@visactor/vrender-core` | `packages/vrender-core/src/event/event-system.ts` | 22,139 | 5,067 |
| `@visactor/vrender-animate` | `packages/vrender-animate/src/custom/morphing.ts` | 22,079 | 5,370 |
| `@visactor/vrender-core` | `packages/vrender-core/src/render/contributions/render/base-render.ts` | 20,999 | 4,351 |
| `@visactor/vrender-components` | `packages/vrender-components/src/tooltip/tooltip.ts` | 20,727 | 4,313 |
| `@visactor/vrender-animate` | `packages/vrender-animate/src/animate.ts` | 20,186 | 5,755 |

Top ES/CJS runtime JS files:

| package | scope | file | raw bytes | gzip bytes |
| --- | --- | --- | ---: | ---: |
| `@visactor/vrender-core` | `cjs` | `packages/vrender-core/cjs/graphic/graphic.js` | 80,753 | 14,513 |
| `@visactor/vrender-core` | `es` | `packages/vrender-core/es/graphic/graphic.js` | 78,863 | 14,293 |
| `@visactor/vrender-components` | `cjs` | `packages/vrender-components/cjs/legend/discrete/discrete.js` | 48,231 | 9,243 |
| `@visactor/vrender-components` | `es` | `packages/vrender-components/es/legend/discrete/discrete.js` | 46,532 | 9,150 |
| `@visactor/vrender-components` | `cjs` | `packages/vrender-components/cjs/label/base.js` | 38,704 | 8,008 |
| `@visactor/vrender-core` | `cjs` | `packages/vrender-core/cjs/plugins/builtin-plugin/richtext-edit-plugin.js` | 37,758 | 7,467 |
| `@visactor/vrender-components` | `es` | `packages/vrender-components/es/label/base.js` | 37,662 | 7,882 |
| `@visactor/vrender-core` | `es` | `packages/vrender-core/es/plugins/builtin-plugin/richtext-edit-plugin.js` | 37,073 | 7,352 |
| `@visactor/vrender-components` | `cjs` | `packages/vrender-components/cjs/table-series-number/table-series-number.js` | 33,850 | 5,151 |
| `@visactor/vrender-components` | `es` | `packages/vrender-components/es/table-series-number/table-series-number.js` | 33,613 | 5,053 |
| `@visactor/vrender-components` | `cjs` | `packages/vrender-components/cjs/slider/slider.js` | 32,597 | 5,584 |
| `@visactor/vrender-components` | `es` | `packages/vrender-components/es/slider/slider.js` | 31,655 | 5,474 |
| `@visactor/vrender-components` | `cjs` | `packages/vrender-components/cjs/label/arc.js` | 31,433 | 6,645 |
| `@visactor/vrender-components` | `es` | `packages/vrender-components/es/label/arc.js` | 30,615 | 6,508 |
| `@visactor/vrender-core` | `cjs` | `packages/vrender-core/cjs/core/stage.js` | 29,857 | 6,374 |
| `@visactor/vrender-components` | `cjs` | `packages/vrender-components/cjs/data-zoom/renderer.js` | 29,730 | 4,546 |
| `@visactor/vrender-core` | `es` | `packages/vrender-core/es/core/stage.js` | 29,303 | 6,226 |
| `@visactor/vrender-components` | `es` | `packages/vrender-components/es/data-zoom/renderer.js` | 29,193 | 4,454 |
| `@visactor/vrender-animate` | `cjs` | `packages/vrender-animate/cjs/custom/story.js` | 28,883 | 3,525 |
| `@visactor/vrender-components` | `cjs` | `packages/vrender-components/cjs/axis/line.js` | 28,039 | 5,921 |
| `@visactor/vrender-animate` | `es` | `packages/vrender-animate/es/custom/story.js` | 27,739 | 3,284 |
| `@visactor/vrender-components` | `es` | `packages/vrender-components/es/axis/line.js` | 27,388 | 5,803 |
| `@visactor/vrender-kits` | `cjs` | `packages/vrender-kits/cjs/canvas/contributions/browser/context.js` | 25,515 | 4,869 |
| `@visactor/vrender-kits` | `es` | `packages/vrender-kits/es/canvas/contributions/browser/context.js` | 24,932 | 4,815 |
| `@visactor/vrender-animate` | `cjs` | `packages/vrender-animate/cjs/executor/animate-executor.js` | 24,466 | 4,506 |
| `@visactor/vrender-animate` | `cjs` | `packages/vrender-animate/cjs/custom/disappear/dissolve.js` | 24,432 | 3,717 |
| `@visactor/vrender-animate` | `es` | `packages/vrender-animate/es/custom/disappear/dissolve.js` | 24,098 | 3,638 |
| `@visactor/vrender-animate` | `es` | `packages/vrender-animate/es/executor/animate-executor.js` | 24,098 | 4,411 |
| `@visactor/vrender-components` | `cjs` | `packages/vrender-components/cjs/axis/base.js` | 23,572 | 5,322 |
| `@visactor/vrender-components` | `es` | `packages/vrender-components/es/axis/base.js` | 22,651 | 5,170 |

Initial owner notes:

- `@visactor/vrender-core` is the largest covered package by source and build output. The largest source modules are `graphic`, `render`, `common`, `interface`, and `core`.
- `@visactor/vrender-components` source is dominated by `axis`, `label`, `marker`, `legend`, and optional root-only components such as `data-zoom` / `table-series-number`, matching the components audit.
- `@visactor/vrender-animate` source is dominated by `custom`, followed by `animate.ts`, `executor`, and `state`; `custom/register` 分层仍是 BS-P0-004 的合理候选.
- `@visactor/vrender-kits` source/build output is dominated by `picker`, `env`, `window`, `register`, and `canvas`, so future media/env optional work needs module-level before/after, not only root import checks.

Verification:

- `git status --short --branch`
- filesystem ledger command above

Not-tested:

- Did not rebuild `es` / `cjs`; existing local build artifacts were measured as-is.
- Did not generate bundled/metafile analyzer output; this ledger is package content size, not reachable bundle graph size.

### 2026-06-01 / BS-P0-002 / Remove unreferenced core Reflect metadata shim

- Commit / branch: `db2943d47 / remerge-d3`
- Package: `@visactor/vrender-core`
- Build/source scope: `src` TypeScript files
- Command: `node <<'NODE' ... filesystem size ledger with zlib.gzipSync(level=9) ... NODE`
- Data source: local filesystem file sizes; gzip is per-file gzip summed by group, not bundled gzip

Owner judgment:

- 现象：BS-P0-001 source top files 显示 `packages/vrender-core/src/common/Reflect-metadata.ts` 为 36,396 raw / 5,865 gzip，但该文件不在 `package.json` exports 中，也没有被 VRender 源码 import。
- 证据文件：`packages/vrender-core/src/common/Reflect-metadata.ts`、`packages/vrender-core/package.json`、`packages/vrender-core/src/index.ts`。
- 为什么属于 VRender 自身内容大小问题：这是 core source/package content 中未引用、未公开的 legacy metadata shim，不属于 VChart bundler resolve 或上层 workaround。
- Root/default 影响：不影响；root/default 没有加载该 shim，`@visactor/vrender-core` public subpath exports 也未暴露它。
- 预期收益：减少 core source 内容 36,444 raw / 5,888 gzip；后续 rebuild 后对应 ignored `es` / `cjs` 产物会自然消失。
- 风险：极少数绕过 package exports 的非公开 source deep import 会失败；该路径不属于稳定 public API。

Before / after:

| group/file | before raw | after raw | before gzip | after gzip | delta gzip |
| --- | ---: | ---: | ---: | ---: | ---: |
| `packages/vrender-core/src` | 1,772,502 | 1,736,058 | 505,028 | 499,140 | -5,888 |
| `packages/vrender-core/src/common/Reflect-metadata.ts` | 36,396 | 0 | 5,865 | 0 | -5,865 |
| `packages/vrender-core/src/index.ts` stale comment | 48 | 0 | 23 | 0 | -23 |

Verification:

- `rg "Reflect-metadata|reflect-metadata|Reflect\\.defineMetadata|Reflect\\.getMetadata|Reflect\\.hasMetadata|Reflect\\.hasOwnMetadata" packages/vrender-core/src packages/vrender-animate/src packages/vrender-components/src packages/vrender-kits/src packages/vrender/src --glob '!**/*.map'`
- `rush compile -t @visactor/vrender-core`
- `cd packages/vrender-core && rushx test --runInBand __tests__/unit/public-subpath-exports.test.ts`

Not-tested:

- Did not run `rush build -t @visactor/vrender-core`; local ignored `es` / `cjs` artifacts were not regenerated.
- Did not run full core unit suite; this slice deletes an unreferenced non-public source shim and validates compile plus public subpath exports.

### 2026-06-01 / BS-P0-002 / Remove stale commented core source shells

- Commit / branch: `1f67626ab / remerge-d3`
- Package: `@visactor/vrender-core`
- Build/source scope: `src` TypeScript files
- Command: `node <<'NODE' ... filesystem size ledger with zlib.gzipSync(level=9) ... NODE`
- Data source: local filesystem file sizes; gzip is per-file gzip summed by group, not bundled gzip

Owner judgment:

- 现象：core source 仍包含一组无源码入边、非 `package.json` exports、且仅保留注释或空壳符号的旧文件。
- 证据文件：`allocator/constants.ts`、`common/store.ts`、`core/application.ts`、`core/global-module.ts`、`export.ts`、`interface/creator.ts`、`interface/graphic-utils.ts`、`interface/graphic/dynamic-path.ts`、`interface/theme-service.ts`、`plugins/builtin-plugin/poptip-plugin.ts`、`render/contributions/render/clear-screen.ts`、`render/contributions/render/render-slector.ts`。
- 为什么属于 VRender 自身内容大小问题：这些文件只增加 core source/package content，当前运行时和 public subpath 都不依赖它们。
- Root/default 影响：不影响；删除项不是 root/default bootstrap、renderer/picker binding、状态系统或 package exports。
- 预期收益：在上一片基础上减少 core source 内容 8,810 raw / 3,468 gzip。
- 风险：极少数绕过 package exports 的非公开 source deep import 会失败；这些路径不属于稳定 public API。

Before / after:

| group/file | before raw | after raw | before gzip | after gzip | delta gzip |
| --- | ---: | ---: | ---: | ---: | ---: |
| `packages/vrender-core/src` | 1,736,058 | 1,727,248 | 499,140 | 495,672 | -3,468 |
| stale commented / shell files | 8,810 | 0 | 3,468 | 0 | -3,468 |

Verification:

- `rush compile -t @visactor/vrender-core`
- `cd packages/vrender-core && rushx test --runInBand __tests__/unit/public-subpath-exports.test.ts`
- Import graph scan: deleted files had zero VRender source in-edges and were not package export source entries.

Not-tested:

- Did not run `rush build -t @visactor/vrender-core`; local ignored `es` / `cjs` artifacts were not regenerated.
- Did not run full core unit suite; this slice removes non-public stale source shells and validates compile plus public subpath exports.

### 2026-06-01 / BS-P0-004 / Remove stale commented component animate extension draft

- Commit / branch: `98022b742 / remerge-d3`
- Package: `@visactor/vrender-animate`
- Build/source scope: `src` TypeScript files
- Command: `node <<'NODE' ... filesystem size ledger with zlib.gzipSync(level=9) ... NODE`
- Data source: local filesystem file sizes; gzip is per-file gzip summed by group, not bundled gzip

Owner judgment:

- 现象：`packages/vrender-animate/src/component/component-animate-extension.ts` 是全注释旧草稿，`component/index.ts` 仅保留注释掉的 re-export；当前 component animation 的有效实现是 `ComponentAnimator` 和 `custom/custom-animate.ts` 中的 `AComponentAnimate`。
- 证据文件：`packages/vrender-animate/src/component/component-animate-extension.ts`、`packages/vrender-animate/src/component/index.ts`、`packages/vrender-animate/src/index.ts`、`packages/vrender-animate/package.json`。
- 为什么属于 VRender 自身内容大小问题：这是 animate package source 中未发布、未导出、不可执行的旧组件动画扩展草稿，只增加源码台账噪声；full/root runtime 没有加载它。
- Root/default 影响：不影响；root 仍导出 `ComponentAnimator` 与现有 custom/component animate 能力，`registerAnimate()` 仍只 mixin `GraphicStateExtension` 和 `AnimateExtension`。
- 预期收益：减少 animate source 内容 4,464 raw / 988 gzip；现有 ignored `es` / `cjs` 产物中该文件只是 56-byte sourcemap stub，需下次 clean build 才会消失。
- 风险：极少数绕过 package exports 的非公开 source deep import 会失败；该草稿未在 `component/index.ts`、root index 或 package exports 中暴露，不属于稳定 public API。

Before / after:

| group/file | before raw | after raw | before gzip | after gzip | delta gzip |
| --- | ---: | ---: | ---: | ---: | ---: |
| `packages/vrender-animate/src` | 492,628 | 488,164 | 127,821 | 126,833 | -988 |
| `packages/vrender-animate/src/component` | 9,650 | 5,186 | 2,434 | 1,446 | -988 |
| `component-animate-extension.ts` | 4,414 | 0 | 968 | 0 | -968 |
| `component/index.ts` stale commented export | 88 | 38 | 78 | 58 | -20 |

Verification:

- `rush compile -t @visactor/vrender-animate`
- Import graph scan: deleted file had no VRender source in-edges and was not package export source entry.

Not-tested:

- Did not run `rush build -t @visactor/vrender-animate`; local ignored `es` / `cjs` artifacts were not regenerated.
- Did not run full animate unit suite; this slice deletes a non-public commented source draft and validates compile.

### 2026-06-01 / BS-P0-002 / Remove unused segment curve implementation stubs

- Commit / branch: `b55d6ea35 / remerge-d3`
- Package: `@visactor/vrender-core`
- Build/source scope: `src` TypeScript files
- Command: `node <<'NODE' ... filesystem size ledger with zlib.gzipSync(level=9) ... NODE`
- Data source: local filesystem file sizes; gzip is per-file gzip summed by group, not bundled gzip

Owner judgment:

- 现象：`common/segment/curve/arc.ts`、`ellipse.ts`、`move.ts` 没有 VRender production source 入边，且未被 `common/segment/index.ts` 或 public `path` 子入口 re-export；当前只剩直接测试这些实现草稿的单测。
- 证据文件：`packages/vrender-core/src/common/segment/curve/{arc,ellipse,move}.ts`、`packages/vrender-core/src/common/segment/index.ts`、`packages/vrender-core/src/path.ts`、`packages/vrender-core/package.json`。
- 为什么属于 VRender 自身内容大小问题：这三个类是未接入生产路径的曲线实现草稿，大部分方法直接抛出“不支持”；保留它们只增加 core source/package content。
- Root/default 影响：不影响；root/common 仍导出实际使用的 `linear`、`basis`、`monotone`、`step`、`catmullRom`、`CurveContext`、`CubicBezierCurve` 等现有能力。
- Public API 影响：不删除 `IArcCurve` / `IEllipseCurve` / `IMoveCurve` 类型和 `CurveTypeEnum` 成员，避免收窄稳定 type surface；只删除未导出的实现类文件。
- 预期收益：减少 core source 内容 3,985 raw / 1,516 gzip；同时删除只覆盖这些死码实现的测试文件 2,832 raw / 1,219 gzip。
- 风险：极少数绕过 package exports 的非公开 source deep import 会失败；这些实现文件没有稳定 public subpath。

Before / after:

| group/file | before raw | after raw | before gzip | after gzip | delta gzip |
| --- | ---: | ---: | ---: | ---: | ---: |
| `packages/vrender-core/src` | 1,725,926 | 1,721,941 | 495,363 | 493,847 | -1,516 |
| `packages/vrender-core/src/common/segment/curve` | 18,421 | 14,436 | 6,705 | 5,189 | -1,516 |
| `common/segment/curve/arc.ts` | 1,214 | 0 | 467 | 0 | -467 |
| `common/segment/curve/ellipse.ts` | 1,636 | 0 | 553 | 0 | -553 |
| `common/segment/curve/move.ts` | 1,135 | 0 | 496 | 0 | -496 |

Verification:

- `rush compile -t @visactor/vrender-core`
- `cd packages/vrender-core && rushx test --runInBand __tests__/unit/common/segment __tests__/unit/public-subpath-exports.test.ts`
- Import graph scan: deleted implementation files had no VRender production source in-edges and were not package export source entries.

Not-tested:

- Did not run `rush build -t @visactor/vrender-core`; local ignored `es` / `cjs` artifacts were not regenerated.
- Did not run full core unit suite; this slice deletes non-public unused implementation stubs and validates compile plus segment/public-subpath coverage.

### 2026-06-01 / BS-P1-007 / Remove stale commented kits source shells

- Commit / branch: `b9b038520 / remerge-d3`
- Package: `@visactor/vrender-kits`
- Build/source scope: `src` TypeScript files
- Command: `node <<'NODE' ... filesystem size ledger with zlib.gzipSync(level=9) ... NODE`
- Data source: local filesystem file sizes; gzip is per-file gzip summed by group, not bundled gzip

Owner judgment:

- 现象：kits 仍包含一组全注释、无 active source 入边、未由 package exports 暴露的旧壳文件；其中 `tools/dynamicTexture.ts` 是旧草稿，正式动态纹理能力在 `tools/dynamicTexture/effect.ts`。
- 证据文件：`tools/dynamicTexture.ts`、`env/contributions/module.ts`、`window/contributions/native-contribution.ts`、`node-bind.ts`、`render/contributions/render-module.ts`、`picker/index.ts`、`index-node.ts`。
- 为什么属于 VRender 自身内容大小问题：这些文件只增加 kits package source content，不参与 installers、register、env、picker、render 或 dynamicTexture effect 的运行时装配。
- Root/default 影响：不影响；root 仍导出 `tools/dynamicTexture/effect`、register、picker contribution modules 和 full installers。
- 预期收益：减少 kits source 内容 11,837 raw / 2,902 gzip；后续 clean build 后 ignored `es` / `cjs` 的对应 stub 产物会自然消失。
- 风险：极少数绕过 package exports 的非公开 source deep import 会失败；这些路径不属于稳定 public API。

Before / after:

| group/file | before raw | after raw | before gzip | after gzip | delta gzip |
| --- | ---: | ---: | ---: | ---: | ---: |
| `packages/vrender-kits/src` | 450,076 | 438,239 | 139,733 | 136,831 | -2,902 |
| stale commented kits source shells | 11,698 | 0 | 2,830 | 0 | -2,830 |
| `packages/vrender-kits/src/index-node.ts` stale comments | 4,041 | 3,902 | 684 | 612 | -72 |
| `tools/dynamicTexture.ts` | 6,828 | 0 | 1,290 | 0 | -1,290 |
| `env/contributions/module.ts` | 2,507 | 0 | 450 | 0 | -450 |
| `window/contributions/native-contribution.ts` | 1,700 | 0 | 667 | 0 | -667 |
| `node-bind.ts` | 410 | 0 | 221 | 0 | -221 |
| `render/contributions/render-module.ts` | 183 | 0 | 137 | 0 | -137 |
| `picker/index.ts` | 70 | 0 | 65 | 0 | -65 |

Verification:

- `rush compile -t @visactor/vrender-kits`
- `cd packages/vrender-kits && rushx test --runInBand __tests__/tools/dynamicTexture/effect.test.ts`
- Import graph scan: deleted files had no active VRender source in-edges and were not package export source entries.

Not-tested:

- Did not run `rush build -t @visactor/vrender-kits`; local ignored `es` / `cjs` artifacts were not regenerated.
- Did not run full kits unit suite; this slice deletes non-public all-comment source shells and validates compile plus dynamicTexture effect coverage.

### 2026-06-01 / BS-P0-004 / Split basic custom animate registration

- Commit / branch: `this commit / remerge-d3`
- Package: `@visactor/vrender-animate`
- Build/source scope: `src` package files plus TypeScript import closures for custom register entries
- Command: `node <<'NODE' ... filesystem size ledger and local TS import closure with zlib.gzipSync(default) ... NODE`
- Data source: local filesystem file sizes; gzip is per-file gzip summed by group / closure, not bundled gzip

Owner judgment:

- 现象：`custom/register.ts` 是 full custom 入口，同时承载基础 built-in custom 动画与 story/richtext/poptip/label item/motion path/streamLight/disappear effects 等 optional 能力；只需要基础 custom 动画的调用方没有稳定窄入口。
- 证据文件：`packages/vrender-animate/src/custom/register.ts`、`packages/vrender-animate/src/custom/*`、`packages/vrender-animate/package.json`、`packages/vrender/src/entries/bootstrap.ts`。
- 为什么属于 VRender 自身内容大小问题：custom/register full closure 当前覆盖 51 个 TS 文件、380,334 raw / 97,497 gzip；其中 basic register 不需要的 optional custom 内容为 22 个文件、214,514 raw / 54,086 gzip。
- Root/default 影响：不影响；`registerCustomAnimate()` 仍先注册 basic，再注册原有 optional built-in custom 动画；root/full bootstrap 行为保持。
- Public API 影响：新增稳定 public subpath `@visactor/vrender-animate/custom/register-basic`，不删除 `custom/register` 或 root exports。
- 预期收益：为 VChart / VTable 或其他上层提供标准基础 custom 注册入口；迁移后可避免 full custom optional closure。当前 package source 因新增入口净增加 614 raw / 238 gzip。
- 风险：只有改用 basic register 的调用方不会自动获得 richtext/poptip/story/disappear/motionPath 等 optional built-in key；full register 无此风险。

Before / after:

| group/file | before raw | after raw | before gzip | after gzip | delta gzip |
| --- | ---: | ---: | ---: | ---: | ---: |
| `packages/vrender-animate/src` | 489,228 | 489,842 | 127,682 | 127,920 | +238 |
| `packages/vrender-animate/src/custom` | 349,478 | 350,092 | 89,737 | 89,975 | +238 |
| `custom/register.ts` source | 7,409 | 4,637 | 1,482 | 1,069 | -413 |
| `custom/register-basic.ts` source | 0 | 3,386 | 0 | 651 | +651 |

Entry closure ledger:

| entry closure | files | raw bytes | gzip bytes |
| --- | ---: | ---: | ---: |
| `custom/register.ts` before | 50 | 379,720 | 97,259 |
| `custom/register.ts` after | 51 | 380,334 | 97,497 |
| `custom/register-basic.ts` after | 29 | 165,820 | 43,411 |
| optional custom content avoided by `custom/register-basic` vs full | 22 | 214,514 | 54,086 |

Verification:

- `rush compile -t @visactor/vrender-animate`
- `cd packages/vrender-animate && rushx test --runInBand __tests__/unit/custom-register-split.test.ts __tests__/unit/custom-appear-static-truth.test.ts __tests__/unit/animation-runtime-attribute.test.ts __tests__/unit/animate-tracking.test.ts __tests__/unit/graphic-state-extension.test.ts`
- `cd packages/vrender && rushx test --runInBand __tests__/unit/public-subpath-exports.test.ts`

Not-tested:

- Did not run `rush build -t @visactor/vrender-animate`; local ignored `es` / `cjs` artifacts were not regenerated.
- Did not migrate VChart / VTable to `custom/register-basic`; this slice only provides the VRender-owned standard subpath and locks full/default behavior.

### 2026-06-01 / BS-P0-004 / Split disappear custom animate registration

- Commit / branch: `this commit / remerge-d3`
- Package: `@visactor/vrender-animate`
- Build/source scope: `src` package files plus TypeScript import closures for custom register entries
- Command: `node <<'NODE' ... filesystem size ledger and local TS import closure with zlib.gzipSync(level=9) ... NODE`
- Data source: local filesystem file sizes; gzip is per-file gzip summed by group / closure, not bundled gzip

Owner judgment:

- 现象：`custom/register.ts` 的 remaining optional 内容中，disappear effects 是最大自包含分组；直接源码约 108,308 raw / 27,855 gzip，且包含 shader / image-process / stage-effect 类能力。
- 证据文件：`packages/vrender-animate/src/custom/register.ts`、`packages/vrender-animate/src/custom/register-disappear.ts`、`packages/vrender-animate/src/custom/disappear/*`、`packages/vrender-animate/package.json`。
- 为什么属于 VRender 自身内容大小问题：full custom register 当前把退场特效和 story/richtext/poptip 等其他 optional 能力绑定在一起；只需要 disappear effects 的调用方没有稳定窄入口。
- Root/default 影响：不影响；`registerCustomAnimate()` 仍注册原有 disappear built-in keys，只是改为调用 `registerDisappearCustomAnimate()`。
- Public API 影响：新增稳定 public subpath `@visactor/vrender-animate/custom/register-disappear`，不删除 `custom/register` 或 root exports。
- 预期收益：为只需要 disappear effects 的调用方提供标准入口；迁移后可避免非 disappear custom closure 30 files / 191,597 raw / 48,975 gzip。当前 package source 因新增入口净增加 326 raw / 184 gzip。
- 风险：只有改用 disappear-only register 的调用方不会自动获得 basic/story/richtext/poptip/motionPath 等 built-in key；full register 无此风险。

Before / after:

| group/file | before raw | after raw | before gzip | after gzip | delta gzip |
| --- | ---: | ---: | ---: | ---: | ---: |
| `packages/vrender-animate/src` | 489,842 | 490,168 | 127,920 | 128,104 | +184 |
| `packages/vrender-animate/src/custom` | 350,092 | 350,418 | 89,975 | 90,159 | +184 |
| `custom/register.ts` source | 4,637 | 3,932 | 1,069 | 952 | -117 |
| `custom/register-disappear.ts` source | 0 | 1,031 | 0 | 301 | +301 |

Entry closure ledger:

| entry closure | files | raw bytes | gzip bytes |
| --- | ---: | ---: | ---: |
| `custom/register.ts` before | 51 | 380,334 | 97,497 |
| `custom/register.ts` after | 52 | 380,660 | 97,681 |
| `custom/register-disappear.ts` after | 22 | 189,063 | 48,706 |
| non-disappear custom content avoided by `custom/register-disappear` vs full | 30 | 191,597 | 48,975 |

Verification:

- `rush compile -t @visactor/vrender-animate`
- `cd packages/vrender-animate && rushx test --runInBand __tests__/unit/custom-register-split.test.ts __tests__/unit/animation-runtime-attribute.test.ts`
- `cd packages/vrender && rushx test --runInBand __tests__/unit/public-subpath-exports.test.ts`

Not-tested:

- Did not run `rush build -t @visactor/vrender-animate`; local ignored `es` / `cjs` artifacts were not regenerated.
- Did not migrate VChart / VTable to `custom/register-disappear`; this slice only provides the VRender-owned standard subpath and locks full/default behavior.

### 2026-06-01 / BS-P0-004 / Split richtext custom animate registration

- Commit / branch: `this commit / remerge-d3`
- Package: `@visactor/vrender-animate`
- Build/source scope: `src` package files plus TypeScript import closures for custom register entries
- Command: `node <<'NODE' ... filesystem size ledger and local TS import closure with zlib.gzipSync(level=9) ... NODE`
- Data source: local filesystem file sizes; gzip is per-file gzip summed by group / closure, not bundled gzip

Owner judgment:

- 现象：`custom/register.ts` 仍直接注册 text/richtext input/output 动画；这组直接源码约 45,540 raw / 14,222 gzip，且对基础图表动画不是硬必需。
- 证据文件：`packages/vrender-animate/src/custom/register.ts`、`packages/vrender-animate/src/custom/register-richtext.ts`、`packages/vrender-animate/src/custom/input-text.ts`、`packages/vrender-animate/src/custom/richtext/*`、`packages/vrender-animate/package.json`。
- 为什么属于 VRender 自身内容大小问题：full custom register 当前把 text/richtext 动画和 story/poptip/disappear 等其他 optional 能力绑定在一起；只需要 text/richtext 动画的调用方没有稳定窄入口。
- Root/default 影响：不影响；`registerCustomAnimate()` 仍注册原有 text/richtext built-in keys，只是改为调用 `registerRichTextCustomAnimate()`。
- Public API 影响：新增稳定 public subpath `@visactor/vrender-animate/custom/register-richtext`，不删除 `custom/register` 或 root exports。
- 预期收益：为只需要 text/richtext 动画的调用方提供标准入口；迁移后可避免非 richtext custom closure 36 files / 254,869 raw / 62,842 gzip。当前 package source 因新增入口净增加 348 raw / 194 gzip。
- 风险：只有改用 richtext-only register 的调用方不会自动获得 basic/story/poptip/disappear/motionPath 等 built-in key；full register 无此风险。`poptip` / `label-item` 内部仍会间接依赖 `InputText`，本轮不试图从 full closure 中强行删除该实现。

Before / after:

| group/file | before raw | after raw | before gzip | after gzip | delta gzip |
| --- | ---: | ---: | ---: | ---: | ---: |
| `packages/vrender-animate/src` | 490,168 | 490,516 | 128,104 | 128,298 | +194 |
| `packages/vrender-animate/src/custom` | 350,418 | 350,766 | 90,159 | 90,353 | +194 |
| `custom/register.ts` source | 3,932 | 3,405 | 952 | 885 | -67 |
| `custom/register-richtext.ts` source | 0 | 875 | 0 | 261 | +261 |

Entry closure ledger:

| entry closure | files | raw bytes | gzip bytes |
| --- | ---: | ---: | ---: |
| `custom/register.ts` before | 52 | 380,660 | 97,681 |
| `custom/register.ts` after | 53 | 381,008 | 97,875 |
| `custom/register-richtext.ts` after | 17 | 126,139 | 35,033 |
| non-richtext custom content avoided by `custom/register-richtext` vs full | 36 | 254,869 | 62,842 |

Verification:

- `rush compile -t @visactor/vrender-animate`
- `cd packages/vrender-animate && rushx test --runInBand __tests__/unit/custom-register-split.test.ts __tests__/unit/custom-appear-static-truth.test.ts __tests__/unit/animation-runtime-attribute.test.ts`
- `cd packages/vrender && rushx test --runInBand __tests__/unit/public-subpath-exports.test.ts`

Not-tested:

- Did not run `rush build -t @visactor/vrender-animate`; local ignored `es` / `cjs` artifacts were not regenerated.
- Did not migrate VChart / VTable to `custom/register-richtext`; this slice only provides the VRender-owned standard subpath and locks full/default behavior.

### 2026-06-02 / BS-P0-004 / Split story custom animate registration

- Commit / branch: `this commit / remerge-d3`
- Package: `@visactor/vrender-animate`
- Build/source scope: `src` package files plus TypeScript import closures for custom register entries
- Command: `node <<'NODE' ... filesystem size ledger and local TS import closure with zlib.gzipSync(level=9) ... NODE`
- Data source: local filesystem file sizes; gzip is per-file gzip summed by group / closure, not bundled gzip

Owner judgment:

- 现象：`custom/register.ts` 仍直接注册 story effects、`MotionPath` 和 `streamLight`；这组直接源码约 46,273 raw / 8,933 gzip，且对基础图表动画不是硬必需。
- 证据文件：`packages/vrender-animate/src/custom/register.ts`、`packages/vrender-animate/src/custom/register-story.ts`、`packages/vrender-animate/src/custom/story.ts`、`packages/vrender-animate/src/custom/motionPath.ts`、`packages/vrender-animate/src/custom/streamLight.ts`、`packages/vrender-animate/package.json`。
- 为什么属于 VRender 自身内容大小问题：full custom register 当前把 story/effect 动画和 basic/richtext/disappear/poptip/label item 等其他 custom 能力绑定在一起；只需要 story effects、MotionPath 或 streamLight 的调用方没有稳定窄入口。
- Root/default 影响：不影响；`registerCustomAnimate()` 仍注册原有 story/effect built-in keys，只是改为调用 `registerStoryCustomAnimate()`。
- Public API 影响：新增稳定 public subpath `@visactor/vrender-animate/custom/register-story`，不删除 `custom/register` 或 root exports。
- 预期收益：为只需要 story/effect 动画的调用方提供标准入口；迁移后可避免非 story custom closure 39 files / 254,740 raw / 68,298 gzip。当前 package source 因新增入口净增加 314 raw / 143 gzip。
- 风险：只有改用 story-only register 的调用方不会自动获得 basic/richtext/disappear/poptip/label item 等 built-in key；full register 无此风险。`GroupFadeIn` / `GroupFadeOut` 在 full register 中仍保持导出表象，但不是 `register-story` 的 built-in key 注册范围。

Before / after:

| group/file | before raw | after raw | before gzip | after gzip | delta gzip |
| --- | ---: | ---: | ---: | ---: | ---: |
| `packages/vrender-animate/src` | 489,418 | 489,732 | 127,648 | 127,791 | +143 |
| `packages/vrender-animate/src/custom` | 349,668 | 349,982 | 89,703 | 89,846 | +143 |
| `custom/register.ts` source | 3,381 | 2,089 | 883 | 629 | -254 |
| `custom/register-story.ts` source | 0 | 1,606 | 0 | 397 | +397 |

Entry closure ledger:

| entry closure | files | raw bytes | gzip bytes |
| --- | ---: | ---: | ---: |
| `custom/register.ts` before | 52 | 375,383 | 96,132 |
| `custom/register.ts` after | 53 | 375,697 | 96,275 |
| `custom/register-story.ts` after | 14 | 120,957 | 27,977 |
| non-story custom content avoided by `custom/register-story` vs full | 39 | 254,740 | 68,298 |

Verification:

- RED: `cd packages/vrender-animate && rushx test --runInBand __tests__/unit/custom-register-split.test.ts` failed with missing `../../src/custom/register-story`.
- RED: `cd packages/vrender && rushx test --runInBand __tests__/unit/public-subpath-exports.test.ts` failed because `src/custom/register-story.ts` / package export did not exist.
- GREEN: `cd packages/vrender-animate && rushx test --runInBand __tests__/unit/custom-register-split.test.ts`
- GREEN: `cd packages/vrender && rushx test --runInBand __tests__/unit/public-subpath-exports.test.ts`

Not-tested:

- Did not run `rush build -t @visactor/vrender-animate`; local ignored `es` / `cjs` artifacts were not regenerated.
- Did not migrate VChart / VTable to `custom/register-story`; this slice only provides the VRender-owned standard subpath and locks full/default behavior.

### 2026-06-02 / BS-P0-004 / Defer component custom animate registration split

- Commit / branch: `this commit / remerge-d3`
- Package: `@visactor/vrender-animate`
- Build/source scope: stats-only owner decision; no production code change
- Command: local filesystem size ledger and read-only `rg` over VRender / VChart source
- Data source: local filesystem file sizes; gzip is per-file gzip summed by group / closure, not bundled gzip

Owner judgment:

- 现象：full `custom/register.ts` 仍直接注册 `poptipAppear` / `poptipDisappear` / `labelItemAppear` / `labelItemDisappear`。
- 证据文件：`packages/vrender-animate/src/custom/register.ts`、`packages/vrender-animate/src/custom/poptip-animate.ts`、`packages/vrender-animate/src/custom/label-item-animate.ts`、`packages/vrender-components/__tests__/browser/examples/poptip.ts`、`packages/vrender-components/__tests__/browser/examples/story-label-item.ts`。
- Size ledger：component custom 直接源码约 2 files / 9,057 raw / 1,710 gzip；假想 component register closure 约 13 files / 87,939 raw / 22,238 gzip。
- 上层证据：VChart 有 `poptip` 用户开关与 `registerPoptip()` 组件注册，但当前未发现 VChart 源码直接使用 `poptipAppear` / `poptipDisappear` / `labelItemAppear` / `labelItemDisappear` built-in type。
- 为什么属于 VRender 自身内容大小问题：component custom 确实是 full custom register 的 optional tail，但收益需要上层存在 component animate-only profile 才能兑现；当前只新增 register 会继续增加 full/default wrapper 成本。
- Root/default 影响：本轮不改代码，不影响。
- Public API 影响：本轮不新增 `@visactor/vrender-animate/custom/register-component`。
- 结论：暂缓 `register-component`。后续只有在 VChart / VTable 先定义 component animate-only optional profile，或 VRender components 提供明确 component animate bootstrap 时，再按 full 增量 / narrow closure gate 重新领取。

Verification:

- `git diff --check`
- Read-only source scan for VRender component animate type usage.
- Read-only VChart source scan for component animate type usage.

Not-tested:

- Did not run VChart bundle stats; this was a stats-first owner decision, not an implementation slice.

### 2026-06-02 / BS-P0-002 / Remove unused graphic service path proxy bounds helper

- Commit / branch: `this commit / remerge-d3`
- Package: `@visactor/vrender-core`
- Build/source scope: `packages/vrender-core/src/graphic/graphic-service/graphic-service.ts`
- Command: `node <<'NODE' ... fs.readFileSync + zlib.gzipSync ... NODE`
- Data source: local filesystem file size; gzip is per-file gzip, not bundled gzip

Owner judgment:

- 现象：`DefaultGraphicService.updatePathProxyAABBBounds()` 带有 `TODO delete`，但 `IGraphicService` 接口不声明该方法，内部图元使用的是 `Graphic.updatePathProxyAABBBounds()`。
- 证据文件：`packages/vrender-core/src/graphic/graphic-service/graphic-service.ts`、`packages/vrender-core/src/interface/graphic-service.ts`、`packages/vrender-core/src/graphic/graphic.ts`。
- 为什么属于 VRender 自身内容大小问题：这是 core graphic service 中未被内部调用、未纳入 service interface 的旧 helper；删除后同时移除 `BoundsContext` / `renderCommandList` 在该文件中的无效依赖。
- Root/default 影响：不影响；图元 bounds 仍走 `Graphic.updatePathProxyAABBBounds()`。
- Public API 影响：不删除 package export；仅删除 `DefaultGraphicService` 上未接口化的旧 helper。该方法不属于 `IGraphicService` 契约。
- 预期收益：减少 core source 604 raw / 187 gzip。
- 风险：如果外部用户绕过 `IGraphicService`，直接实例化 `DefaultGraphicService` 并调用这个未接口化 helper，会失效；当前内部源码无该调用链。

Before / after:

| file | before raw | after raw | before gzip | after gzip | delta gzip |
| --- | ---: | ---: | ---: | ---: | ---: |
| `graphic/graphic-service/graphic-service.ts` | 13,862 | 13,258 | 3,316 | 3,129 | -187 |

Verification:

- RED: `cd packages/vrender-core && rushx test --runInBand __tests__/unit/graphic/graphic-factory-migration.test.ts` failed because `DefaultGraphicService` still exposed `updatePathProxyAABBBounds`.
- GREEN: `cd packages/vrender-core && rushx test --runInBand __tests__/unit/graphic/graphic-factory-migration.test.ts`
- `rush compile -t @visactor/vrender-core`

Not-tested:

- Did not run full vrender-core unit suite.
- Did not regenerate local ignored `es` / `cjs` build output.

### 2026-06-02 / BS-P0-002 / Move XML parser out of base graphic static closures

- Commit / branch: `this commit / remerge-d3`
- Package: `@visactor/vrender-core`
- Build/source scope: `packages/vrender-core/src/graphic/graphic.ts`, `packages/vrender-core/src/graphic/tools.ts`, `packages/vrender-core/src/common/xml/*`
- Command: local static TS import closure script using `fs.readFileSync` + `zlib.gzipSync`
- Data source: local filesystem source sizes; gzip is per-file gzip summed by closure, not bundled gzip

Owner judgment:

- 现象：`Graphic.parsePath()` 为低频 SVG `symbolType` / `clipConfig.shape` 字符串静态导入完整 XML parser；`graphic/tools.ts` 为 `xul()` 静态导入完整 XML parser，导致普通 `boundStroke` / `verticalLayout` / `genNumberType` 使用也带入 `common/xml`。
- 证据文件：`packages/vrender-core/src/graphic/graphic.ts`、`packages/vrender-core/src/graphic/tools.ts`、`packages/vrender-core/src/common/xml/parser.ts`、`packages/vrender-core/src/common/xml/OrderedObjParser.ts`。
- 为什么属于 VRender 自身内容大小问题：这是 core 基础图元 / 基础工具静态闭包误承载低频 XML/SVG parser 能力；能力属于 VRender 自身 parser 边界，不依赖 VChart bundler workaround。
- Root/default 影响：不影响运行时行为；`@visactor/vrender-core` root 仍 re-export `common/xml`，full/root 仍保留 XMLParser 公共能力。本 slice 的收益主要面向 `graphic/*` 等窄入口和内部基础闭包。
- Public API 影响：不删除 `XMLParser`、`isSvg`、`isXML`；`common/xml/parser` 和 `common/xml` 继续 re-export 原 API。
- 预期收益：`graphic.ts` / `tools.ts` / `text.ts` / `constants.ts` 的基础静态闭包避免完整 XML parser，XML 静态部分从 5 files / 14,263 raw / 5,760 gzip 收缩到轻量判断 1 file / 169 raw / 112 gzip。
- 风险：SVG symbol / clipPath 和 `xul()` 首次实际解析时通过同步 runtime loader 取 `XMLParser`；该路径沿用 core 已有低频 `require()` 模式，需要 build/test 覆盖。

Before / after static XML content in base closures:

| entry closure | before XML files | after XML files | before raw | after raw | before gzip | after gzip | delta gzip |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `graphic/graphic.ts` static imports | 5 | 1 | 14,263 | 169 | 5,760 | 112 | -5,648 |
| `graphic/tools.ts` static imports | 5 | 1 | 14,263 | 169 | 5,760 | 112 | -5,648 |
| `graphic/text.ts` static imports | 5 | 1 | 14,263 | 169 | 5,760 | 112 | -5,648 |
| `graphic/constants.ts` static imports | 5 | 1 | 14,263 | 169 | 5,760 | 112 | -5,648 |

Full runtime capability ledger:

| closure | files | raw bytes | gzip bytes |
| --- | ---: | ---: | ---: |
| `graphic/graphic.ts` before, including runtime `require()` edges | 160 | 743,129 | 225,263 |
| `graphic/graphic.ts` after, including runtime `require()` edges | 160 | 743,600 | 225,462 |
| `graphic/graphic.ts` after, static imports only | 153 | 700,991 | 211,724 |
| `graphic/tools.ts` after, static imports only | 3 | 7,197 | 2,602 |
| `common/xml/index.ts` after, full parser public entry | 6 | 14,329 | 5,846 |

Changed production source direct sizes:

| file | before raw | after raw | before gzip | after gzip | delta gzip |
| --- | ---: | ---: | ---: | ---: | ---: |
| `common/xml/parser.ts` | 2,035 | 1,932 | 1,077 | 1,051 | -26 |
| `common/xml/is-xml.ts` | 0 | 169 | 0 | 112 | +112 |
| `graphic/graphic.ts` | 98,192 | 98,403 | 20,850 | 20,908 | +58 |
| `graphic/tools.ts` | 5,613 | 5,833 | 1,980 | 2,081 | +101 |

Verification:

- Baseline lock: `cd packages/vrender-core && rushx test --runInBand __tests__/unit/graphic/xml-parser-boundary.test.ts`
- GREEN: `cd packages/vrender-core && rushx test --runInBand __tests__/unit/graphic/xml-parser-boundary.test.ts`
- GREEN: `cd packages/vrender-core && rushx test --runInBand __tests__/unit/common/xml/parser.test.ts`

Not-tested:

- Did not run full vrender-core unit suite yet.
- Did not regenerate local ignored `es` / `cjs` build output.
- Did not run VChart stats; root/full still re-exports XML, so VChart only benefits after adopting narrower VRender entries or profiles.

### 2026-06-02 / BS-P1-009 / Defer path-svg parser split after morph reachability check

- Commit / branch: `this commit / remerge-d3`
- Package: `@visactor/vrender-core`, `@visactor/vrender-animate`
- Build/source scope: stats-only owner decision; no production code change
- Command: read-only `rg` plus local static TS import closure script using `fs.readFileSync` + `zlib.gzipSync`
- Data source: local filesystem source sizes; gzip is per-file gzip summed by file / closure, not bundled gzip

Owner judgment:

- 现象：`common/path-svg.ts` 看起来像 SVG 解析能力，但它实际承载 `enumCommandMap` 和 path string command tokenizer，是 `CustomPath2D` 的基础依赖。
- 证据文件：`packages/vrender-core/src/common/path-svg.ts`、`packages/vrender-core/src/common/custom-path2d.ts`、`packages/vrender-core/src/common/morphing-utils.ts`、`packages/vrender-core/src/common/split-path.ts`、`packages/vrender-animate/src/custom/morphing.ts`、`packages/vrender-animate/src/custom/motionPath.ts`、`packages/vrender-animate/src/custom/streamLight.ts`。
- morph / animation 证据：`morphing-utils.pathToBezierCurves()` 会通过 `CustomPath2D.fromString()` 复用 path string 解析；`MotionPath`、`streamLight`、`easing-func` 和 animate morphing 都以 `CustomPath2D` / path curve 为基础能力。
- 为什么暂不作为 VRender P0 代码优化：`path-svg.ts` 直接大小只有 3,569 raw / 1,735 gzip；拆它会碰到 `CustomPath2D` command enum、path string 解析、morphing-utils、split-path 和 path/symbol 图元基础行为，收益不清晰但风险跨 core/animate。
- Root/default 影响：本轮不改代码，不影响 root/default。
- Public API 影响：不新增或删除 subpath；`@visactor/vrender-core/path` 仍提供 `CustomPath2D` / `CurveContext` / `divideCubic`。
- 结论：暂停 `path-svg` / `CustomPath2D.fromString()` 拆分。后续只有在证明某个基础 entry 静态带入 path parser 但无需 path string / morph / MotionPath / streamLight 时，再重新领取；否则优先转向 3D、builtin-symbol、components/media optional 等更清晰候选。

Direct file ledger:

| file | raw bytes | gzip bytes |
| --- | ---: | ---: |
| `common/path-svg.ts` | 3,569 | 1,735 |
| `common/custom-path2d.ts` | 23,700 | 4,959 |
| `common/morphing-utils.ts` | 14,716 | 4,761 |
| `common/split-path.ts` | 11,458 | 3,007 |
| `src/path.ts` | 255 | 156 |
| `src/svg.ts` | 55 | 75 |
| `animate/custom/morphing.ts` | 22,079 | 5,368 |
| `animate/custom/motionPath.ts` | 2,250 | 829 |
| `animate/custom/streamLight.ts` | 10,318 | 2,818 |
| `animate/utils/easing-func.ts` | 333 | 224 |

Static closure ledger:

| entry closure | files | raw bytes | gzip bytes | path parser / morph note |
| --- | ---: | ---: | ---: | --- |
| `@visactor/vrender-core/path` (`src/path.ts`) | 24 | 103,224 | 34,113 | includes `CustomPath2D` and `path-svg` |
| `common/custom-path2d.ts` | 23 | 102,969 | 33,957 | includes `path-svg` as base command parser |
| `common/morphing-utils.ts` | 24 | 117,685 | 38,718 | includes `CustomPath2D` + `path-svg` |
| `common/split-path.ts` | 26 | 129,873 | 42,050 | includes morphing-utils + `CustomPath2D` |
| `graphic/path.ts` | 156 | 714,736 | 215,885 | path graphic naturally includes `CustomPath2D` |
| `graphic/symbol.ts` | 156 | 716,248 | 216,305 | custom symbol strings naturally include `CustomPath2D` |
| `src/svg.ts` | 2 | 13,363 | 3,920 | current subpath is `GradientParser`, not path parser |

Verification:

- Read-only source scan for `path-svg`, `CustomPath2D`, morphing, MotionPath and streamLight usage.
- Local static import closure ledger for path / custom-path / morphing / split-path / path graphic / symbol graphic / svg subpath.

Not-tested:

- No compile or unit test run for this docs-only owner decision.
- Did not run VChart stats; this decision explicitly avoids VChart as owner evidence.

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
