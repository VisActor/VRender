# VRender 1.1.0 代码增加说明与包体积报告

> 文档类型：code delta / bundle size report
> 生成日期：2026-06-12
> 对比对象：当前 `remerge-d3` 本地 pack output vs 线上 npm/bnpm `1.0.46`

## 结论

最近包体积专项的代码改动本身是净删除：相对 `origin/remerge-d3`，受影响 packages 下共有 47 个文件变化，`710 insertions / 2097 deletions`。删除主要集中在 core/kits dead source、未发布草稿和旧路径收口；新增主要集中在 animate/components 的 public register/subpath 和测试文档。

但当前分支相对线上 `1.0.46` 的 npm package 并不是全部下降。原因是本报告对比的是完整 1.1.0 发版候选包，包含稳定状态/动画语义、app-scoped runtime、多端 entries/installers、dist/es/cjs/map/types 等全部发布内容。

包级结论：

- `@visactor/vrender-core`：pack tgz 下降 `3,113` bytes，unpacked 下降 `23,369` bytes，逐文件 gzip sum 下降 `76,466` bytes。
- `@visactor/vrender-animate`：pack tgz 增加 `79,598` bytes，主要来自 dist/custom/executor/state。
- `@visactor/vrender-components`：pack tgz 增加 `34,107` bytes，主要来自 dist、label、animation、axis/marker 和 package exports。
- `@visactor/vrender-kits`：pack tgz 增加 `151,091` bytes，是最大增长包，主要来自 app/env/installers/dist。
- `@visactor/vrender`：pack tgz 增加 `87,185` bytes，主要来自新增 `entries` 与 dist。

## 对比口径

本报告只采用 npm pack 文件集，不扫描本地包目录。直接扫描包目录会误把 `coverage`、`.rollup.cache`、`rush-logs` 等未发布文件算入体积，不能作为发版依据。

本地包：

```bash
npm pack --json --dry-run ./packages/<pkg>
```

线上包：

```bash
npm pack --json @visactor/<pkg>@1.0.46
```

gzip：

```text
对 pack files[] 中每个文件执行 zlib.gzipSync(level=9)，再按 package/category/dir 求和。
```

## NPM Pack 总表

| package | local tgz | online tgz | delta | local unpacked | online unpacked | delta | local files | online files | delta |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `vrender-core` | 1,617,414 | 1,620,527 | -3,113 | 10,757,945 | 10,781,314 | -23,369 | 2,439 | 2,547 | -108 |
| `vrender-animate` | 427,698 | 348,100 | +79,598 | 3,428,211 | 2,982,495 | +445,716 | 423 | 411 | +12 |
| `vrender-components` | 1,216,983 | 1,182,876 | +34,107 | 7,417,114 | 7,153,977 | +263,137 | 1,437 | 1,419 | +18 |
| `vrender-kits` | 617,700 | 466,609 | +151,091 | 4,108,778 | 3,232,877 | +875,901 | 1,215 | 1,167 | +48 |
| `vrender` | 1,575,173 | 1,487,988 | +87,185 | 8,068,695 | 7,623,473 | +445,222 | 95 | 11 | +84 |

## 逐文件 gzip Sum

| package | local file gzip sum | online file gzip sum | delta |
| --- | ---: | ---: | ---: |
| `vrender-core` | 2,710,227 | 2,786,693 | -76,466 |
| `vrender-animate` | 746,424 | 650,815 | +95,609 |
| `vrender-components` | 1,790,190 | 1,729,559 | +60,631 |
| `vrender-kits` | 1,090,069 | 948,156 | +141,913 |
| `vrender` | 1,609,894 | 1,481,125 | +128,769 |

## Category Delta

| package | README gzip | dts gzip | js gzip | map gzip | package.json gzip | total gzip delta |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `vrender-core` | 0 | -7,620 | -21,854 | -47,981 | +989 | -76,466 |
| `vrender-animate` | +445 | +2,656 | +65,883 | +25,697 | +928 | +95,609 |
| `vrender-components` | +118 | +3,004 | +32,520 | +23,458 | +1,531 | +60,631 |
| `vrender-kits` | 0 | +4,908 | +95,890 | +40,098 | +1,017 | +141,913 |
| `vrender` | 0 | +6,778 | +91,731 | +29,972 | +288 | +128,769 |

说明：

- `.map` / `.d.ts` 会影响 npm unpacked 和逐文件 gzip sum，但通常不会进入业务 runtime bundle。
- `package.json` 增长主要来自 public exports 增加，业务 bundle 影响很小。
- runtime bundle 仍应看 VChart/VTable stats 和 final min gzip。

## Top Module Delta

### `@visactor/vrender-core`

| dir | raw delta | gzip delta | file delta | 判断 |
| --- | ---: | ---: | ---: | --- |
| `cjs/common` | -424,956 | -131,461 | -183 | common/reflect/dead source 删除 |
| `es/common` | -390,335 | -118,349 | -183 | common/reflect/dead source 删除 |
| `cjs/graphic` | +272,117 | +54,430 | +30 | graphic/state 稳定语义成本 |
| `es/graphic` | +262,347 | +52,481 | +30 | graphic/state 稳定语义成本 |
| `dist/index.es.js` | +89,678 | +14,850 | 0 | dist bundle 变化 |
| `cjs/entries` | +44,604 | +13,735 | +21 | app/env entries |
| `es/entries` | +42,050 | +12,634 | +21 | app/env entries |
| `es/render` | -32,853 | -10,953 | 0 | render 内容下降 |
| `cjs/render` | -29,545 | -9,988 | 0 | render 内容下降 |

core 结论：graphic/entries 增长存在，但 common/render 等下降更多，包级整体下降。

### `@visactor/vrender-animate`

| dir | raw delta | gzip delta | file delta | 判断 |
| --- | ---: | ---: | ---: | --- |
| `dist/index.es.js` | +271,355 | +52,630 | 0 | animation runtime 与 full bundle 成本 |
| `cjs/custom` | +37,476 | +11,430 | +6 | custom register 分层 |
| `es/custom` | +37,238 | +11,144 | +6 | custom register 分层 |
| `cjs/executor` | +21,704 | +3,508 | 0 | update/state animation 执行成本 |
| `es/executor` | +21,675 | +3,501 | 0 | update/state animation 执行成本 |
| `cjs/state` | +9,318 | +2,076 | 0 | AnimationStateManager 兼容和状态动画 |
| `es/state` | +9,300 | +2,075 | 0 | AnimationStateManager 兼容和状态动画 |

animate 结论：增长主要是 1.1.0 runtime/target contract 和 optional custom public register 的成本。narrow register 让上层有能力避开 full custom，但 full/default 仍保持兼容。

### `@visactor/vrender-components`

| dir | raw delta | gzip delta | file delta | 判断 |
| --- | ---: | ---: | ---: | --- |
| `dist/index.es.js` | +79,644 | +21,700 | 0 | dist bundle 变化 |
| `cjs/label` | +27,217 | +5,279 | 0 | label layout/static truth 对齐 |
| `es/label` | +27,315 | +5,235 | 0 | label layout/static truth 对齐 |
| `cjs/animation` | +9,749 | +3,646 | +6 | component animate public surface |
| `es/animation` | +9,170 | +3,378 | +6 | component animate public surface |
| `cjs/axis` | +13,683 | +2,971 | 0 | axis runtime 变化 |
| `cjs/marker` | +13,865 | +2,968 | 0 | marker runtime 变化 |
| `package.json` | +13,567 | +1,531 | 0 | public subpath exports |

components 结论：增长不是单纯来自 subpath 文档；label/axis/marker 也有真实 runtime 变化。public subpath 增加的 `package.json` gzip 约 1.5KB，换来上层未来可按组件 profile 避开 root。

### `@visactor/vrender-kits`

| dir | raw delta | gzip delta | file delta | 判断 |
| --- | ---: | ---: | ---: | --- |
| `dist/index.es.js` | +651,395 | +115,256 | 0 | app-scoped runtime / full dist 变化 |
| `cjs/installers` | +86,406 | +18,745 | +15 | env/app installers |
| `es/installers` | +88,303 | +18,630 | +15 | env/app installers |
| `es/picker` | -29,539 | -12,493 | 0 | picker 内容下降 |
| `cjs/picker` | -26,054 | -10,900 | 0 | picker 内容下降 |
| `cjs/env` | +32,971 | +6,389 | +3 | env runtime |
| `es/env` | +32,098 | +5,949 | +3 | env runtime |
| `es/canvas` | -11,648 | -4,692 | 0 | canvas 内容下降 |
| `cjs/canvas` | -11,081 | -4,375 | 0 | canvas 内容下降 |

kits 结论：这是当前最大增长 owner。增长主要是多环境 app/installers/full dist，不是 gif/lottie 回流；picker/canvas/render 反而下降。下一轮高价值方向应是 env-selected / browser-only installer profile，而不是继续拆单个小 parser。

### `@visactor/vrender`

| dir | raw delta | gzip delta | file delta | 判断 |
| --- | ---: | ---: | ---: | --- |
| `cjs/entries` | +93,848 | +27,929 | +39 | 新增 runtime entries |
| `dist/index.js` | +101,174 | +26,244 | 0 | root dist 变化 |
| `es/entries` | +88,021 | +25,692 | +39 | 新增 runtime entries |
| `dist/index.es.js` | +88,978 | +25,531 | 0 | root dist 变化 |
| `dist/index.min.js` | +74,754 | +22,682 | 0 | root min dist 变化 |

vrender 结论：线上 `1.0.46` 主包只有 11 个 pack 文件，本地候选有 95 个 pack 文件。增长主要来自公开 entries 和 dist，而不是内部 dead source。

## 最近包体积专项代码影响

相对 `origin/remerge-d3..HEAD`，受影响 packages 的 diff 摘要：

```text
47 files changed, 710 insertions(+), 2097 deletions(-)
```

主要删除：

- `packages/vrender-core/src/common/Reflect-metadata.ts`
- `packages/vrender-core/src/common/segment/curve/{arc,ellipse,move}.ts`
- `packages/vrender-core/src/interface/theme-service.ts`
- `packages/vrender-core/src/plugins/builtin-plugin/poptip-plugin.ts`
- `packages/vrender-kits/src/tools/dynamicTexture.ts`
- `packages/vrender-kits/src/env/contributions/module.ts`
- `packages/vrender-kits/src/window/contributions/native-contribution.ts`
- commented component animate extension 草稿

主要新增/收口：

- `@visactor/vrender-animate/custom/register-basic`
- `@visactor/vrender-animate/custom/register-richtext`
- `@visactor/vrender-animate/custom/register-disappear`
- `@visactor/vrender-animate/custom/register-story`
- `@visactor/vrender-components` public subpath exports
- XML parser 从 base graphic/tools 静态闭包移到低频 runtime 分支
- public-subpath 和 custom-register split tests

## 为什么包体积会增加

1. 发版候选不是“最近几次包体积优化 commit”的单独结果，而是整个 1.1.0 稳定分支的完整 package。
2. app-scoped runtime 和多端环境入口带来 `kits` / `vrender` 的真实发布内容增加。
3. 状态/动画语义让 animate executor/state/custom 和 core graphic 增加，这部分是功能成本。
4. public subpath/register 会让 full package 多一些 wrapper、exports、types，但它们是上层按需收益的前置能力。
5. npm pack 包含 `.map`、`.d.ts`、dist、es、cjs；业务 final bundle 通常不会包含全部这些发布文件。

## 为什么仍然有继续优化价值

当前 VChart 场景样本显示：

| scenario | final min gzip | core | components | kits | animate | vutils |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| empty | 234,952 | 236,829 | 944 | 38,752 | 24,692 | 32,589 |
| line | 366,123 | 237,096 | 73,784 | 38,752 | 36,855 | 42,125 |
| pie | 322,864 | 236,882 | 49,315 | 38,752 | 28,916 | 40,995 |
| simple | 388,141 | 237,096 | 81,575 | 38,752 | 42,256 | 42,839 |
| full | 646,668 | 237,499 | 149,228 | 69,250 | 74,760 | 85,846 |

`full - line` 中 components / kits / animate 分别多出约 `75KB / 30KB / 38KB` analyzer gzip，说明 optional profile 仍有场景价值。但后续任务必须先证明上层如何使用、用户如何选择、final bundle 是否下降。

## 下一步建议

1. 先让 VChart agent 用同一 stats 口径验证 components public subpath 的实际收益。
2. 下一候选高价值 VRender slice 是 `kits` env-selected / browser-only installer，而不是 `path-svg` 这类小而高风险 parser。
3. animate custom 暂不继续新增窄 register，除非上层先定义 component-only profile。
4. components 下一步看 axis/label/legend family entry 是否过宽，但必须有 VChart 场景收益证明。
5. VTable 继续用 VChart 作为代理；只有 table-only env/component 任务才补专门 stats。
