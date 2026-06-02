# VRender 包体积优化 Backlog

> 文档类型：后续编码 agent 候选任务池
> 当前状态：candidate / needs-stats 为主，不代表优化已完成

## 优先级标准

P0 必须同时满足：

- 低风险。
- 可验证。
- 不破坏 root/default 行为。
- 明确减少 VRender 自身内容大小，或能把 optional 能力从默认内容路径中分离。
- 不需要大改架构。

收益等级：

- High：预期影响 VRender 自身主要 package / module group 的内容大小。
- Medium：影响常见 optional 组件、full 入口或需要上层配合的外部 bundle。
- Low：主要是 import hygiene 或小模块。
- Unknown：需要 VRender size ledger / analyzer 证明。

当前执行口径：

- 下一轮优化主线是 VRender 自身内容大小，不再把 VChart bundler resolve 作为主矛盾。
- VChart line/simple stats 只作为外部 smoke 或回归参照。
- 入口 / 环境解析问题已完成主要梳理；除非出现回归，否则不作为 P0 领取优先项。

## 分类任务视图

本节只按后续执行类别重排任务，不替代下方 Backlog 表。后续逐步开展时，以 Backlog 表的 `当前状态` 和 [baseline](./VRENDER_BUNDLE_BASELINE.md) 的 before/after 记录跟踪进度，不新增分散任务文档。

### A. 基线与度量

| ID | 任务 | 状态 | 进度记录 |
| --- | --- | --- | --- |
| BS-P0-001 | 建立 VRender 自身 package/module/file size ledger | completed 2026-06-01 | 已记录 `src` 与现有 `es` / `cjs` raw/gzip 基线 |
| BS-P2-012 | 验证 `@visactor/vutils` root import 与重复版本实际体积来源 | needs-stats | 先做 analyzer / version 分组，不直接改未公开 deep import |

### B. Core 内容瘦身

| ID | 任务 | 状态 | 进度记录 |
| --- | --- | --- | --- |
| BS-P0-002 | core graphic/common heavy path 内容瘦身审计 | in-progress | 已完成三片 dead-source 清理：累计减少 core source 49,239 raw / 10,872 gzip |
| BS-P1-009 | path/svg/xml parser 低频化 | needs-stats | 需先证明 `Graphic` base / root common 的真实可达链路 |
| BS-P2-011 | builtin-symbol 子集化可行性研究 | candidate | 只做研究和 stats；不能破坏 `symbolType` 兼容 |

### C. 图元 / Renderer / Picker 能力分层

| ID | 任务 | 状态 | 进度记录 |
| --- | --- | --- | --- |
| BS-P0-003 | 图元实现按基础 / optional 能力拆分候选 | candidate | 重点 arc / path / image / richtext / 3D；full/root 行为保持 |
| BS-P1-008 | 3D installer / register 分组与内容隔离 | candidate | lite/optional 不带 3D；full default 保持 |
| BS-P2-013 | image/resource 链路 optional 化 | candidate | 需同时覆盖 image renderer/picker/resource 与组件依赖 |

### D. Animate runtime / custom 分层

| ID | 任务 | 状态 | 进度记录 |
| --- | --- | --- | --- |
| BS-P0-004 | animate custom/runtime 内容分层 | in-progress | 已删除未发布的 commented component animate extension 草稿；已新增 `custom/register-basic`、`custom/register-disappear`、`custom/register-richtext`、`custom/register-story` 标准窄入口；latest source +314 raw / +143 gzip，story-only closure 避免非 story custom 254,740 raw / 68,298 gzip；后续 animate custom 预计只剩 0-1 个窄 register，`register-component` 需先证明上层 profile 收益 |

### E. Components 子入口与 optional 组件

| ID | 任务 | 状态 | 进度记录 |
| --- | --- | --- | --- |
| BS-P1-005 | root-only 组件补稳定 public subpath | candidate | data-zoom、marker、player、slider、scrollbar、title、brush、timeline、radio、checkbox、table-series-number |
| BS-P1-006 | label / axis / legend 子入口宽度复核 | candidate | 优先新增更窄入口，不改变既有 root/family entry |
| BS-P2-014 | richtext optional 化与 tooltip/title/label 拆分 | candidate | 需要 VChart visual/smoke 辅助确认默认外观 |

### F. Kits / Env / Media optional 边界

| ID | 任务 | 状态 | 进度记录 |
| --- | --- | --- | --- |
| BS-P1-007 | media optional installer 内容隔离 | in-progress | 已删除 kits 内未发布的 all-comment media/env 旧壳；累计减少 kits source 11,837 raw / 2,902 gzip；full default 保持 |
| BS-P2-015 | drag / gesture extension 不进入基础 bundle 验证 | needs-stats | 先确认基础路径是否静态带入 |

### G. 上层集成与迁移辅助

| ID | 任务 | 状态 | 进度记录 |
| --- | --- | --- | --- |
| BS-P0-005 | 建立 optional 能力拆分与上层按需加载文档契约 | completed 2026-06-01 | 已新增 optional capability contract 与 on-demand usage guide，要求后续拆分同时交付 VRender public entry、上层接入方式和用户选择语义 |
| BS-P2-010 | 外部消费方 core root imports 替换为 public narrow entries | candidate | VRender 先提供稳定窄入口；VChart/VTable 后续单独迁移 |

## Backlog 表

| ID | 标题 | 所属包 / 模块 | 现象 | 证据文件 | 疑似带入链路 | 是否影响 root/default 行为 | 预期收益 | 风险 | 优先级 | 推荐验证 | 是否需要 VChart / VTable 配合 | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BS-P0-001 | 建立 VRender 自身 package/module size ledger | 全包 / build output | 当前只有 VChart 外部 bundle 视角，缺少 VRender 自身 `src/es/cjs` 文件级内容大小基线 | `packages/*/src`、`packages/*/package.json`、构建产物 | VRender package content -> publish/build output | 不改变行为 | High | Low | P0 | 文件级 raw/gzip 统计；`rush build` 或现有产物；记录到 baseline | 不需要 | completed 2026-06-01 |
| BS-P0-002 | core graphic/common heavy path 内容瘦身审计 | `@visactor/vrender-core` graphic/common | core 是最大内容 owner；Graphic 基类、path/svg/xml/text/richtext/3D 等可能包含可移出基础路径的代码 | `core/src/graphic/graphic.ts`、`common/xml/*`、`path/*`、`svg/*`、`text/*` | core graphic/common 真实代码内容 | 不应改变 root/default 行为；只删除死码或隔离 optional | High | Medium | P0 | core unit/compile；VRender size ledger before/after | 不需要，VChart 只做 smoke | in-progress: dead-source slices 2026-06-01; latest segment curve stubs removed |
| BS-P0-003 | 图元实现按基础/optional 能力拆分候选 | `@visactor/vrender-core` graphics/render/picker | arc/path/image/richtext/3D 等图元内容对全包大小贡献高，需逐个确认是否有内部过度编码或 optional helper 静态绑定 | `graphic/*`、`render/contributions/render/*`、`picker/*`、kits `register-*` | graphic class -> renderer -> picker -> bounds/parser | full/root 能力保持；新增 lite/optional 或删除内部死码 | High | Medium | P0 | 图元专项 tests；renderer/picker tests；size ledger | 不需要，VChart 只做 smoke | candidate |
| BS-P0-004 | animate custom/runtime 内容分层 | `@visactor/vrender-animate` | custom/register、story、richtext、poptip、grow* 等代码量可观；需区分基础 runtime 与 optional custom 内容 | `animate/src/index.ts`、`register.ts`、`custom/register.ts`、`custom/register-basic.ts`、`custom/register-disappear.ts`、`custom/register-richtext.ts`、`custom/register-story.ts`、`custom/*` | animate runtime -> custom implementations | full/root 行为保持；可新增分层 register 或删除死码 | High | Medium | P0 | animate tests；scaleIn fromScale 回归；size ledger | 不需要，VChart 只做 smoke；后续上层可迁移到 basic/disappear/richtext/story register；`register-component` 仅在上层有 component-only optional profile 时再做 | in-progress: component draft removed; `custom/register-basic` / `custom/register-disappear` / `custom/register-richtext` added 2026-06-01; `custom/register-story` added 2026-06-02; remaining animate custom narrow register estimate 0-1 |
| BS-P0-005 | optional 能力拆分与上层按需加载文档契约 | docs / bundle-size | 需要上层按场景迁移才能拿到收益的拆分，如果没有使用指南和用户选择语义，收益无法闭环 | `VRENDER_OPTIONAL_CAPABILITY_CONTRACT.md`、`VRENDER_ON_DEMAND_CAPABILITY_USAGE.md` | VRender public capability -> VChart/VTable bootstrap -> user runtime option | 不影响 root/default；只定义迁移和 review gate | Medium | Low | P0 | 文档 review；后续每个 optional slice 更新 usage guide | 需要 VChart/VTable 后续按配置落地 | completed 2026-06-01 |
| BS-P1-005 | components root-only 组件补稳定 public subpath | `@visactor/vrender-components` package exports | data-zoom、marker、player、slider、scrollbar、title、brush、timeline、radio、checkbox、table-series-number 等缺 package export | `packages/vrender-components/package.json`、`src/index.ts`、各组件 `src/*/index.ts` | root components -> all component content | 不改变 root/default，只新增 exports | Medium | Low-Medium | P1 | components compile/test；可选 VChart 替换后 stats | VChart/VTable 可选配合 | candidate |
| BS-P1-006 | components label / axis / legend 子入口宽度复核 | `@visactor/vrender-components` | 现有子入口仍可能 re-export 过宽，如 axis root、label root、legend root | `src/axis/index.ts`、`src/label/index.ts`、`src/legend/index.ts` | component family root -> family all modules | 不改变 root/default，新增更窄子入口 | Medium | Medium | P1 | 单组件 metafile；components tests | VChart 可选 smoke | candidate |
| BS-P1-007 | media optional installer 内容隔离 | `@visactor/vrender-kits` gif/lottie/rough/dynamicTexture | gif/lottie/rough/dynamicTexture 是可选能力，但源码仍在 kits/full 内容中形成高风险区 | `kits/src/index.ts`、`index-node.ts`、`register-gif.ts`、`render/contributions/rough/*` | kits root/full app -> media optional modules | full default 需保持；新增 optional 推荐路径 | Medium | Medium | P1 | kits tests；media demos；size ledger | VChart 可选 smoke | in-progress: stale commented kits source shells removed 2026-06-01 |
| BS-P1-008 | 3D installer / register 分组与内容隔离 | core/kits 3D | 3D 图元、camera、light、draw interceptor 对 2D 基础能力非必需，但 full/default 需要保持 | `core/src/graphic/*3d.ts`、`core/src/core/camera.ts`、`core/src/core/light.ts`、entries bootstrap | full standard pipeline；root barrel | full default 需保持；lite/optional 不带 | Medium | Medium | P1 | 3D tests；shared/lite tests；size ledger | VChart 视 3D 场景而定 | candidate |
| BS-P1-009 | path/svg/xml parser 低频化 | core common/path/svg/xml | `Graphic` base 和 root common 可能让 XML/SVG/path parser 进入基础内容路径 | `core/src/graphic/graphic.ts`、`common/xml/*`、`path/*`、`svg/*` | core graphic/common -> parser | 可能影响内部契约，需要谨慎 | Medium | Medium-High | P1 | core tests；path/svg/xml tests；size ledger | VChart 可选 smoke | needs-stats |
| BS-P2-010 | 外部消费方 core root imports 替换为 public narrow entries | core root / VChart | VChart 仍有大量 `@visactor/vrender-core` root import，但下一轮不是主矛盾 | VChart `src/compile/compiler.ts`、`src/mark/base/base-mark.ts`、core package exports | VChart -> core root -> full core barrel | 不改变 root/default；可能需新增 VRender exports | Medium | Medium | P2 | VChart compile/test/stats；core subpath tests | 需要 VChart | candidate |
| BS-P2-011 | builtin-symbol 子集化可行性研究 | core symbol | symbol 可能带入全量 builtin symbol | `core/src/graphic/builtin-symbol/*`、`graphic/symbol.ts` | line marker/legend -> symbol -> all symbols | 可能影响 symbolType 兼容 | Unknown | High | P2 | symbol demos/tests；stats | VChart symbol coverage | candidate |
| BS-P2-012 | vutils root import 体积来源验证 | all packages / vutils | 全包 root import vutils，且锁文件有多个版本记录 | `packages/*/src`、lockfile、workspace vutils package | VRender packages -> vutils root | 不应直接改未公开 deep import | Unknown | Medium | P2 | analyzer package/version 分组；pnpm/rush why | 需要 VChart | needs-stats |
| BS-P2-013 | image/resource 链路 optional 化 | core/kits image | image renderer/picker/resource 对基础 line 非必需，但组件 radio/checkbox/table 等可能带入 | `core/src/graphic/image.ts`、`render/image-*`、kits `register-image.ts` | optional components -> image | full default 保持 | Medium | Medium | P2 | image tests；components tests；stats | VChart/VTable 待确认 | candidate |
| BS-P2-014 | richtext optional 化与 tooltip/title/label 拆分 | core/components richtext | richtext 由 tooltip/title/label/tag 等组件 register 带入 | `core/src/graphic/richtext*`、components `tooltip/register.ts`、`title/register.ts`、`label/register.ts` | components -> richtext register | 可能影响默认 tooltip/title 外观 | Medium | Medium-High | P2 | tooltip/title/label tests；VChart visual | 需要 VChart | candidate |
| BS-P2-015 | drag / gesture extension 不进入基础 bundle 验证 | kits event extension | drag/gesture 应显式 opt-in | `kits/src/event/extension/*`、VChart interaction imports | VChart interaction -> kits root or extension barrel | 不改变默认 | Low-Medium | Low | P2 | interaction tests；stats | VChart | needs-stats |

## 当前 P0 领取建议

1. 先做 BS-P0-001：建立 VRender 自身 size ledger，避免下一轮继续被 VChart bundler 口径牵引。
2. 在 size ledger 基础上优先做 BS-P0-002 / BS-P0-003：core 与图元内容是当前最大 owner，且更符合“全包内容大小优化”目标。
3. BS-P0-004 可并行由 animate agent 领取，重点拆基础 runtime 与 optional custom 内容。
4. 入口 / VChart import 替换类事项降为 P1/P2 或 smoke 辅助，除非新的 size ledger 证明它仍是主要内容来源。

## Rejected / 暂缓

| ID | 暂缓项 | 原因 |
| --- | --- | --- |
| BS-R-001 | 删除 root barrel | 破坏 public API，不符合本专项边界 |
| BS-R-002 | 删除 D3 state engine 或 `graphic.animates` 表象 | D3 语义已收敛，且 `graphic.animates` 是兼容表象，不是旧 fallback |
| BS-R-003 | 直接把 vutils 改成未公开 deep import | 需要 vutils public exports 契约，否则维护风险高 |
| BS-R-004 | 从 full/default bootstrap 删除 3D/custom/gif 等能力 | 破坏默认行为；只能新增 lite/optional 路径或确保基础业务不走 full app |
