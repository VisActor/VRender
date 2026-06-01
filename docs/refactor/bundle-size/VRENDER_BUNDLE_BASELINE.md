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
